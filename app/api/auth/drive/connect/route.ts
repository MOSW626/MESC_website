import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildAuthUrl } from "@/lib/drive-oauth";
import { randomBytes } from "node:crypto";

/**
 * Drive OAuth 인증 시작. 관리자만 호출 가능.
 * Google consent 화면으로 302 redirect.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const origin = `${url.protocol}//${url.host}`;

  const state = randomBytes(16).toString("hex");
  const authUrl = buildAuthUrl(origin, state);

  const res = NextResponse.redirect(authUrl);
  res.cookies.set("drive_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: url.protocol === "https:",
    maxAge: 600,
    path: "/",
  });
  return res;
}
