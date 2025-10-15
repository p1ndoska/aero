-- CreateTable
CREATE TABLE "public"."SocialWorkPageContent" (
    "id" SERIAL NOT NULL,
    "pageType" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Социальная работа',
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

    CONSTRAINT "SocialWorkPageContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialWorkPageContent_pageType_key" ON "public"."SocialWorkPageContent"("pageType");
