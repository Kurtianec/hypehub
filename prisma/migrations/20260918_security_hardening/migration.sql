ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "reservedUntil" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "AdminSession" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "csrfHash" TEXT NOT NULL,
  "ip" TEXT,
  "userAgent" TEXT,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AdminSession_tokenHash_key" ON "AdminSession"("tokenHash");
CREATE INDEX IF NOT EXISTS "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

CREATE TABLE IF NOT EXISTS "RateLimitBucket" (
  "id" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "blockedUntil" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "RateLimitBucket_updatedAt_idx" ON "RateLimitBucket"("updatedAt");
