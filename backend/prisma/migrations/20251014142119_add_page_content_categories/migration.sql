/*
  Warnings:

  - You are about to drop the column `parentId` on the `NewsCategory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."NewsCategory" DROP CONSTRAINT "NewsCategory_parentId_fkey";

-- AlterTable
ALTER TABLE "public"."AboutCompanyPageContent" ADD COLUMN     "categoryId" INTEGER;

-- AlterTable
ALTER TABLE "public"."HistoryPageContent" ADD COLUMN     "categoryId" INTEGER;

-- AlterTable
ALTER TABLE "public"."NewsCategory" DROP COLUMN "parentId";

-- AlterTable
ALTER TABLE "public"."SecurityPolicyPageContent" ADD COLUMN     "categoryId" INTEGER;

-- AlterTable
ALTER TABLE "public"."SocialWorkPageContent" ADD COLUMN     "categoryId" INTEGER;

-- AlterTable
ALTER TABLE "public"."VacancyPageContent" ADD COLUMN     "categoryId" INTEGER;

-- CreateTable
CREATE TABLE "public"."PageContentCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameBe" TEXT,
    "pageType" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "descriptionEn" TEXT,
    "descriptionBe" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PageContentCategory_slug_key" ON "public"."PageContentCategory"("slug");

-- AddForeignKey
ALTER TABLE "public"."VacancyPageContent" ADD CONSTRAINT "VacancyPageContent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."PageContentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."HistoryPageContent" ADD CONSTRAINT "HistoryPageContent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."PageContentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AboutCompanyPageContent" ADD CONSTRAINT "AboutCompanyPageContent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."PageContentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SecurityPolicyPageContent" ADD CONSTRAINT "SecurityPolicyPageContent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."PageContentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SocialWorkPageContent" ADD CONSTRAINT "SocialWorkPageContent_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."PageContentCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
