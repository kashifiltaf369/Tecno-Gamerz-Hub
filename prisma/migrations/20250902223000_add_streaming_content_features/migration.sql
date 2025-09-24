-- Add streamUrl field to tournaments table
ALTER TABLE "tournaments" ADD COLUMN "streamUrl" TEXT;

-- CreateTable for user_content
CREATE TABLE "user_content" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_content_userId_idx" ON "user_content"("userId");

-- CreateIndex
CREATE INDEX "user_content_createdAt_idx" ON "user_content"("createdAt");

-- AddForeignKey
ALTER TABLE "user_content" ADD CONSTRAINT "user_content_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;