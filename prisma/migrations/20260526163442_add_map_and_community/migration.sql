-- BuildingFloor: 평면도 폭·높이 + driveFileId
ALTER TABLE "BuildingFloor" ADD COLUMN "width" INTEGER;
ALTER TABLE "BuildingFloor" ADD COLUMN "height" INTEGER;
ALTER TABLE "BuildingFloor" ADD COLUMN "driveFileId" TEXT;

-- Professor: 평면도 위 핀 좌표 (0~1 정규화)
ALTER TABLE "Professor" ADD COLUMN "posX" REAL;
ALTER TABLE "Professor" ADD COLUMN "posY" REAL;

-- Suggestion: 학생회 건의함
CREATE TABLE "Suggestion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL DEFAULT '기타',
    "content" TEXT NOT NULL,
    "contactInfo" TEXT,
    "response" TEXT,
    "respondedAt" DATETIME,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "ipHash" TEXT,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Suggestion_hidden_createdAt_idx" ON "Suggestion"("hidden", "createdAt");

-- Post: 자유게시판
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "category" TEXT NOT NULL DEFAULT '자유',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorTag" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "ipHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Post_hidden_createdAt_idx" ON "Post"("hidden", "createdAt");

-- Comment
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "postId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "authorTag" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "reportCount" INTEGER NOT NULL DEFAULT 0,
    "ipHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Comment_postId_hidden_createdAt_idx" ON "Comment"("postId", "hidden", "createdAt");

-- Report
CREATE TABLE "Report" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "targetType" TEXT NOT NULL,
    "targetId" INTEGER NOT NULL,
    "reason" TEXT,
    "ipHash" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX "Report_targetType_targetId_idx" ON "Report"("targetType", "targetId");
