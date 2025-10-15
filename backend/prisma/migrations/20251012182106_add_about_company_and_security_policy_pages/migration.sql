-- CreateTable
CREATE TABLE "public"."AboutCompanyPageContent" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'О предприятии',
    "titleEn" TEXT,
    "titleBe" TEXT,
    "subtitle" TEXT,
    "subtitleEn" TEXT,
    "subtitleBe" TEXT,
    "content" JSONB,
    "contentEn" JSONB,
    "contentBe" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutCompanyPageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SecurityPolicyPageContent" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Политика безопасности',
    "titleEn" TEXT,
    "titleBe" TEXT,
    "subtitle" TEXT,
    "subtitleEn" TEXT,
    "subtitleBe" TEXT,
    "content" JSONB,
    "contentEn" JSONB,
    "contentBe" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityPolicyPageContent_pkey" PRIMARY KEY ("id")
);
