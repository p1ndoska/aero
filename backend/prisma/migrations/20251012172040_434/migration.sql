-- CreateTable
CREATE TABLE "public"."HistoryPageContent" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'История предприятия',
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

    CONSTRAINT "HistoryPageContent_pkey" PRIMARY KEY ("id")
);
