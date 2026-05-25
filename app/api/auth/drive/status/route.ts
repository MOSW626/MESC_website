import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * Drive 연결 상태 조회. 관리자 페이지가 UI 분기에 사용.
 */
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await prisma.driveAuth.findUnique({ where: { id: 1 } });
  return NextResponse.json({
    connected: !!row?.refreshToken,
    email: row?.email ?? null,
    parentFolderId: row?.parentFolderId ?? null,
    updatedAt: row?.updatedAt ?? null,
  });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { parentFolderId?: string | null };
  const trimmed = (body.parentFolderId ?? "").trim();

  // URL 이 들어왔으면 ID 추출
  const match = trimmed.match(/\/folders\/([A-Za-z0-9_-]+)/);
  const id = match ? match[1] : (/^[A-Za-z0-9_-]{20,}$/.test(trimmed) ? trimmed : null);

  if (trimmed && !id) {
    return NextResponse.json({ error: "올바른 Drive 폴더 URL 또는 ID 가 아닙니다." }, { status: 400 });
  }

  const row = await prisma.driveAuth.findUnique({ where: { id: 1 } });
  if (!row) {
    return NextResponse.json({ error: "먼저 Drive 를 연결해주세요." }, { status: 400 });
  }
  await prisma.driveAuth.update({
    where: { id: 1 },
    data: { parentFolderId: id || null },
  });
  return NextResponse.json({ ok: true, parentFolderId: id || null });
}

export async function DELETE() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.driveAuth.deleteMany({ where: { id: 1 } });
  return NextResponse.json({ ok: true });
}
