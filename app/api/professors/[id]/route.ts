import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { parseId } from "@/lib/validation";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (typeof body.name === "string") data.name = body.name.trim().slice(0, 50);
  if (typeof body.nameEn === "string") data.nameEn = body.nameEn.trim().slice(0, 50) || null;
  if (typeof body.title === "string") data.title = body.title.trim().slice(0, 30);
  if ("buildingId" in body) data.buildingId = typeof body.buildingId === "number" ? body.buildingId : null;
  if ("floorId" in body) data.floorId = typeof body.floorId === "number" ? body.floorId : null;
  if (typeof body.roomNumber === "string") data.roomNumber = body.roomNumber.trim().slice(0, 20) || null;
  if (typeof body.email === "string") data.email = body.email.trim().slice(0, 100) || null;
  if (typeof body.phone === "string") data.phone = body.phone.trim().slice(0, 30) || null;
  if (typeof body.researchArea === "string") data.researchArea = body.researchArea.trim().slice(0, 200) || null;
  if (typeof body.websiteUrl === "string") data.websiteUrl = body.websiteUrl.trim() || null;
  if (typeof body.imageUrl === "string") data.imageUrl = body.imageUrl.trim() || null;
  if (typeof body.order === "number") data.order = body.order;
  // 평면도 핀 좌표 (0~1 정규화) — null 로 지우기도 허용
  if ("posX" in body) {
    if (body.posX === null) data.posX = null;
    else if (typeof body.posX === "number" && body.posX >= 0 && body.posX <= 1) data.posX = body.posX;
    else return NextResponse.json({ error: "posX 는 0~1 사이여야 합니다." }, { status: 400 });
  }
  if ("posY" in body) {
    if (body.posY === null) data.posY = null;
    else if (typeof body.posY === "number" && body.posY >= 0 && body.posY <= 1) data.posY = body.posY;
    else return NextResponse.json({ error: "posY 는 0~1 사이여야 합니다." }, { status: 400 });
  }

  const professor = await prisma.professor.update({ where: { id }, data });
  return NextResponse.json(professor);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  // PATCH 는 PUT 과 동일한 partial-update 로직을 재사용 (핀 좌표 전용)
  return PUT(req, ctx);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await params;
  const id = parseId(idStr);
  if (!id) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  await prisma.professor.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
