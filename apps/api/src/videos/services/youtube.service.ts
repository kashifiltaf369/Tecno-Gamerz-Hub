import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnails: any;
  duration: string;
  tags?: string[];
  channelId: string;
  channelTitle: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnails: any;
  subscriberCount?: string;
}

export interface YouTubeCaptions {
  text: string;
  start: number;
  duration: number;
}

@Injectable()
export class YouTubeService {
  private readonly logger = new Logger(YouTubeService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('YOUTUBE_API_KEY');
    
    if (!this.apiKey) {
      this.logger.warn('YouTube API key not configured. Video sync will not be available.');
    }
  }

  /**
   * Check if YouTube API is available
   */
  isAvailable(): boolean {
    return !!this.apiKey;
  }

  /**
   * Get channel information by channel ID
   */
  async getChannel(channelId: string): Promise<YouTubeChannel> {
    if (!this.isAvailable()) {
      throw new HttpException(
        'YouTube API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const response = await axios.get(`${this.baseUrl}/channels`, {
        params: {
          key: this.apiKey,
          id: channelId,
          part: 'snippet,statistics',
        },
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new HttpException(
          'Channel not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const channel = response.data.items[0];
      return {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        thumbnails: channel.snippet.thumbnails,
        subscriberCount: channel.statistics?.subscriberCount,
      };
    } catch (error) {
      this.logger.error('Error fetching channel info:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to fetch channel information',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get videos from a channel
   */
  async getChannelVideos(
    channelId: string,
    maxResults: number = 50,
    pageToken?: string,
  ): Promise<{ videos: YouTubeVideo[]; nextPageToken?: string }> {
    if (!this.isAvailable()) {
      throw new HttpException(
        'YouTube API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // First get the channel's uploads playlist
      const channelResponse = await axios.get(`${this.baseUrl}/channels`, {
        params: {
          key: this.apiKey,
          id: channelId,
          part: 'contentDetails',
        },
      });

      if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
        throw new HttpException(
          'Channel not found',
          HttpStatus.NOT_FOUND,
        );
      }

      const uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;

      // Get videos from uploads playlist
      const playlistResponse = await axios.get(`${this.baseUrl}/playlistItems`, {
        params: {
          key: this.apiKey,
          playlistId: uploadsPlaylistId,
          part: 'snippet',
          maxResults,
          pageToken,
          order: 'date',
        },
      });

      const videoIds = playlistResponse.data.items.map(
        (item: any) => item.snippet.resourceId.videoId,
      );

      if (videoIds.length === 0) {
        return { videos: [] };
      }

      // Get detailed video information
      const videosResponse = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          key: this.apiKey,
          id: videoIds.join(','),
          part: 'snippet,contentDetails,statistics',
        },
      });

      const videos: YouTubeVideo[] = videosResponse.data.items.map((video: any) => ({
        id: video.id,
        title: video.snippet.title,
        description: video.snippet.description,
        publishedAt: video.snippet.publishedAt,
        thumbnails: video.snippet.thumbnails,
        duration: this.parseDuration(video.contentDetails.duration),
        tags: video.snippet.tags || [],
        channelId: video.snippet.channelId,
        channelTitle: video.snippet.channelTitle,
      }));

      return {
        videos,
        nextPageToken: playlistResponse.data.nextPageToken,
      };
    } catch (error) {
      this.logger.error('Error fetching channel videos:', error);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to fetch channel videos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get video captions/transcript
   */
  async getVideoTranscript(videoId: string): Promise<string | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      // Get available captions
      const captionsResponse = await axios.get(`${this.baseUrl}/captions`, {
        params: {
          key: this.apiKey,
          videoId: videoId,
          part: 'snippet',
        },
      });

      if (!captionsResponse.data.items || captionsResponse.data.items.length === 0) {
        this.logger.debug(`No captions found for video ${videoId}`);
        return null;
      }

      // Find English captions or first available
      const caption = captionsResponse.data.items.find(
        (cap: any) => cap.snippet.language === 'en',
      ) || captionsResponse.data.items[0];

      if (!caption) {
        return null;
      }

      // Note: Downloading actual caption content requires OAuth
      // For now, we'll just return a placeholder or use a different approach
      this.logger.debug(`Captions available for video ${videoId} but download requires OAuth`);
      return null;
    } catch (error) {
      this.logger.warn(`Failed to fetch transcript for video ${videoId}:`, error);
      return null;
    }
  }

  /**
   * Parse ISO 8601 duration to seconds
   */
  private parseDuration(isoDuration: string): number {
    const matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!matches) return 0;
    
    const hours = parseInt(matches[1] || '0', 10);
    const minutes = parseInt(matches[2] || '0', 10);
    const seconds = parseInt(matches[3] || '0', 10);
    
    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Search for TecnoGamerz channel by name
   */
  async searchTecnoGamerzChannel(): Promise<string | null> {
    if (!this.isAvailable()) {
      return null;
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          key: this.apiKey,
          q: 'Techno Gamerz',
          type: 'channel',
          part: 'snippet',
          maxResults: 5,
        },
      });

      // Look for the official channel
      const channel = response.data.items?.find((item: any) =>
        item.snippet.title.toLowerCase().includes('techno gamerz') &&
        item.snippet.channelTitle.toLowerCase().includes('techno gamerz'),
      );

      return channel?.snippet.channelId || null;
    } catch (error) {
      this.logger.error('Error searching for TecnoGamerz channel:', error);
      return null;
    }
  }

  /**
   * Validate YouTube URL and extract video ID
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
      /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }
}