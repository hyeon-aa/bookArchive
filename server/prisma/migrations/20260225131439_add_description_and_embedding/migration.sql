/*
  Warnings:

  - Added the required column `description` to the `Book` table without a default value. This is not possible if the table is not empty.

*/

CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "description" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "BookEmbedding" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,
    "embedding" vector(384) NOT NULL,

    CONSTRAINT "BookEmbedding_pkey" PRIMARY KEY ("id")
);
