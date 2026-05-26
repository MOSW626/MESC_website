import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidString } from "@/lib/validation";
import { enforce, getClientIp } from "@/lib/rate-limit";
import { sanitize, checkContent } from "@/lib/content-filter";
import { authorTag, ipHash } from "@/lib/anon";

const ALLOWED_CATEGORIES = ["자유", "질문", "정보공유"];

// 공개: hidden=false 인 게시글 목록 (최신순)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category");
  const where: { hidden: boolean; category?: string } = { hidden: false };
  if (category && ALLOWED_CATEGORIES.includes(category)) where.category = category;

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      category: true,
      title: true,
      content: true,
      authorTag: true,
      commentCount: true,
      createdAt: true,
    },
    take: 100,
  });
  return NextResponse.json(posts);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  // 1분에 3건
  const rl = enforce(ip, "posts", 3, 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: `너무 자주 작성하셨습니다. ${Math.ceil(rl.retryAfter / 1000)}초 후 다시 시도해주세요.` },
      { status: 429 },
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    category?: string;
    title?: string;
    content?: string;
  };

  const category = ALLOWED_CATEGORIES.includes(body.category ?? "") ? body.category : "자유";
  const title = sanitize(body.title ?? "");
  const content = sanitize(body.content ?? "");

  if (!isValidString(title, 100) || title.length < 2) {
    return NextResponse.json({ error: "제목은 2~100자로 작성해주세요." }, { status: 400 });
  }
  if (!isValidString(content, 5000) || content.length < 5) {
    return NextResponse.json({ error: "내용은 5~5000자로 작성해주세요." }, { status: 400 });
  }

  const tBlock = checkContent(title);
  if (tBlock.blocked) return NextResponse.json({ error: `제목: ${tBlock.message}` }, { status: 400 });
  const cBlock = checkContent(content);
  if (cBlock.blocked) return NextResponse.json({ error: cBlock.message }, { status: 400 });

  // 임시 authorTag (scope=temp) — DB 입력 후 postId 로 재계산해 update
  const post = await prisma.post.create({
    data: {
      category: category!,
      title,
      content,
      authorTag: authorTag(ip, "temp"),
      ipHash: ipHash(ip),
    },
  });
  // 진짜 scope=postId 로 갱신
  await prisma.post.update({
    where: { id: post.id },
    data: { authorTag: authorTag(ip, post.id) },
  });

  return NextResponse.json(
    { id: post.id, category: post.category, title: post.title, createdAt: post.createdAt },
    { status: 201 },
  );
}
