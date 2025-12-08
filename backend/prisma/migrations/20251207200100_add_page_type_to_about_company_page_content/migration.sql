-- AlterTable
ALTER TABLE "public"."AboutCompanyPageContent" ADD COLUMN     "pageType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AboutCompanyPageContent_pageType_key" ON "public"."AboutCompanyPageContent"("pageType");

