/**
 * YouTube API Service
 *
 * Frontend-side YouTube Data API v3 integration for fetching channel videos.
 * Uses Google's official YouTube Data API to retrieve video metadata.
 *
 * Features:
 * - Fetch videos from YouTube channel
 * - Get channel information (subscribers, video count)
 * - Parse video metadata (title, thumbnail, duration, views)
 * - Support for pagination (50 videos per request)
 * - No backend required (client-side API calls)
 *
 * Setup:
 * 1. Get YouTube Data API v3 key from Google Cloud Console
 * 2. Set PUBLIC_YOUTUBE_API_KEY in .env
 * 3. Enable YouTube Data API v3 in Google Cloud Console
 *
 * API Limits:
 * - 10,000 quota units per day (free tier)
 * - Each search/list request costs 100 units
 * - Can fetch ~100 videos per day on free tier
 *
 * @see https://developers.google.com/youtube/v3
 */

import { z } from 'zod';

// YouTube API response schemas
const YouTubeVideoSchema = z.object({
  id: z.object({
    videoId: z.string(),
  }),
  snippet: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.string(),
    thumbnails: z.object({
      default: z.object({ url: z.string() }),
      medium: z.object({ url: z.string() }),
      high: z.object({ url: z.string() }),
      standard: z.object({ url: z.string() }).optional(),
      maxres: z.object({ url: z.string() }).optional(),
    }),
    channelId: z.string(),
    channelTitle: z.string(),
  }),
});

const YouTubeVideoDetailsSchema = z.object({
  id: z.string(),
  contentDetails: z.object({
    duration: z.string(), // ISO 8601 format (PT#M#S)
  }),
  statistics: z.object({
    viewCount: z.string(),
    likeCount: z.string().optional(),
    commentCount: z.string().optional(),
  }),
});

const YouTubeChannelSchema = z.object({
  id: z.string(),
  snippet: z.object({
    title: z.string(),
    description: z.string(),
    thumbnails: z.object({
      default: z.object({ url: z.string() }),
      medium: z.object({ url: z.string() }),
      high: z.object({ url: z.string() }),
    }),
    customUrl: z.string().optional(),
  }),
  statistics: z.object({
    viewCount: z.string(),
    subscriberCount: z.string(),
    videoCount: z.string(),
  }),
});

// Parsed video type for our app
export interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string; // High quality thumbnail
  thumbnailMedium: string;
  thumbnailHigh: string;
  duration: number; // Seconds
  durationFormatted: string; // MM:SS or HH:MM:SS
  publishedAt: Date;
  channelId: string;
  channelTitle: string;
  views: number;
  likes?: number;
  comments?: number;
}

// Channel information
export interface YouTubeChannel {
  channelId: string;
  title: string;
  description: string;
  thumbnail: string;
  customUrl?: string;
  totalViews: number;
  subscribers: number;
  videoCount: number;
}

/**
 * Convert ISO 8601 duration to seconds
 * PT1H2M10S -> 3730 seconds
 * PT5M30S -> 330 seconds
 */
function parseDuration(isoDuration: string): number {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Format duration from seconds to MM:SS or HH:MM:SS
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

/**
 * YouTube Service Error
 */
export class YouTubeServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'YouTubeServiceError';
  }
}

/**
 * YouTube API Service
 */
export class YouTubeService {
  private apiKey: string;
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(apiKey?: string) {
    // Try to get API key from env or constructor
    this.apiKey = apiKey || import.meta.env.PUBLIC_YOUTUBE_API_KEY || '';

    if (!this.apiKey) {
      console.warn('YouTube API key not configured. Set PUBLIC_YOUTUBE_API_KEY in .env');
    }
  }

