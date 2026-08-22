-- CreateTable
CREATE TABLE "RecommendationLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "bookId" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecommendationLog_userId_bookId_idx" ON "RecommendationLog"("userId", "bookId");

-- CreateIndex
CREATE INDEX "RecommendationLog_source_idx" ON "RecommendationLog"("source");
