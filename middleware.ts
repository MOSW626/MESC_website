import { NextRequest, NextResponse } from "next/server";
import { enforce, getClientIp } from "@/lib/rate-limit";

/**
 * 전역 API rate-limit 미들웨어.
 *
 * 기본 60req/분, 글쓰기·신고 등 민감 라우트는 더 엄격.
 * (참고: 메모리 맵 기반이라 Vercel multi-instance 환경에서는 인스턴스마다 카운터.
 *  완벽한 분산 처리가 필요하면 Vercel KV/Upstash 등으로 교체.)
 */

const STRICT_PREFIXES = [
  "/api/posts",
  "/api/suggestions",
  "/api/snack-wishes",
  "/api/reports",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // POST/PUT/DELETE/PATCH 만 적용 (GET 은 자유)
  if (req.method === "GET") return NextResponse.next();

  const ip = getClientIp(req);

  // 엄격 라우트
  const strict = STRICT_PREFIXES.some((p) => pathname.startsWith(p));
  const bucket = strict ? "api-strict" : "api-default";
  // 일반 60/분, 엄격(글쓰기·신고) 30/분
  const max = strict ? 30 : 60;
  const window = 60 * 1000;

  const rl = enforce(ip, bucket, max, window);
  if (!rl.ok) {
    return new NextResponse(
      JSON.stringify({ error: `요청이 너무 잦습니다. ${Math.ceil(rl.retryAfter / 1000)}초 후 다시 시도해주세요.` }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.ceil(rl.retryAfter / 1000)),
        },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
