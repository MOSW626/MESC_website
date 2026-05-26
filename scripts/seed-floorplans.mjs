// N7동(기계공학동) + 7개 층의 메타데이터를 DB 에 upsert 한다.
// 평면도 이미지는 별도로 /admin/buildings 에서 업로드한다.
//   - 도면 PDF 변환은 Windows + Node 환경 차이 + pdfjs CMap fetch 제약으로
//     자동화하기 까다로워, 사용자가 직접 변환해 admin 페이지에서 업로드하도록 함.
//
// 사용:
//   node scripts/seed-floorplans.mjs

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
  ...(process.env.TURSO_AUTH_TOKEN ? { authToken: process.env.TURSO_AUTH_TOKEN } : {}),
});
const prisma = new PrismaClient({ adapter });

const building = await prisma.building.upsert({
  where: { code: "N7" },
  create: {
    code: "N7",
    name: "기계공학동",
    nameEn: "Mechanical Engineering Bldg.",
    description: "기계공학과 본관",
    order: 0,
  },
  update: {},
});
console.log(`[seed-floorplans] Building: ${building.name} (id=${building.id})`);

for (let level = 1; level <= 7; level++) {
  const floor = await prisma.buildingFloor.upsert({
    where: { buildingId_level: { buildingId: building.id, level } },
    create: { buildingId: building.id, level, description: `${level}층` },
    update: {},
  });
  console.log(`  ${level}층 준비 (id=${floor.id})`);
}

console.log("[seed-floorplans] 완료 — 이제 /admin/buildings 에서 각 층 평면도를 업로드하세요.");
await prisma.$disconnect();
