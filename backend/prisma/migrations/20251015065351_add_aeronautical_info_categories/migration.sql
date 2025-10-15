-- CreateTable
CREATE TABLE "public"."AeronauticalInfoCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "nameBe" TEXT,
    "description" TEXT,
    "descriptionEn" TEXT,
    "descriptionBe" TEXT,
    "pageType" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AeronauticalInfoCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AeronauticalInfoPageContent" (
    "id" SERIAL NOT NULL,
    "pageType" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Аэронавигационная информация',
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

    CONSTRAINT "AeronauticalInfoPageContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AeronauticalInfoCategory_pageType_key" ON "public"."AeronauticalInfoCategory"("pageType");

-- CreateIndex
CREATE UNIQUE INDEX "AeronauticalInfoPageContent_pageType_key" ON "public"."AeronauticalInfoPageContent"("pageType");
