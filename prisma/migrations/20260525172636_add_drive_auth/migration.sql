CREATE TABLE "DriveAuth" (
    "id" INTEGER NOT NULL PRIMARY KEY DEFAULT 1,
    "refreshToken" TEXT NOT NULL,
    "parentFolderId" TEXT,
    "scope" TEXT NOT NULL,
    "email" TEXT,
    "updatedAt" DATETIME NOT NULL
);