  /**
   * Check if YouTube API is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Fetch videos from a YouTube channel
   *
   * @param channelId - YouTube channel ID (e.g., "UCXuqSBlHAE6Xw-yeJA0Tunw")
   * @param maxResults - Maximum number of videos to fetch (default: 50, max: 50)
   * @returns Array of parsed YouTube videos
   */
  async getChannelVideos(
    channelId: string,
    maxResults: number = 50
  ): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      throw new YouTubeServiceError(
        'YouTube API key not configured',
        'NO_API_KEY'
      );
    }

    try {
      // Step 1: Search for videos in the channel
      const searchUrl = new URL(`${this.baseUrl}/search`);
      searchUrl.searchParams.set('part', 'id,snippet');
      searchUrl.searchParams.set('channelId', channelId);
      searchUrl.searchParams.set('type', 'video');
      searchUrl.searchParams.set('order', 'date'); // Newest first
      searchUrl.searchParams.set('maxResults', String(Math.min(maxResults, 50)));
      searchUrl.searchParams.set('key', this.apiKey);

      const searchResponse = await fetch(searchUrl.toString());

      if (!searchResponse.ok) {
        const error = await searchResponse.json();
        throw new YouTubeServiceError(
          error.error?.message || 'Failed to fetch channel videos',
          error.error?.code,
          searchResponse.status
        );
      }

      const searchData = await searchResponse.json();
      const videos = searchData.items || [];

      if (videos.length === 0) {
        return [];
      }

      // Step 2: Get detailed video information (duration, views, etc.)
      const videoIds = videos.map((v: any) => v.id.videoId).join(',');
      const detailsUrl = new URL(`${this.baseUrl}/videos`);
      detailsUrl.searchParams.set('part', 'contentDetails,statistics');
      detailsUrl.searchParams.set('id', videoIds);
      detailsUrl.searchParams.set('key', this.apiKey);

      const detailsResponse = await fetch(detailsUrl.toString());

      if (!detailsResponse.ok) {
        throw new YouTubeServiceError(
          'Failed to fetch video details',
          'DETAILS_FETCH_FAILED',
          detailsResponse.status
        );
      }

      const detailsData = await detailsResponse.json();
      const videoDetails = detailsData.items || [];

      // Step 3: Merge and parse data
      const parsedVideos: YouTubeVideo[] = videos.map((video: any) => {
        const snippet = video.snippet;
        const details = videoDetails.find((d: any) => d.id === video.id.videoId);

        const duration = details ? parseDuration(details.contentDetails.duration) : 0;

        return {
          videoId: video.id.videoId,
          title: snippet.title,
          description: snippet.description,
          thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.medium.url,
          thumbnailMedium: snippet.thumbnails.medium.url,
          thumbnailHigh: snippet.thumbnails.high?.url || snippet.thumbnails.medium.url,
          duration,
          durationFormatted: formatDuration(duration),
          publishedAt: new Date(snippet.publishedAt),
          channelId: snippet.channelId,
          channelTitle: snippet.channelTitle,
          views: details ? parseInt(details.statistics.viewCount) : 0,
          likes: details?.statistics.likeCount ? parseInt(details.statistics.likeCount) : undefined,
          comments: details?.statistics.commentCount ? parseInt(details.statistics.commentCount) : undefined,
        };
      });

      return parsedVideos;
    } catch (error) {
      if (error instanceof YouTubeServiceError) {
        throw error;
      }

      throw new YouTubeServiceError(
        error instanceof Error ? error.message : 'Unknown error fetching channel videos',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Get YouTube channel information
   *
   * @param channelId - YouTube channel ID
   * @returns Channel information (name, subscribers, video count, etc.)
   */
  async getChannelInfo(channelId: string): Promise<YouTubeChannel> {
    if (!this.apiKey) {
      throw new YouTubeServiceError(
        'YouTube API key not configured',
        'NO_API_KEY'
      );
    }

    try {
      const url = new URL(`${this.baseUrl}/channels`);
      url.searchParams.set('part', 'snippet,statistics');
      url.searchParams.set('id', channelId);
      url.searchParams.set('key', this.apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        const error = await response.json();
        throw new YouTubeServiceError(
          error.error?.message || 'Failed to fetch channel info',
          error.error?.code,
          response.status
        );
      }

      const data = await response.json();
      const channel = data.items?.[0];

      if (!channel) {
        throw new YouTubeServiceError(
          'Channel not found',
          'CHANNEL_NOT_FOUND',
          404
        );
      }

      return {
        channelId: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnail: channel.snippet.thumbnails.high?.url || channel.snippet.thumbnails.medium.url,
        customUrl: channel.snippet.customUrl,
        totalViews: parseInt(channel.statistics.viewCount),
        subscribers: parseInt(channel.statistics.subscriberCount),
        videoCount: parseInt(channel.statistics.videoCount),
      };
    } catch (error) {
      if (error instanceof YouTubeServiceError) {
        throw error;
      }

      throw new YouTubeServiceError(
        error instanceof Error ? error.message : 'Unknown error fetching channel info',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Search for a channel by username or custom URL
   *
   * @param query - Channel username or name (e.g., "LinusTechTips")
   * @returns Channel ID if found
   */
  async searchChannel(query: string): Promise<string | null> {
    if (!this.apiKey) {
      throw new YouTubeServiceError(
        'YouTube API key not configured',
        'NO_API_KEY'
      );
    }

    try {
      const url = new URL(`${this.baseUrl}/search`);
      url.searchParams.set('part', 'snippet');
      url.searchParams.set('type', 'channel');
      url.searchParams.set('q', query);
      url.searchParams.set('maxResults', '1');
      url.searchParams.set('key', this.apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new YouTubeServiceError(
          'Failed to search for channel',
          'SEARCH_FAILED',
          response.status
        );
      }

      const data = await response.json();
      const channel = data.items?.[0];

      return channel?.id?.channelId || null;
    } catch (error) {
      if (error instanceof YouTubeServiceError) {
        throw error;
      }

      throw new YouTubeServiceError(
        error instanceof Error ? error.message : 'Unknown error searching for channel',
        'UNKNOWN_ERROR'
      );
    }
  }

  /**
   * Get a single video's information
   *
   * @param videoId - YouTube video ID
   * @returns Parsed video information
   */
  async getVideo(videoId: string): Promise<YouTubeVideo | null> {
    if (!this.apiKey) {
      throw new YouTubeServiceError(
        'YouTube API key not configured',
        'NO_API_KEY'
      );
    }

    try {
      const url = new URL(`${this.baseUrl}/videos`);
      url.searchParams.set('part', 'snippet,contentDetails,statistics');
      url.searchParams.set('id', videoId);
      url.searchParams.set('key', this.apiKey);

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new YouTubeServiceError(
          'Failed to fetch video',
          'VIDEO_FETCH_FAILED',
          response.status
        );
      }

      const data = await response.json();
      const video = data.items?.[0];

      if (!video) {
        return null;
      }

      const snippet = video.snippet;
      const duration = parseDuration(video.contentDetails.duration);

      return {
        videoId: video.id,
        title: snippet.title,
        description: snippet.description,
        thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.medium.url,
        thumbnailMedium: snippet.thumbnails.medium.url,
        thumbnailHigh: snippet.thumbnails.high?.url || snippet.thumbnails.medium.url,
        duration,
        durationFormatted: formatDuration(duration),
        publishedAt: new Date(snippet.publishedAt),
        channelId: snippet.channelId,
        channelTitle: snippet.channelTitle,
        views: parseInt(video.statistics.viewCount),
        likes: video.statistics.likeCount ? parseInt(video.statistics.likeCount) : undefined,
        comments: video.statistics.commentCount ? parseInt(video.statistics.commentCount) : undefined,
      };
    } catch (error) {
      if (error instanceof YouTubeServiceError) {
        throw error;
      }

      throw new YouTubeServiceError(
        error instanceof Error ? error.message : 'Unknown error fetching video',
        'UNKNOWN_ERROR'
      );
    }
  }
}

/**
 * Export a default instance
 */
export const youtubeService = new YouTubeService();
