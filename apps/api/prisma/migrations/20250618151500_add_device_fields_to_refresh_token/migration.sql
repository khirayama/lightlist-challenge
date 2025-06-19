-- CreateIndex
-- Add device identification fields to RefreshToken table

-- Step 1: Add new columns
ALTER TABLE "RefreshToken" ADD COLUMN "deviceId" TEXT;
ALTER TABLE "RefreshToken" ADD COLUMN "deviceName" TEXT;

-- Step 2: Update existing records with temporary device IDs
UPDATE "RefreshToken" 
SET 
  "deviceId" = 'legacy-device-' || id,
  "deviceName" = 'Legacy Device'
WHERE "deviceId" IS NULL;

-- Step 3: Add unique constraint for userId + deviceId combination
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_deviceId_key" UNIQUE ("userId", "deviceId");