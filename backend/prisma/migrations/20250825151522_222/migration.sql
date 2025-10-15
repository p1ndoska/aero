-- CreateTable
CREATE TABLE "public"."Management" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "receptionDays" TIMESTAMP(3) NOT NULL,
    "receptionTime" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,
    "offices" TEXT,
    "images" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Management_pkey" PRIMARY KEY ("id")
);
