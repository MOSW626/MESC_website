-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Member" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "bureau" TEXT NOT NULL DEFAULT '',
    "council" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Member" ("bureau", "id", "imageUrl", "name", "order", "role") SELECT "bureau", "id", "imageUrl", "name", "order", "role" FROM "Member";
DROP TABLE "Member";
ALTER TABLE "new_Member" RENAME TO "Member";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
