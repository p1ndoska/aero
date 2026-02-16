-- AlterTable
ALTER TABLE "public"."AeronauticalInfoCategory" ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."AeronauticalInfoCategory" ADD CONSTRAINT "AeronauticalInfoCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."AeronauticalInfoCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
