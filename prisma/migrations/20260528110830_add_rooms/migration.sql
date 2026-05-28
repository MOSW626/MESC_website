-- Building 외부 건물 표시
ALTER TABLE "Building" ADD COLUMN "isExternal" BOOLEAN NOT NULL DEFAULT false;

-- Room 모델
CREATE TABLE "Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "floorId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "wing" INTEGER,
    "name" TEXT,
    "posX" REAL,
    "posY" REAL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Room_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "BuildingFloor"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Room_floorId_code_key" ON "Room"("floorId", "code");
CREATE INDEX "Room_floorId_wing_idx" ON "Room"("floorId", "wing");

-- Professor: Room 연결
ALTER TABLE "Professor" ADD COLUMN "roomId" INTEGER REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
