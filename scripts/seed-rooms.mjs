// N7 기계공학동의 호실 데이터 + 외부 건물(별관/PP동/항공우주/원자력)을 DB 에 시드한다.
// 도면 7장에서 추출한 호실 번호를 자동 등록 (멱등 — 같은 code 재실행 무시).
//
// 사용:
//   node scripts/seed-rooms.mjs

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || "file:./prisma/dev.db",
  ...(process.env.TURSO_AUTH_TOKEN ? { authToken: process.env.TURSO_AUTH_TOKEN } : {}),
});
const prisma = new PrismaClient({ adapter });

// 도면 7장에서 추출한 호실 번호 (1xx wing = 첫째자리 1, 둘째자리 wing)
const FLOOR_ROOMS = {
  1: [
    // 1wing
    "1101","1102","1103","1104","1105","1106","1107","1108","1110","1111","1112","1113","1114","1115","1116","1117","1118","1119","1120","1121","1122","1123",
    // 2wing
    "1201","1207","1208","1210","1211","1212",
    // 3wing
    "1301","1302","1303","1304","1305","1306","1307","1309","1312","1315","1316",
    // 4wing
    "1401","1402","1403","1404","1405","1406","1408","1409","1410","1411","1412","1416","1417","1418",
    // 5wing
    "1501","1502","1503","1504",
    // 지하/B1 (wing=null) — 0xxx
    "0101","0102","0103","0104","0105","0106","0107","0108","0114","0115","0121",
  ],
  2: [
    "2102","2103","2104C","2105","2106","2107","2108","2109","2110","2111",
    "2201","2202","2203","2204","2205","2206","2207","2208","2209","2210","2211","2212","2213","2214","2215","2216",
    "2301","2302","2303","2304","2305","2306","2307","2308","2309","2311","2312","2313","2314","2315","2316","2319","2320",
    "2401","2402","2403","2404","2405","2406","2407","2408","2409","2410","2411","2412","2414","2415","2416","2417","2418","2419","2420","2424","2425",
    "2501","2502","2503","2504","2505",
  ],
  3: [
    "3101","3102A","3102B","3103","3104","3105","3106","3107","3108","3109","3110","3111","3115","3116","3117","3118","3119","3120","3122","3123","3124","3125","3128","3129","3130","3147",
    "3201","3202","3203","3204","3205","3206","3209","3210","3211","3212","3213","3214","3226","3230","3231","3237","3238","3239","3240","3241","3242",
    "3301","3302","3303","3304","3305","3306","3307","3308","3309","3310","3312","3313","3314","3315","3316","3332","3333","3334",
    "3401","3402","3403","3404","3405","3406","3407","3408","3409","3410","3411","3412","3414","3415","3416","3417","3418","3419","3420","3435","3436",
  ],
  4: [
    "4101","4102","4103","4104","4105","4106","4107","4108","4109","4110","4111","4112","4114","4115","4116","4117","4118","4119","4120","4121",
    "4201","4202","4203","4204","4205","4206","4209","4210","4211","4212","4213","4215",
  ],
  5: [
    "5101","5102","5103","5104","5105","5106","5107","5108","5109","5110","5111","5112","5113","5114","5115","5116","5117","5119","5120","5121","5122","5123","5124","5125","5126",
    "5201","5202","5203","5204","5205","5206","5207","5210","5211","5212","5213","5214","5215",
  ],
  6: [
    "6101","6102","6103","6104","6105","6106","6107","6108","6109","6110","6111","6112","6113","6114","6115","6116","6117","6119","6120","6121","6122","6123","6124","6125","6126","6127","6128",
  ],
  7: [
    "7101","7102","7103","7104","7105","7106","7107","7108","7109","7110","7111","7112","7113","7114","7115","7116","7117","7119","7120","7121","7122","7123","7124","7125","7126","7127","7128",
  ],
};

// 특수실(이름 라벨) — code 와 별도로 name 컬럼에 표시
const SPECIAL_ROOMS = {
  // 1F
  "0121": "EPS/창고",
  // 2F
  "2104C": "토론실",
  "2210": "화장실(여)",
  "2208": "화장실(남)",
  // 3F
  "3102A": "학생연구실",
};

function wingFromCode(code) {
  // 0xxx → null (지하), 외에는 둘째자리
  if (code.startsWith("0")) return null;
  const m = code.match(/^\d(\d)/);
  return m ? Number(m[1]) : null;
}

async function ensureN7() {
  return prisma.building.upsert({
    where: { code: "N7" },
    create: {
      code: "N7",
      name: "기계공학동",
      nameEn: "Mechanical Engineering Bldg.",
      description: "기계공학과 본관",
      order: 0,
    },
    update: { isExternal: false },
  });
}

async function ensureExternalBuilding(code, name, order) {
  return prisma.building.upsert({
    where: { code },
    create: { code, name, isExternal: true, order },
    update: { isExternal: true },
  });
}

async function seedRoomsForN7(buildingId) {
  let added = 0;
  let kept = 0;
  for (const [levelStr, codes] of Object.entries(FLOOR_ROOMS)) {
    const level = Number(levelStr);
    const floor = await prisma.buildingFloor.upsert({
      where: { buildingId_level: { buildingId, level } },
      create: { buildingId, level, description: `${level}층` },
      update: {},
    });
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      const exists = await prisma.room.findUnique({
        where: { floorId_code: { floorId: floor.id, code } },
      });
      if (exists) {
        kept++;
        continue;
      }
      await prisma.room.create({
        data: {
          floorId: floor.id,
          code,
          wing: wingFromCode(code),
          name: SPECIAL_ROOMS[code] ?? null,
          order: i,
        },
      });
      added++;
    }
  }
  return { added, kept };
}

const n7 = await ensureN7();
console.log(`[seed-rooms] N7 준비 (id=${n7.id})`);

const externals = [
  { code: "별관", name: "별관", order: 100 },
  { code: "PP동", name: "PP동", order: 101 },
  { code: "항공우주", name: "항공우주공학과", order: 102 },
  { code: "원자력", name: "원자력양자공학과", order: 103 },
];
for (const e of externals) {
  const b = await ensureExternalBuilding(e.code, e.name, e.order);
  console.log(`  외부 건물 준비: ${b.name} (id=${b.id})`);
}

const result = await seedRoomsForN7(n7.id);
console.log(`[seed-rooms] N7 호실 시드 — 신규 ${result.added}개, 기존 유지 ${result.kept}개`);

await prisma.$disconnect();
