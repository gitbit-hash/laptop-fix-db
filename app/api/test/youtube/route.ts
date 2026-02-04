import { NextResponse } from "next/server";
import { google } from "googleapis";

/**
 * Detailed YouTube API diagnostic test
 */
export async function GET(request: Request) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID;

    // Step 1: Check environment variables
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        step: "env_check",
        error: "YOUTUBE_API_KEY is not set",
      });
    }

    if (!channelId) {
      return NextResponse.json({
        success: false,
        step: "env_check",
        error: "YOUTUBE_CHANNEL_ID is not set",
      });
    }

    const youtube = google.youtube({
      version: "v3",
      auth: apiKey,
    });

    console.log("=== YouTube API Diagnostic Test ===");
    console.log("Channel ID:", channelId);

    // Step 2: Test basic API connectivity
    try {
      const channelResponse = await youtube.channels.list({
        part: ["snippet", "statistics"],
        id: [channelId],
      });

      console.log("Channel response:", JSON.stringify(channelResponse.data, null, 2));

      if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
        return NextResponse.json({
          success: false,
          step: "channel_lookup",
          error: "Channel not found with the provided ID",
          channelId,
          suggestion: "Double-check the channel ID. You can find it by going to the channel and looking at the URL.",
        });
      }

      const channel = channelResponse.data.items[0];
      console.log("Channel found:", channel.snippet?.title);

      // Step 3: Search for videos
      console.log("Searching for videos...");
      const searchResponse = await youtube.search.list({
        part: ["snippet"],
        channelId,
        maxResults: 5,
        order: "date",
        type: ["video"],
      });

      console.log("Search response:", JSON.stringify(searchResponse.data, null, 2));

      const videoCount = searchResponse.data.items?.length || 0;

      // Step 4: Get video details if found
      let videoDetails = null;
      if (videoCount > 0) {
        const videoIds = searchResponse.data.items!
          .map((item) => item.id?.videoId)
          .filter(Boolean) as string[];

        if (videoIds.length > 0) {
          const detailsResponse = await youtube.videos.list({
            part: ["snippet", "contentDetails"],
            id: videoIds,
          });
          videoDetails = detailsResponse.data.items;
        }
      }

      return NextResponse.json({
        success: true,
        message: "Diagnostic complete ✅",
        steps: {
          "1_api_key": "✅ Valid",
          "2_channel_found": "✅ " + channel.snippet?.title,
          "3_channel_stats": {
            subscribers: channel.statistics?.subscriberCount,
            videos: channel.statistics?.videoCount,
            views: channel.statistics?.viewCount,
          },
          "4_videos_search": videoCount > 0 ? `✅ Found ${videoCount} videos` : "❌ No videos found",
        },
        data: {
          channelInfo: {
            title: channel.snippet?.title,
            description: channel.snippet?.description?.substring(0, 200),
            customUrl: channel.snippet?.customUrl,
          },
          sampleVideos: videoDetails?.slice(0, 3).map((v) => ({
            id: v.id,
            title: v.snippet?.title,
            publishedAt: v.snippet?.publishedAt,
          })),
        },
      });
    } catch (apiError: any) {
      console.error("API Error:", apiError);
      return NextResponse.json({
        success: false,
        step: "api_call",
        error: apiError.message || "API call failed",
        details: apiError.errors || apiError,
      });
    }
  } catch (error: any) {
    console.error("Test error:", error);
    return NextResponse.json({
      success: false,
      step: "unknown",
      error: error.message || "Unknown error",
    });
  }
}
