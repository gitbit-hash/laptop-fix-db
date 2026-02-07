-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('ACTIVE', 'PRIVATE', 'DELETED', 'BLOCKED', 'UNAVAILABLE');

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "status" "VideoStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "unavailableAt" TIMESTAMP(3),
ADD COLUMN     "unavailableReason" TEXT;

-- CreateTable
CREATE TABLE "VideoMetadataHistory" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VideoMetadataHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoMetadataHistory_videoId_idx" ON "VideoMetadataHistory"("videoId");

-- CreateIndex
CREATE INDEX "VideoMetadataHistory_snapshotAt_idx" ON "VideoMetadataHistory"("snapshotAt");

-- AddForeignKey
ALTER TABLE "VideoMetadataHistory" ADD CONSTRAINT "VideoMetadataHistory_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;
