import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { VideoStatus } from "@/generated/prisma/client";

interface YouTubeVideo {
  id: string;
  status: {
    uploadStatus: string;
    privacyStatus: string;
    embeddable: boolean;
  };
  snippet: {
    title: string;
    description: string;
  };
}

// YouTube API quota: 1 unit per videos.list call (batch of 50)
// Free tier: 10,000 units/day

// Verify cron secret
function verifyCronSecret(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return true; // No secret configured, allow in development
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  try {
    // Verify cron authentication
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "YouTube API key not configured" },
        { status: 500 }
      );
    }

    // Get all active videos
    const videos = await prisma.video.findMany({
      where: {
        status: VideoStatus.ACTIVE,
      },
      select: {
        id: true,
        youtubeId: true,
        title: true,
        status: true,
      },
    });

    console.log(`Checking health of ${videos.length} active videos...`);

    const results = {
      checked: 0,
      unchanged: 0,
      nowUnavailable: 0,
      newlyAvailable: 0,
      details: [] as any[],
    };

    // Batch videos into groups of 50 (YouTube API limit)
    const batchSize = 50;
    for (let i = 0; i < videos.length; i += batchSize) {
      const batch = videos.slice(i, i + batchSize);
      const videoIds = batch.map((v) => v.youtubeId).join(",");

      try {
        // Call YouTube API
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoIds}&part=status,snippet&key=${apiKey}`
        );

        if (!response.ok) {
          console.error(`YouTube API error: ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        const foundVideos = new Map<string, YouTubeVideo>(
          data.items?.map((item: any) => [item.id, item]) || []
        );

        // Check each video in batch
        for (const video of batch) {
          results.checked++;

          const ytVideo = foundVideos.get(video.youtubeId);

          if (!ytVideo) {
            // Video not found - deleted or private
            await updateVideoStatus(
              video.id,
              VideoStatus.DELETED,
              "Video not found in YouTube API response"
            );

            results.nowUnavailable++;
            results.details.push({
              youtubeId: video.youtubeId,
              title: video.title,
              previousStatus: video.status,
              newStatus: "DELETED",
              reason: "Not found",
            });
          } else {
            // Check video status
            const status = ytVideo.status;
            const snippet = ytVideo.snippet;

            let newStatus: VideoStatus = VideoStatus.ACTIVE;
            let reason: string | undefined;

            if (status.privacyStatus === "private") {
              newStatus = VideoStatus.PRIVATE;
              reason = "Video is private";
            } else if (status.embeddable === false) {
              newStatus = VideoStatus.BLOCKED;
              reason = "Embedding disabled";
            } else if (status.uploadStatus !== "processed") {
              newStatus = VideoStatus.UNAVAILABLE;
              reason = `Upload status: ${status.uploadStatus}`;
            }

            if (newStatus !== VideoStatus.ACTIVE) {
              await updateVideoStatus(video.id, newStatus, reason);

              results.nowUnavailable++;
              results.details.push({
                youtubeId: video.youtubeId,
                title: video.title,
                previousStatus: video.status,
                newStatus,
                reason,
              });
            } else {
              results.unchanged++;
            }

            // Update lastCheckedAt for all videos
            await prisma.video.update({
              where: { id: video.id },
              data: { lastCheckedAt: new Date() },
            });
          }
        }

        // Rate limiting - wait 100ms between batches
        if (i + batchSize < videos.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error checking batch ${i}-${i + batchSize}:`, error);
      }
    }

    console.log("Video health check complete:", results);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error) {
    console.error("Video health check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check video health",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function updateVideoStatus(
  videoId: string,
  status: VideoStatus,
  reason?: string
) {
  await prisma.video.update({
    where: { id: videoId },
    data: {
      status,
      unavailableAt: new Date(),
      unavailableReason: reason,
      lastCheckedAt: new Date(),
    },
  });
}
