import { NextResponse } from "next/server";

const BUDGET_CSV_URL = process.env.GOOGLE_BUDGET_CSV_URL ?? "";

let cachedData: BudgetData | null = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

interface Transaction {
  date: string;
  manager: string;
  description: string;
  category: string;
  income: number;
  expense: number;
  balance: number;
}

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
}

interface CategorySummary {
  name: string;
  budget: number;
  spent: number;
}

interface BudgetSummary {
  income: number;
  expense: number;
  balance: number;
  monthlyData: MonthlyData[];
  categories: CategorySummary[];
}

interface BudgetData {
  summary: BudgetSummary;
  transactions: Transaction[];
}

/** RFC 4180 호환 CSV 파서 — 따옴표 안의 쉼표/줄바꿈 처리 */
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++; // escaped quote
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field.trim());
        field = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        if (ch === "\r") i++;
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }
  if (field || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }
  return rows;
}

/** ₩ 기호, 쉼표 제거 후 숫자 파싱 */
function parseAmount(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/[₩,\s]/g, "").replace(/[^0-9.-]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

async function fetchBudgetData(): Promise<BudgetData> {
  const now = Date.now();
  if (cachedData && now - cacheTime < CACHE_DURATION) {
    return cachedData;
  }

  if (!BUDGET_CSV_URL) {
    return {
      summary: { income: 0, expense: 0, balance: 0, monthlyData: [], categories: [] },
      transactions: [],
    };
  }

  const res = await fetch(BUDGET_CSV_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("예산 시트를 불러올 수 없습니다.");

  const text = await res.text();
  const rows = parseCSV(text);

  if (rows.length < 2) {
    return {
      summary: { income: 0, expense: 0, balance: 0, monthlyData: [], categories: [] },
      transactions: [],
    };
  }

  // 헤더 행 자동 탐색: "수입" 또는 "지출" 컬럼이 있는 첫 번째 행
  let headerRowIdx = -1;
  let header: string[] = [];
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const normalized = rows[i].map((h) => h.toLowerCase().replace(/\s/g, ""));
    const hasIncome = normalized.some((h) => h.includes("수입") || h.includes("income") || h.includes("입금"));
    const hasExpense = normalized.some((h) => h.includes("지출") || h.includes("expense") || h.includes("출금"));
    if (hasIncome || hasExpense) {
      headerRowIdx = i;
      header = normalized;
      break;
    }
  }

  if (headerRowIdx < 0) {
    return {
      summary: { income: 0, expense: 0, balance: 0, monthlyData: [], categories: [] },
      transactions: [],
    };
  }

  const dataRows = rows.slice(headerRowIdx + 1);

  // 컬럼 인덱스 감지
  const dateIdx = header.findIndex((h) => h.includes("날짜") || h.includes("일자") || h.includes("사업일") || h.includes("date"));
  const managerIdx = header.findIndex((h) => h.includes("담당자") || h.includes("manager") || h.includes("담당"));
  const descIdx = header.findIndex((h) => h.includes("집행내용") || h.includes("내용") || h.includes("description") || h.includes("설명"));
  const categoryIdx = header.findIndex((h) => h.includes("코드") || h.includes("카테고리") || h.includes("category") || h.includes("항목"));
  const incomeIdx = header.findIndex((h) => h.includes("수입") || h.includes("income") || h.includes("입금"));
  const expenseIdx = header.findIndex((h) => h.includes("지출") || h.includes("expense") || h.includes("출금"));
  const balanceIdx = header.findIndex((h) => h.includes("잔액") || h.includes("balance"));

  let totalIncome = 0;
  let totalExpense = 0;
  const monthlyMap: Record<string, MonthlyData> = {};
  const categoryMap: Record<string, CategorySummary> = {};
  const transactions: Transaction[] = [];

  for (const row of dataRows) {
    if (row.every((c) => !c)) continue;
    const rowText = row.join("");
    if (rowText.includes("합계") || rowText.includes("소계") || rowText.includes("계")) continue;

    const incomeVal = incomeIdx >= 0 ? parseAmount(row[incomeIdx] ?? "") : 0;
    const expenseVal = expenseIdx >= 0 ? parseAmount(row[expenseIdx] ?? "") : 0;
    const balanceVal = balanceIdx >= 0 ? parseAmount(row[balanceIdx] ?? "") : 0;
    const categoryName = categoryIdx >= 0 ? (row[categoryIdx] || "기타") : "기타";
    const dateStr = row[dateIdx] ?? "";

    // 데이터 정제: 날짜나 금액이 모두 비어있는 행은 스킵
    if (!dateStr || (incomeVal === 0 && expenseVal === 0)) continue;

    totalIncome += incomeVal;
    totalExpense += expenseVal;

    // 카테고리별 집계
    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = { name: categoryName, budget: 0, spent: 0 };
    }
    categoryMap[categoryName].spent += expenseVal;
    categoryMap[categoryName].budget += incomeVal; // 수입이 곧 해당 항목의 예산으로 잡히는 경우 대비

    // 거래 내역 추가
    transactions.push({
      date: dateStr,
      manager: row[managerIdx] ?? "",
      description: row[descIdx] ?? "",
      category: categoryName,
      income: incomeVal,
      expense: expenseVal,
      balance: balanceVal,
    });

    // 월별 집계
    if (dateIdx >= 0 && row[dateIdx]) {
      const dateStr = row[dateIdx].replace(/\s/g, "");
      const match = dateStr.match(/(\d{4})[./\-]?(\d{2})/);
      if (match) {
        const key = `${match[1]}-${match[2]}`;
        if (!monthlyMap[key]) {
          monthlyMap[key] = { month: key, income: 0, expense: 0 };
        }
        monthlyMap[key].income += incomeVal;
        monthlyMap[key].expense += expenseVal;
      }
    }
  }

  const data: BudgetData = {
    summary: {
      income: totalIncome,
      expense: totalExpense,
      balance: totalIncome - totalExpense,
      monthlyData: Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)),
      categories: Object.values(categoryMap).sort((a, b) => b.spent - a.spent),
    },
    transactions: transactions.reverse(),
  };

  cachedData = data;
  cacheTime = now;
  return data;
}

export async function GET() {
  try {
    const data = await fetchBudgetData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("[budget-summary]", error);
    return NextResponse.json({ error: "예산 데이터를 불러올 수 없습니다." }, { status: 500 });
  }
}
