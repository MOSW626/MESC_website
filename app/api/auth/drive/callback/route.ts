import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { exchangeCodeForToken, DriveOAuthError } from "@/lib/drive-oauth";

/**
 * Google consent 후 redirect 도착점. code 를 refresh token 으로 교환해 DB 에 저장한다.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/admin/events?drive_error=${encodeURIComponent(error)}`, url.origin));
  }
  if (!code) {
    return NextResponse.redirect(new URL("/admin/events?drive_error=missing_code", url.origin));
  }

  const cookieState = req.headers.get("cookie")?.match(/drive_oauth_state=([^;]+)/)?.[1];
  if (!cookieState || cookieState !== stateParam) {
    return NextResponse.redirect(new URL("/admin/events?drive_error=state_mismatch", url.origin));
  }

  try {
    const origin = `${url.protocol}//${url.host}`;
    const token = await exchangeCodeForToken(code, origin);

    if (!token.refresh_token) {
      return NextResponse.redirect(
        new URL("/admin/events?drive_error=no_refresh_token", url.origin),
      );
    }

    // 인증한 계정 이메일 조회 (참고용)
    let email: string | null = null;
    try {
      const userinfo = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${token.access_token}` },
      });
      if (userinfo.ok) {
        const data = (await userinfo.json()) as { email?: string };
        email = data.email ?? null;
      }
    } catch {
      // ignore
    }

    await prisma.driveAuth.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        refreshToken: token.refresh_token,
        scope: token.scope,
        email,
      },
      update: {
        refreshToken: token.refresh_token,
        scope: token.scope,
        email,
      },
    });

    const res = NextResponse.redirect(new URL("/admin/events?drive_connected=1", url.origin));
    res.cookies.delete("drive_oauth_state");
    return res;
  } catch (err) {
    const msg = err instanceof DriveOAuthError ? err.message : "OAuth 처리 중 오류";
    return NextResponse.redirect(
      new URL(`/admin/events?drive_error=${encodeURIComponent(msg)}`, url.origin),
    );
  }
}
