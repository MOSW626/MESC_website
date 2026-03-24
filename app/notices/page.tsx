"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/lib/language-context";

interface Notice {
  id: number;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  createdAt: string;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [activeCategory, setActiveCategory] = useState("전체");
  const [loading, setLoading] = useState(true);
  const { t, lang } = useLanguage();

  const CATEGORIES = [
    { ko: "전체", label: t("notices.all") },
    { ko: "공지", label: t("notices.notice") },
    { ko: "행사", label: t("notices.event") },
    { ko: "학사", label: t("notices.academic") },
  ];

  useEffect(() => {
    fetch("/api/notices")
      .then((r) => r.json())
      .then((data) => {
        setNotices(data);
        setLoading(false);
      });
  }, []);

  const filtered =
    activeCategory === "전체"
      ? notices
      : notices.filter((n) => n.category === activeCategory);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("notices.title")}</h1>
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
        <TabsList>
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.ko} value={cat.ko}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">{t("notices.loading")}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">{t("notices.empty")}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((notice) => (
            <Link key={notice.id} href={`/notices/${notice.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {notice.pinned && (
                        <Badge variant="destructive" className="text-xs">
                          📌 {t("notices.pinned")}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {notice.category}
                      </Badge>
                    </div>
                    <h2 className="font-semibold truncate">{notice.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {notice.content}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(notice.createdAt).toLocaleDateString(
                      lang === "ko" ? "ko-KR" : "en-US"
                    )}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
