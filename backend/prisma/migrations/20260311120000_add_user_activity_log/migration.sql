-- CreateTable
CREATE TABLE "public"."UserActivityLog" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "userRole" TEXT,
    "userName" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX "UserActivityLog_userId_createdAt_idx" ON "public"."UserActivityLog"("userId", "createdAt");
CREATE INDEX "UserActivityLog_action_createdAt_idx" ON "public"."UserActivityLog"("action", "createdAt");

