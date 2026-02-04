import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getChannelVideos, getVideoTranscript } from "@/lib/youtube";
import { auth } from "@/lib/auth";

/**
 * Manual trigger to sync all videos from YouTube
 * Admin only
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    // Only admins can trigger manual sync
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    if (!channelId) {
      return NextResponse.json(
        { error: "YOUTUBE_CHANNEL_ID not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const maxResults = body.maxResults || 50;

    console.log(`Manually fetching up to ${maxResults} videos...`);

    // Fetch videos from YouTube
    const videos = await getChannelVideos(channelId, maxResults);

    console.log(`Found ${videos.length} videos`);

    let savedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Save or update videos in database
    for (const videoData of videos) {
      const existing = await prisma.video.findUnique({
        where: { youtubeId: videoData.youtubeId },
      });

      if (existing) {
        // Update existing video
        await prisma.video.update({
          where: { youtubeId: videoData.youtubeId },
          data: {
            title: videoData.title,
            description: videoData.description,
            thumbnailUrl: videoData.thumbnailUrl,
            duration: videoData.duration,
          },
        });
        updatedCount++;
        continue;
      }

      // Fetch transcript for new video
      let transcript = null;
      try {
        transcript = await getVideoTranscript(videoData.youtubeId);
        console.log(
          `Fetched transcript for ${videoData.youtubeId}: ${transcript ? "success" : "no transcript available"
          }`
        );
      } catch (error) {
        console.error(
          `Failed to fetch transcript for ${videoData.youtubeId}:`,
          error
        );
      }

      // Create new video
      await prisma.video.create({
        data: {
          youtubeId: videoData.youtubeId,
          title: videoData.title,
          description: videoData.description,
          thumbnailUrl: videoData.thumbnailUrl,
          duration: videoData.duration,
          publishedAt: videoData.publishedAt,
          transcript: transcript,
          processed: false,
        },
      });

      console.log(`Saved new video: ${videoData.title}`);
      savedCount++;
    }

    return NextResponse.json({
      success: true,
      message: "Manual sync completed",
      stats: {
        total: videos.length,
        saved: savedCount,
        updated: updatedCount,
        skipped: skippedCount,
      },
    });
  } catch (error) {
    console.error("Error in manual video sync:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
