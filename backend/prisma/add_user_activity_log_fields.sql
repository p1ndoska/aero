ALTER TABLE "public"."UserActivityLog"
  ADD COLUMN IF NOT EXISTS "userRole" TEXT,
  ADD COLUMN IF NOT EXISTS "userName" TEXT;

