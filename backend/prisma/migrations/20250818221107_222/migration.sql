-- CreateTable
CREATE TABLE "public"."IncidentReport" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "eventDateTime" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reportDateTime" TIMESTAMP(3) NOT NULL,
    "recurrenceProbability" TEXT NOT NULL,
    "consequences" TEXT NOT NULL,
    "captchaCode" TEXT NOT NULL,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "IncidentReport_fullName_organization_eventDateTime_key" ON "public"."IncidentReport"("fullName", "organization", "eventDateTime");
