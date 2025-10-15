/*
  Warnings:

  - You are about to drop the column `receptionDays` on the `Management` table. All the data in the column will be lost.
  - You are about to drop the column `receptionTime` on the `Management` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Management" DROP COLUMN "receptionDays",
DROP COLUMN "receptionTime",
ADD COLUMN     "receptionSchedule" TEXT NOT NULL DEFAULT 'каждую первую пятницу месяца в 14.00',
ADD COLUMN     "receptionScheduleBe" TEXT DEFAULT 'кожную першую пятніцу месяца ў 14.00',
ADD COLUMN     "receptionScheduleEn" TEXT DEFAULT 'every first Friday of the month at 14.00';

-- CreateTable
CREATE TABLE "public"."ReceptionSlot" (
    "id" SERIAL NOT NULL,
    "managementId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "bookedBy" TEXT,
    "notes" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringTemplateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceptionSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecurringScheduleTemplate" (
    "id" TEXT NOT NULL,
    "managementId" INTEGER NOT NULL,
    "weekday" INTEGER NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDuration" INTEGER NOT NULL DEFAULT 10,
    "monthsAhead" INTEGER NOT NULL DEFAULT 3,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringScheduleTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReceptionSlot_managementId_date_idx" ON "public"."ReceptionSlot"("managementId", "date");

-- CreateIndex
CREATE INDEX "ReceptionSlot_date_isAvailable_idx" ON "public"."ReceptionSlot"("date", "isAvailable");

-- CreateIndex
CREATE INDEX "ReceptionSlot_recurringTemplateId_idx" ON "public"."ReceptionSlot"("recurringTemplateId");

-- CreateIndex
CREATE INDEX "RecurringScheduleTemplate_managementId_idx" ON "public"."RecurringScheduleTemplate"("managementId");

-- CreateIndex
CREATE INDEX "RecurringScheduleTemplate_weekday_weekNumber_idx" ON "public"."RecurringScheduleTemplate"("weekday", "weekNumber");

-- AddForeignKey
ALTER TABLE "public"."ReceptionSlot" ADD CONSTRAINT "ReceptionSlot_managementId_fkey" FOREIGN KEY ("managementId") REFERENCES "public"."Management"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecurringScheduleTemplate" ADD CONSTRAINT "RecurringScheduleTemplate_managementId_fkey" FOREIGN KEY ("managementId") REFERENCES "public"."Management"("id") ON DELETE CASCADE ON UPDATE CASCADE;
