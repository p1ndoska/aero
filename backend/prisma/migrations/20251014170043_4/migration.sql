/*
  Warnings:

  - You are about to drop the column `categoryId` on the `AboutCompanyPageContent` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `HistoryPageContent` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `SecurityPolicyPageContent` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `SocialWorkPageContent` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `VacancyPageContent` table. All the data in the column will be lost.
  - You are about to drop the `PageContentCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."AboutCompanyPageContent" DROP CONSTRAINT "AboutCompanyPageContent_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."HistoryPageContent" DROP CONSTRAINT "HistoryPageContent_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SecurityPolicyPageContent" DROP CONSTRAINT "SecurityPolicyPageContent_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SocialWorkPageContent" DROP CONSTRAINT "SocialWorkPageContent_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."VacancyPageContent" DROP CONSTRAINT "VacancyPageContent_categoryId_fkey";

-- AlterTable
ALTER TABLE "public"."AboutCompanyPageContent" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "public"."HistoryPageContent" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "public"."SecurityPolicyPageContent" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "public"."SocialWorkPageContent" DROP COLUMN "categoryId";

-- AlterTable
ALTER TABLE "public"."VacancyPageContent" DROP COLUMN "categoryId";

-- DropTable
DROP TABLE "public"."PageContentCategory";

-- CreateTable
CREATE TABLE "public"."AboutCompanyCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameBe" TEXT,
    "description" TEXT,
    "descriptionEn" TEXT,
    "descriptionBe" TEXT,
    "pageType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutCompanyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AboutCompanyCategory_pageType_key" ON "public"."AboutCompanyCategory"("pageType");
