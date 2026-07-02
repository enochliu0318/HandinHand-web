-- AlterTable
ALTER TABLE "AccountApplication" ADD COLUMN "passwordHash" TEXT NOT NULL DEFAULT '';

-- Remove default so new rows must supply a hash (existing empty rows are stale applications)
ALTER TABLE "AccountApplication" ALTER COLUMN "passwordHash" DROP DEFAULT;
