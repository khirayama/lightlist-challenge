-- Remove unique constraint that prevents multiple refresh tokens per device
-- This allows token refresh without constraint violations

ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_deviceId_key";