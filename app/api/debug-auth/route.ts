import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ADMIN_USERNAME_SET: !!process.env.ADMIN_USERNAME,
    ADMIN_USERNAME_VALUE: process.env.ADMIN_USERNAME ?? "NOT_SET",
    ADMIN_PASSWORD_SET: !!process.env.ADMIN_PASSWORD,
    AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
    NEXTAUTH_SECRET_SET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? "NOT_SET",
  });
}
