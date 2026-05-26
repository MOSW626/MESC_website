"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminGuide } from "@/components/admin-guide";

interface BudgetItem {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  receiptUrl: string | null;
}

function formatKRW(amount: number) {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

export default function AdminBudgetPage() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("지출");
  const [category, setCategory] = useState("기타");
  const [receiptUrl, setReceiptUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadItems() {
    const res = await fetch("/api/budget");
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => { loadItems(); }, []);

  async function handleSubmit() {
    if (!description.trim() || !amount) return;
    setSubmitting(true);
    await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, description, amount: Number(amount), type, category, receiptUrl: receiptUrl || null }),
    });
    setDescription(""); setAmount(""); setReceiptUrl("");
    setSubmitting(false);
    loadItems();
  }

  async function handleDelete(id: number) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/budget/${id}`, { method: "DELETE" });
    loadItems();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground">← 대시보드</a>
        <h1 className="text-2xl font-bold">예산 관리</h1>
      </div>

      <AdminGuide id="budget" title="예산 관리 사용법">
        <ol className="list-decimal pl-5 space-y-1">
          <li>날짜 / 내역 / 금액 / 유형(수입·지출) / 카테고리(학생회비·행사·물품·식비·기타)를 입력해 항목을 추가합니다.</li>
          <li>영수증 URL은 선택 — Google Drive 공유 링크나 이미지 호스팅 URL을 붙여넣어 두면 공개 페이지(/budget)에서 영수증 보기가 동작합니다.</li>
          <li>항목별 <strong>삭제</strong> 버튼으로 개별 정리 가능.</li>
        </ol>
        <p className="text-xs">💡 금액은 자동으로 ₩ 포맷으로 표시되며, 수입은 +, 지출은 - 로 합산됩니다.</p>
      </AdminGuide>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">새 항목 입력</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>날짜</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>구분</Label>
              <Select value={type} onValueChange={(v) => v && setType(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="수입">수입</SelectItem>
                  <SelectItem value="지출">지출</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="학생회비">학생회비</SelectItem>
                  <SelectItem value="행사">행사</SelectItem>
                  <SelectItem value="물품">물품</SelectItem>
                  <SelectItem value="식비">식비</SelectItem>
                  <SelectItem value="기타">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>금액 (원)</Label>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>내역 설명</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="예: MT 행사비" />
          </div>
          <div className="space-y-2">
            <Label>영수증 URL (선택)</Label>
            <Input value={receiptUrl} onChange={(e) => setReceiptUrl(e.target.value)} placeholder="https://..." />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "등록 중..." : "항목 등록"}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold mb-4">등록된 항목 ({items.length}건)</h2>
      <div className="space-y-2">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={item.type === "수입" ? "default" : "destructive"} className="text-xs">
                    {item.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{item.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="font-medium truncate">{item.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${item.type === "수입" ? "text-green-600" : "text-red-500"}`}>
                  {item.type === "수입" ? "+" : "-"}{formatKRW(item.amount)}
                </span>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                  삭제
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
