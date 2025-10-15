/*
  Warnings:

  - You are about to drop the `SocialWorkPageContent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."SocialWorkPageContent";

-- CreateTable
CREATE TABLE "public"."SocialWorkCategory" (
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

    CONSTRAINT "SocialWorkCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialWorkCategory_pageType_key" ON "public"."SocialWorkCategory"("pageType");
