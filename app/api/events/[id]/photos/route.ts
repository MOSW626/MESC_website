import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { put } from "@vercel/blob";
import { parseId } from "@/lib/validation";
import { getAccessTokenOrNull, uploadFile, makePublic } from "@/lib/drive-oauth";
import { driveImageUrl } from "@/lib/drive";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 25 * 1024 * 1024; // 25MB (Drive 업로드 고려해 상향)

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const caption = formData.get("caption") as string | null;

  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "이미지 파일만 업로드 가능합니다." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "파일 크기는 25MB 이하여야 합니다." }, { status: 400 });

  // 행사가 Drive 폴더와 연결돼 있으면 Drive 로 업로드, 아니면 Vercel Blob 으로 fallback
  const event = await prisma.event.findUnique({ where: { id }, select: { driveFolderId: true } });
  if (!event) return NextResponse.json({ error: "행사를 찾을 수 없습니다." }, { status: 404 });

  const existingCount = await prisma.eventPhoto.count({ where: { eventId: id } });

  if (event.driveFolderId) {
    const tok = await getAccessTokenOrNull();
    if (!tok) {
      return NextResponse.json(
        { error: "Drive 연결이 끊겼습니다. 관리자 페이지에서 다시 인증해주세요." },
        { status: 401 },
      );
    }
    const uploaded = await uploadFile(tok.accessToken, file, event.driveFolderId);
    // 폴더가 이미 public 이라 파일은 자동 상속. 안전을 위해 한 번 더 명시.
    await makePublic(tok.accessToken, uploaded.id).catch(() => {});

    const photo = await prisma.eventPhoto.create({
      data: {
        eventId: id,
        imageUrl: driveImageUrl(uploaded.id),
        caption: caption ?? file.name,
        order: existingCount,
        source: "drive",
        driveFileId: uploaded.id,
      },
    });
    return NextResponse.json(photo, { status: 201 });
  }

  // Drive 미연결 또는 행사 폴더 없음 → 기존 Vercel Blob 방식
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const blob = await put(`events/${id}/${Date.now()}-${safeName}`, file, { access: "public" });

  const photo = await prisma.eventPhoto.create({
    data: {
      eventId: id,
      imageUrl: blob.url,
      caption: caption ?? null,
      order: existingCount,
      source: "blob",
    },
  });
  return NextResponse.json(photo, { status: 201 });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await params;
  const eventId = parseId(idStr);
  if (!eventId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const { photoId } = await req.json();
  const pid = parseId(String(photoId));
  if (!pid) return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });

  await prisma.eventPhoto.delete({ where: { id: pid, eventId } });
  return NextResponse.json({ ok: true });
}
