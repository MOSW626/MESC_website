import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isValidString, isValidAmount, isValidDate, isAllowedCategory, isValidUrl } from "@/lib/validation";

const ALLOWED_CATEGORIES = ["학생회비", "행사", "운영", "비품", "기타"];
const ALLOWED_TYPES = ["income", "expense"];

export async function GET() {
  const items = await prisma.budgetItem.findMany({
    orderBy: { date: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  if (!isValidDate(b.date)) {
    return NextResponse.json({ error: "올바른 날짜를 입력해주세요." }, { status: 400 });
  }
  if (!isValidString(b.description, 500)) {
    return NextResponse.json({ error: "설명은 1~500자 이내여야 합니다." }, { status: 400 });
  }
  if (!isValidAmount(b.amount)) {
    return NextResponse.json({ error: "올바른 금액을 입력해주세요 (최대 10억)." }, { status: 400 });
  }
  if (!isAllowedCategory(b.type, ALLOWED_TYPES)) {
    return NextResponse.json({ error: "type은 income 또는 expense여야 합니다." }, { status: 400 });
  }

  // receiptUrl이 있으면 URL 검증
  if (b.receiptUrl && b.receiptUrl !== "") {
    if (!isValidUrl(String(b.receiptUrl))) {
      return NextResponse.json({ error: "올바른 영수증 URL을 입력해주세요." }, { status: 400 });
    }
  }

  const category = isAllowedCategory(b.category, ALLOWED_CATEGORIES) ? b.category : "기타";

  const item = await prisma.budgetItem.create({
    data: {
      date: new Date(b.date as string),
      description: (b.description as string).trim(),
      amount: Number(b.amount),
      type: b.type as string,
      category,
      receiptUrl: b.receiptUrl ? String(b.receiptUrl) : null,
    },
  });
  return NextResponse.json(item);
}
