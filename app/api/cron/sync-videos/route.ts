import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getNewVideos, getVideoTranscript } from "@/lib/youtube";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max execution time

/**
 * Cron job to sync new videos from YouTube
 * This should be triggered daily by Vercel Cron
 */
export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const channelId = process.env.YOUTUBE_CHANNEL_ID;
    if (!channelId) {
      return NextResponse.json(
        { error: "YOUTUBE_CHANNEL_ID not configured" },
        { status: 500 }
      );
    }

    // Get the date of the latest video in our database
    const latestVideo = await prisma.video.findFirst({
      orderBy: { publishedAt: "desc" },
      select: { publishedAt: true },
    });

    // If we have videos, only fetch new ones; otherwise fetch last 50
    const afterDate = latestVideo
      ? latestVideo.publishedAt
      : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000); // Last year

    console.log(`Fetching videos published after: ${afterDate}`);

    // Fetch new videos from YouTube
    const newVideos = await getNewVideos(channelId, afterDate);

    console.log(`Found ${newVideos.length} new videos`);

    let savedCount = 0;
    let skippedCount = 0;

    // Save new videos to database
    for (const videoData of newVideos) {
      // Check if video already exists
      const existing = await prisma.video.findUnique({
        where: { youtubeId: videoData.youtubeId },
      });

      if (existing) {
        console.log(`Video ${videoData.youtubeId} already exists, skipping`);
        skippedCount++;
        continue;
      }

      // Fetch transcript
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

      // Save video
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

      console.log(`Saved video: ${videoData.title}`);
      savedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed`,
      stats: {
        total: newVideos.length,
        saved: savedCount,
        skipped: skippedCount,
      },
    });
  } catch (error) {
    console.error("Error in video sync cron:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}
