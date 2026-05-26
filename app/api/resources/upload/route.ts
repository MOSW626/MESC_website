import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ensureSubfolder, getAccessTokenOrNull, uploadFile, makePublic, DriveOAuthError } from "@/lib/drive-oauth";

const MAX_SIZE = 100 * 1024 * 1024; // 100MB — PDF 강의자료 등

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const courseCode = (formData.get("courseCode") as string | null)?.trim() || "기타";
  if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "파일 크기는 100MB 이하여야 합니다." }, { status: 400 });

  try {
    const tok = await getAccessTokenOrNull();
    if (!tok?.auth.parentFolderId) {
      return NextResponse.json(
        { error: "Drive 연결과 부모 폴더 설정이 필요합니다. /admin/events 에서 설정하세요." },
        { status: 400 },
      );
    }

    const resourcesFolderId = await ensureSubfolder(tok.accessToken, tok.auth.parentFolderId, "학습자료");
    const courseFolderId = await ensureSubfolder(tok.accessToken, resourcesFolderId, courseCode);

    const uploaded = await uploadFile(tok.accessToken, file, courseFolderId);
    await makePublic(tok.accessToken, uploaded.id).catch(() => {});

    // Drive 공유 링크 — 일반 파일 보기용
    const fileUrl = `https://drive.google.com/file/d/${uploaded.id}/view?usp=drivesdk`;
    return NextResponse.json({ ok: true, url: fileUrl, driveFileId: uploaded.id, name: uploaded.name });
  } catch (err) {
    if (err instanceof DriveOAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("[resources/upload]", err);
    return NextResponse.json({ error: "업로드 중 오류가 발생했습니다." }, { status: 500 });
  }
}
