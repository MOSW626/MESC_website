import { handlers } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// IP당 5분에 5회 로그인 시도 제한
const loginRateMap = new Map<string, { count: number; reset: number }>();

function checkLoginLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginRateMap.get(ip);
  if (!entry || now > entry.reset) {
    loginRateMap.set(ip, { count: 1, reset: now + 5 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

export const GET = handlers.GET;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (!checkLoginLimit(ip)) {
    return NextResponse.json(
      { error: "로그인 시도 횟수 초과. 5분 후 다시 시도해주세요." },
      { status: 429 }
    );
  }
  return handlers.POST(req);
}
