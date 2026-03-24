"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Notice {
  id: number;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  createdAt: string;
}

export default function AdminNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("공지");
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function loadNotices() {
    const res = await fetch("/api/notices");
    const data = await res.json();
    setNotices(data);
  }

  useEffect(() => { loadNotices(); }, []);

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) return;
    setSubmitting(true);
    await fetch("/api/notices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category, pinned }),
    });
    setTitle("");
    setContent("");
    setPinned(false);
    setSubmitting(false);
    loadNotices();
  }

  async function handleDelete(id: number) {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/notices/${id}`, { method: "DELETE" });
    loadNotices();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground">← 대시보드</a>
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">새 공지 작성</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>제목</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지 제목" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>카테고리</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="공지">공지</SelectItem>
                  <SelectItem value="행사">행사</SelectItem>
                  <SelectItem value="학사">학사</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>상단 고정</Label>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="pinned" className="text-sm">고정 공지로 설정</label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>내용</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지 내용을 입력하세요"
              rows={6}
            />
          </div>
          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? "등록 중..." : "공지 등록"}
          </Button>
        </CardContent>
      </Card>

      <h2 className="text-lg font-semibold mb-4">등록된 공지 ({notices.length}건)</h2>
      <div className="space-y-2">
        {notices.map((notice) => (
          <Card key={notice.id}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {notice.pinned && <Badge variant="destructive" className="text-xs">📌 고정</Badge>}
                  <Badge variant="secondary" className="text-xs">{notice.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(notice.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
                <p className="font-medium truncate">{notice.title}</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(notice.id)}
              >
                삭제
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
