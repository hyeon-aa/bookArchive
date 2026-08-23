-- CreateTable
CREATE TABLE "TasteRecommendationCache" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookshelfSignature" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TasteRecommendationCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TasteRecommendationCache_userId_key" ON "TasteRecommendationCache"("userId");
