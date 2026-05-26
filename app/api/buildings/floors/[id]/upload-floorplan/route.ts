import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseId } from "@/lib/validation";
import { ensureSubfolder, getAccessTokenOrNull, uploadFile, makePublic, DriveOAuthError } from "@/lib/drive-oauth";
import { driveImageUrl } from "@/lib/drive";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 30 * 1024 * 1024; // 30MB — 평면도는 큼

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "PNG/JPEG/WebP 만 지원합니다." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "파일 크기는 30MB 이하여야 합니다." }, { status: 400 });

  const floor = await prisma.buildingFloor.findUnique({
    where: { id },
    include: { building: { select: { code: true, name: true } } },
  });
  if (!floor) return NextResponse.json({ error: "층을 찾을 수 없습니다." }, { status: 404 });

  try {
    const tok = await getAccessTokenOrNull();
    if (!tok?.auth.parentFolderId) {
      return NextResponse.json(
        { error: "Drive 연결과 부모 폴더 설정이 필요합니다. /admin/events 에서 설정하세요." },
        { status: 400 },
      );
    }

    // 학생회 사이트 DB > 평면도 > {건물코드}
    const floorplansFolderId = await ensureSubfolder(tok.accessToken, tok.auth.parentFolderId, "평면도");
    const buildingFolderId = await ensureSubfolder(tok.accessToken, floorplansFolderId, floor.building.code);

    const safeName = `${floor.building.code}-${floor.level}F-${Date.now()}.${file.type.split("/")[1]}`;
    const renamed = new File([await file.arrayBuffer()], safeName, { type: file.type });
    const uploaded = await uploadFile(tok.accessToken, renamed, buildingFolderId);
    await makePublic(tok.accessToken, uploaded.id).catch(() => {});

    const updated = await prisma.buildingFloor.update({
      where: { id },
      data: {
        imageUrl: driveImageUrl(uploaded.id, 2000),
        driveFileId: uploaded.id,
      },
    });
    return NextResponse.json({ ok: true, imageUrl: updated.imageUrl, driveFileId: uploaded.id });
  } catch (err) {
    if (err instanceof DriveOAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[upload-floorplan]", err);
    return NextResponse.json({ error: "업로드 중 오류가 발생했습니다." }, { status: 500 });
  }
}
