-- AlterTable
ALTER TABLE "AeronauticalInfoPageContent" ADD COLUMN "pageType" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "AeronauticalInfoPageContent_pageType_key" ON "AeronauticalInfoPageContent"("pageType");

