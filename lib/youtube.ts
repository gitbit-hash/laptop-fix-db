import { google } from "googleapis";
import { YoutubeTranscript } from "youtube-transcript";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

export interface VideoData {
  youtubeId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  publishedAt: Date;
  transcript?: string;
}

/**
 * Get all videos from a channel
 */
export async function getChannelVideos(
  channelId: string,
  maxResults: number = 50,
  pageToken?: string
): Promise<{ videos: VideoData[]; nextPageToken?: string }> {
  try {
    console.log(`Searching for videos in channel: ${channelId}${pageToken ? ` (pageToken: ${pageToken})` : ''}`);

    const response = await youtube.search.list({
      part: ["snippet"],
      channelId,
      maxResults,
      order: "date",
      type: ["video"],
      pageToken,
    });

    if (!response.data.items || response.data.items.length === 0) {
      console.log("No videos found in search results");
      return { videos: [] };
    }

    console.log(`Found ${response.data.items.length} videos from search`);

    const videoIds = response.data.items
      .map((item) => item.id?.videoId)
      .filter((id): id is string => Boolean(id));

    console.log(`Extracted ${videoIds.length} video IDs:`, videoIds.slice(0, 3));

    if (videoIds.length === 0) {
      console.log("No valid video IDs extracted");
      return { videos: [] };
    }

    // Get detailed video information
    console.log(`Fetching details for ${videoIds.length} videos...`);
    const detailsResponse = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      id: videoIds,
    });

    if (!detailsResponse.data.items || detailsResponse.data.items.length === 0) {
      console.log("No video details returned");
      return { videos: [] };
    }

    console.log(`Got details for ${detailsResponse.data.items.length} videos`);

    const videos: VideoData[] = detailsResponse.data.items.map((video) => ({
      youtubeId: video.id!,
      title: video.snippet?.title || "",
      description: video.snippet?.description || "",
      thumbnailUrl: video.snippet?.thumbnails?.high?.url || "",
      duration: video.contentDetails?.duration || "",
      publishedAt: new Date(video.snippet?.publishedAt || Date.now()),
    }));

    return {
      videos,
      nextPageToken: response.data.nextPageToken || undefined,
    };
  } catch (error) {
    console.error("Error fetching channel videos:", error);
    if (error && typeof error === 'object' && 'message' in error) {
      throw error;
    }
    throw new Error("Failed to fetch channel videos");
  }
}

/**
 * Get video details by ID
 */
export async function getVideoDetails(videoId: string): Promise<VideoData> {
  try {
    const response = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      id: [videoId],
    });

    if (!response.data.items || response.data.items.length === 0) {
      throw new Error("Video not found");
    }

    const video = response.data.items[0];

    return {
      youtubeId: videoId,
      title: video.snippet?.title || "",
      description: video.snippet?.description || "",
      thumbnailUrl: video.snippet?.thumbnails?.high?.url || "",
      duration: video.contentDetails?.duration || "",
      publishedAt: new Date(video.snippet?.publishedAt || Date.now()),
    };
  } catch (error) {
    console.error("Error fetching video details:", error);
    throw new Error("Failed to fetch video details");
  }
}

/**
 * Get video transcript/captions
 */
export async function getVideoTranscript(
  videoId: string
): Promise<string | null> {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return null;
    }

    // Combine all transcript segments into a single text
    const fullTranscript = transcript.map((item) => item.text).join(" ");

    return fullTranscript;
  } catch (error) {
    console.error(`Error fetching transcript for video ${videoId}:`, error);
    // Some videos don't have transcripts, so we return null instead of throwing
    return null;
  }
}

/**
 * Get new videos published after a specific date
 */
export async function getNewVideos(
  channelId: string,
  afterDate: Date,
  maxResults: number = 50
): Promise<VideoData[]> {
  try {
    const response = await youtube.search.list({
      part: ["snippet"],
      channelId,
      maxResults,
      order: "date",
      type: ["video"],
      publishedAfter: afterDate.toISOString(),
    });

    if (!response.data.items || response.data.items.length === 0) {
      return [];
    }

    const videoIds = response.data.items
      .map((item) => item.id?.videoId)
      .filter((id): id is string => Boolean(id));

    if (videoIds.length === 0) {
      return [];
    }

    // Get detailed video information
    const detailsResponse = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      id: videoIds,
    });

    if (!detailsResponse.data.items) {
      return [];
    }

    const videos: VideoData[] = detailsResponse.data.items.map((video) => ({
      youtubeId: video.id!,
      title: video.snippet?.title || "",
      description: video.snippet?.description || "",
      thumbnailUrl: video.snippet?.thumbnails?.high?.url || "",
      duration: video.contentDetails?.duration || "",
      publishedAt: new Date(video.snippet?.publishedAt || Date.now()),
    }));

    return videos;
  } catch (error) {
    console.error("Error fetching new videos:", error);
    throw new Error("Failed to fetch new videos");
  }
}
