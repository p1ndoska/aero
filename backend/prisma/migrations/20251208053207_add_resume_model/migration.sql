/*
  Warnings:

  - Made the column `pageType` on table `AboutCompanyPageContent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."AboutCompanyPageContent" ALTER COLUMN "pageType" SET NOT NULL,
ALTER COLUMN "pageType" SET DEFAULT 'default';

-- AlterTable
ALTER TABLE "public"."RecurringScheduleTemplate" ADD COLUMN     "isWeekly" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "weekNumber" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."ServiceRequest" (
    "id" SERIAL NOT NULL,
    "serviceType" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "organization" TEXT,
    "position" TEXT,
    "subject" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "preferredDate" TIMESTAMP(3),
    "budget" TEXT,
    "notes" TEXT,
    "assignedTo" INTEGER,
    "response" TEXT,
    "responseDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Resume" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceRequest_serviceType_idx" ON "public"."ServiceRequest"("serviceType");

-- CreateIndex
CREATE INDEX "ServiceRequest_status_idx" ON "public"."ServiceRequest"("status");

-- CreateIndex
CREATE INDEX "ServiceRequest_createdAt_idx" ON "public"."ServiceRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Resume_status_idx" ON "public"."Resume"("status");

-- CreateIndex
CREATE INDEX "Resume_createdAt_idx" ON "public"."Resume"("createdAt");

-- CreateIndex
CREATE INDEX "RecurringScheduleTemplate_isWeekly_idx" ON "public"."RecurringScheduleTemplate"("isWeekly");
