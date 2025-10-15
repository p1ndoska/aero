/*
  Warnings:

  - You are about to drop the column `pageType` on the `AeronauticalInfoPageContent` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."AeronauticalInfoPageContent_pageType_key";

-- AlterTable
ALTER TABLE "public"."AeronauticalInfoPageContent" DROP COLUMN "pageType";

-- CreateTable
CREATE TABLE "public"."AppealsPageContent" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Обращения',
    "titleEn" TEXT,
    "titleBe" TEXT,
    "subtitle" TEXT,
    "subtitleEn" TEXT,
    "subtitleBe" TEXT,
    "content" JSONB,
    "contentEn" JSONB,
    "contentBe" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppealsPageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ServicesPageContent" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Услуги',
    "titleEn" TEXT,
    "titleBe" TEXT,
    "subtitle" TEXT,
    "subtitleEn" TEXT,
    "subtitleBe" TEXT,
    "content" JSONB,
    "contentEn" JSONB,
    "contentBe" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicesPageContent_pkey" PRIMARY KEY ("id")
);
