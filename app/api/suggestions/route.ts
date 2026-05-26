import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidString } from "@/lib/validation";
import { enforce, getClientIp } from "@/lib/rate-limit";
import { sanitize, checkContent } from "@/lib/content-filter";
import { ipHash } from "@/lib/anon";

const ALLOWED_CATEGORIES = ["행사", "시설", "학사", "기타"];

// 공개: hidden=false 인 건의만 (최신순)
export async function GET() {
  const items = await prisma.suggestion.findMany({
    where: { hidden: false },
    orderBy: [{ respondedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    select: {
      id: true,
      category: true,
      content: true,
      response: true,
      respondedAt: true,
      createdAt: true,
    },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  // 1분에 2건 (도배 방지)
  const rl = enforce(ip, "suggestions", 2, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `너무 자주 작성하셨습니다. ${Math.ceil(rl.retryAfter / 1000)}초 후 다시 시도해주세요.` },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    category?: string;
    content?: string;
    contactInfo?: string;
  };

  const category = ALLOWED_CATEGORIES.includes(body.category ?? "") ? body.category : "기타";
  const raw = typeof body.content === "string" ? body.content : "";
  const cleaned = sanitize(raw);
  if (!isValidString(cleaned, 2000) || cleaned.length < 5) {
    return NextResponse.json({ error: "내용은 5~2000자로 작성해주세요." }, { status: 400 });
  }
  // contactInfo 는 학번/이메일/전화 들어와도 OK — 학생회만 보는 답변용 칸. 길이만 제한.
  const contactInfo =
    typeof body.contactInfo === "string" && body.contactInfo.trim()
      ? body.contactInfo.trim().slice(0, 100)
      : null;

  const block = checkContent(cleaned);
  if (block.blocked && block.reason === "keyword") {
    return NextResponse.json({ error: block.message }, { status: 400 });
  }
  // 건의함은 student_id/phone/email 은 검사 안 함 (contactInfo 로 사용 가능하므로)

  const item = await prisma.suggestion.create({
    data: {
      category: category!,
      content: cleaned,
      contactInfo,
      ipHash: ipHash(ip),
    },
  });
  return NextResponse.json(
    { id: item.id, category: item.category, content: item.content, createdAt: item.createdAt },
    { status: 201 },
  );
}
