import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// 공개: 모든 호실 (building+floor 포함)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const buildingId = url.searchParams.get("buildingId");
  const where: { floor?: { buildingId: number } } = {};
  if (buildingId) where.floor = { buildingId: Number(buildingId) };

  const rooms = await prisma.room.findMany({
    where,
    orderBy: [{ floorId: "asc" }, { code: "asc" }],
    include: {
      floor: { select: { id: true, level: true, buildingId: true, building: { select: { code: true, name: true } } } },
      professors: { select: { id: true, name: true, title: true } },
    },
    take: 2000,
  });
  return NextResponse.json(rooms);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    floorId?: number;
    code?: string;
    wing?: number | null;
    name?: string | null;
    order?: number;
  };
  if (!body.floorId || !body.code) {
    return NextResponse.json({ error: "floorId, code 필수" }, { status: 400 });
  }
  try {
    const room = await prisma.room.create({
      data: {
        floorId: body.floorId,
        code: body.code.trim().slice(0, 20),
        wing: typeof body.wing === "number" ? body.wing : null,
        name: body.name?.trim().slice(0, 50) || null,
        order: typeof body.order === "number" ? body.order : 0,
      },
    });
    return NextResponse.json(room, { status: 201 });
  } catch {
    return NextResponse.json({ error: "이미 같은 코드의 호실이 존재합니다." }, { status: 400 });
  }
}
