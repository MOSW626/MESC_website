"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp, Info } from "lucide-react";

interface Props {
  /** localStorage 키 식별자 (페이지마다 다르게). 예: "events", "notices" */
  id: string;
  /** 제목. 기본 "사용 방법" */
  title?: string;
  children: React.ReactNode;
}

/**
 * 관리자 페이지 상단에 표시되는 사용법 안내 카드.
 * 클릭으로 접고/펼치고 — 상태는 localStorage 에 저장되어 다음 방문 시 유지된다.
 */
export function AdminGuide({ id, title = "사용 방법", children }: Props) {
  const key = `admin-guide-${id}-collapsed`;
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setCollapsed(localStorage.getItem(key) === "1");
    setHydrated(true);
  }, [key]);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, next ? "1" : "0");
    }
  }

  // 첫 렌더(SSR/hydration) 시 펼친 상태로 그려서 hydration mismatch 방지
  const showContent = !hydrated || !collapsed;

  return (
    <Card className="mb-6 border-blue-500/30 bg-blue-500/5">
      <CardHeader
        className="cursor-pointer select-none py-3"
        onClick={toggle}
        role="button"
        aria-expanded={showContent}
      >
        <CardTitle className="text-sm flex items-center justify-between gap-2 font-medium">
          <span className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-500" />
            {title}
          </span>
          {showContent ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      {showContent && (
        <CardContent className="text-sm text-muted-foreground space-y-2 pt-0 leading-relaxed">
          {children}
        </CardContent>
      )}
    </Card>
  );
}
