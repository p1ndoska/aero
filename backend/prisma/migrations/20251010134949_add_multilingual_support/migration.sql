-- AlterTable
ALTER TABLE "public"."Branch" ADD COLUMN     "addressBe" TEXT,
ADD COLUMN     "addressEn" TEXT,
ADD COLUMN     "contentBe" JSONB,
ADD COLUMN     "contentEn" JSONB,
ADD COLUMN     "descriptionBe" TEXT,
ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "nameBe" TEXT,
ADD COLUMN     "nameEn" TEXT;

-- AlterTable
ALTER TABLE "public"."Management" ADD COLUMN     "nameBe" TEXT,
ADD COLUMN     "nameEn" TEXT,
ADD COLUMN     "officesBe" TEXT,
ADD COLUMN     "officesEn" TEXT,
ADD COLUMN     "positionBe" TEXT,
ADD COLUMN     "positionEn" TEXT;

-- AlterTable
ALTER TABLE "public"."News" ADD COLUMN     "contentBe" TEXT,
ADD COLUMN     "contentEn" TEXT,
ADD COLUMN     "nameBe" TEXT,
ADD COLUMN     "nameEn" TEXT;

-- AlterTable
ALTER TABLE "public"."NewsCategory" ADD COLUMN     "nameBe" TEXT,
ADD COLUMN     "nameEn" TEXT;

-- AlterTable
ALTER TABLE "public"."Vacancy" ADD COLUMN     "conditionsBe" TEXT,
ADD COLUMN     "conditionsEn" TEXT,
ADD COLUMN     "contentBe" JSONB,
ADD COLUMN     "contentEn" JSONB,
ADD COLUMN     "descriptionBe" TEXT,
ADD COLUMN     "descriptionEn" TEXT,
ADD COLUMN     "employmentTypeBe" TEXT,
ADD COLUMN     "employmentTypeEn" TEXT,
ADD COLUMN     "locationBe" TEXT,
ADD COLUMN     "locationEn" TEXT,
ADD COLUMN     "requirementsBe" TEXT,
ADD COLUMN     "requirementsEn" TEXT,
ADD COLUMN     "salaryBe" TEXT,
ADD COLUMN     "salaryEn" TEXT,
ADD COLUMN     "titleBe" TEXT,
ADD COLUMN     "titleEn" TEXT;

-- AlterTable
ALTER TABLE "public"."VacancyPageContent" ADD COLUMN     "contentBe" JSONB,
ADD COLUMN     "contentEn" JSONB,
ADD COLUMN     "subtitleBe" TEXT,
ADD COLUMN     "subtitleEn" TEXT,
ADD COLUMN     "titleBe" TEXT,
ADD COLUMN     "titleEn" TEXT;
