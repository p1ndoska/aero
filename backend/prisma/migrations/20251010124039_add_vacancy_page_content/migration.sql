-- CreateTable
CREATE TABLE "public"."VacancyPageContent" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Открытые вакансии',
    "subtitle" TEXT,
    "content" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VacancyPageContent_pkey" PRIMARY KEY ("id")
);
