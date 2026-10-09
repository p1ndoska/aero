CREATE TABLE "EltApplication" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "eltCode" TEXT NOT NULL,
    "operator" TEXT,
    "aircraftRegistration" TEXT,
    "formData" JSONB NOT NULL,
    "scanFileName" TEXT NOT NULL,
    "scanFile" BYTEA NOT NULL,
    "pdfFile" BYTEA NOT NULL,
    "excelFile" BYTEA NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EltApplication_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "EltApplication_type_idx" ON "EltApplication"("type");

CREATE INDEX "EltApplication_createdAt_idx" ON "EltApplication"("createdAt");
