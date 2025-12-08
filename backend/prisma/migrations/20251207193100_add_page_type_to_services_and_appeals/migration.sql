-- AlterTable
ALTER TABLE "public"."ServicesPageContent" ADD COLUMN     "pageType" TEXT;

-- AlterTable
ALTER TABLE "public"."AppealsPageContent" ADD COLUMN     "pageType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ServicesPageContent_pageType_key" ON "public"."ServicesPageContent"("pageType");

-- CreateIndex
CREATE UNIQUE INDEX "AppealsPageContent_pageType_key" ON "public"."AppealsPageContent"("pageType");

