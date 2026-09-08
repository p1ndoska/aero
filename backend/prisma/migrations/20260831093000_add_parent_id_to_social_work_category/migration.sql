-- AlterTable
ALTER TABLE "public"."SocialWorkCategory" ADD COLUMN     "parentId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."SocialWorkCategory" ADD CONSTRAINT "SocialWorkCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."SocialWorkCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
