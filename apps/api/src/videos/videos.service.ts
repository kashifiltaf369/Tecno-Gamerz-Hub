import { Injectable, Logger, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { YouTubeService } from './services/youtube.service';
import { 
  VideoFiltersDto, 
  SyncVideosDto, 
  CreateVideoInteractionDto, 
  CreateVideoClipDto, 
  CreateVideoQuizDto,
  SubmitQuizAnswersDto 
} from './dto/video.dto';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(
    private prisma: PrismaService,
    private youtubeService: YouTubeService,
  ) {}

  /**
   * Get paginated list of videos with filters
   */
  async getVideos(filters: VideoFiltersDto, userId?: string) {
    const { search, tag, official, sort, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Tag filter
    if (tag) {
      where.tags = { has: tag };
    }

    // Official filter (TecnoGamerz channel only)
    if (official) {
      where.channel = {
        name: { contains: 'Techno Gamerz', mode: 'insensitive' },
      };
    }

    // Sort order
    let orderBy: any = {};
    switch (sort) {
      case 'oldest':
        orderBy = { publishedAt: 'asc' };
        break;
      case 'most_viewed':
        orderBy = { views: 'desc' };
        break;
      case 'alphabetical':
        orderBy = { title: 'asc' };
        break;
      case 'newest':
      default:
        orderBy = { publishedAt: 'desc' };
        break;
    }

    const [videos, totalCount] = await Promise.all([
      this.prisma.video.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          channel: true,
          _count: {
            select: {
              videoInteractions: true,
              videoQuizzes: true,
              videoClips: true,
            },
          },
        },
      }),
      this.prisma.video.count({ where }),
    ]);

    // Add user interaction data if userId provided
    const videosWithUserData = await Promise.all(
      videos.map(async (video) => {
        let userProgress = null;
        
        if (userId) {
          const interactions = await this.prisma.videoInteraction.findMany({
            where: { userId, videoId: video.id },
          });

          const watchInteraction = interactions.find(i => i.action === 'WATCH');
          const likeInteraction = interactions.find(i => i.action === 'LIKE');
          const completeInteraction = interactions.find(i => i.action === 'COMPLETE');
          
          const quizzesCompleted = await this.prisma.videoQuizAttempt.count({
            where: { userId, quiz: { videoId: video.id } },
          });

          userProgress = {
            watchProgress: watchInteraction?.progress || 0,
            hasLiked: !!likeInteraction,
            hasCompleted: !!completeInteraction,
            quizzesCompleted,
          };
        }

        return {
          ...video,
          userProgress,
          isOfficial: video.channel.name.toLowerCase().includes('techno gamerz'),
        };
      }),
    );

    return {
      videos: videosWithUserData,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: skip + limit < totalCount,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get single video with detailed information
   */
  async getVideoById(id: string, userId?: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: {
        channel: true,
        videoQuizzes: {
          include: {
            _count: {
              select: { quizAttempts: true },
            },
          },
        },
        videoClips: {
          where: { isPublic: true },
          include: {
            user: { select: { id: true, name: true, username: true, image: true } },
            _count: { select: { clipLikes: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Get related videos (same channel, excluding current video)
    const relatedVideos = await this.prisma.video.findMany({
      where: {
        channelId: video.channelId,
        id: { not: video.id },
      },
      include: { channel: true },
      orderBy: { publishedAt: 'desc' },
      take: 6,
    });

    // Get user progress if userId provided
    let userProgress = null;
    if (userId) {
      const interactions = await this.prisma.videoInteraction.findMany({
        where: { userId, videoId: video.id },
      });

      const watchInteraction = interactions.find(i => i.action === 'WATCH');
      const likeInteraction = interactions.find(i => i.action === 'LIKE');
      const completeInteraction = interactions.find(i => i.action === 'COMPLETE');
      
      const quizzesCompleted = await this.prisma.videoQuizAttempt.count({
        where: { userId, quiz: { videoId: video.id } },
      });

      const userClipLikes = await this.prisma.videoClipLike.findMany({
        where: { 
          userId,
          clip: { videoId: video.id },
        },
        select: { clipId: true },
      });

      userProgress = {
        watchProgress: watchInteraction?.progress || 0,
        hasLiked: !!likeInteraction,
        hasCompleted: !!completeInteraction,
        quizzesCompleted,
        likedClips: userClipLikes.map(like => like.clipId),
      };
    }

    // Increment view count (debounced per user)
    if (userId) {
      await this.incrementViewCount(video.id, userId);
    }

    return {
      ...video,
      relatedVideos,
      userProgress,
      isOfficial: video.channel.name.toLowerCase().includes('techno gamerz'),
    };
  }

  /**
   * Get video transcript
   */
  async getVideoTranscript(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      select: { transcript: true, title: true },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    return {
      transcript: video.transcript,
      hasTranscript: !!video.transcript,
    };
  }

  /**
   * Record video interaction
   */
  async recordInteraction(userId: string, dto: CreateVideoInteractionDto) {
    const { videoId, action, progress, metadata } = dto;

    // Verify video exists
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Handle different interaction types
    switch (action) {
      case 'WATCH':
        return this.updateWatchProgress(userId, videoId, progress || 0, metadata);
      case 'LIKE':
        return this.toggleVideoLike(userId, videoId);
      case 'COMPLETE':
        return this.markVideoComplete(userId, videoId);
      default:
        // Record generic interaction
        return this.prisma.videoInteraction.upsert({
          where: {
            userId_videoId_action: {
              userId,
              videoId,
              action: action as any,
            },
          },
          create: {
            userId,
            videoId,
            action: action as any,
            progress,
            metadata,
          },
          update: {
            progress,
            metadata,
          },
        });
    }
  }

  /**
   * Create video clip
   */
  async createClip(userId: string, dto: CreateVideoClipDto) {
    const { videoId, title, description, startTime, endTime, isPublic } = dto;

    // Verify video exists
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    // Validate clip times
    if (startTime >= endTime) {
      throw new HttpException(
        'Start time must be before end time',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (video.duration && endTime > video.duration) {
      throw new HttpException(
        'End time cannot exceed video duration',
        HttpStatus.BAD_REQUEST,
      );
    }

    const clip = await this.prisma.videoClip.create({
      data: {
        userId,
        videoId,
        title,
        description,
        startTime,
        endTime,
        isPublic: isPublic ?? true,
      },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
        video: { select: { title: true, youtubeId: true } },
      },
    });

    return clip;
  }

  /**
   * Sync videos from YouTube channel
   */
  async syncChannelVideos(dto: SyncVideosDto) {
    const { channelId, maxResults, forceRefresh } = dto;

    if (!this.youtubeService.isAvailable()) {
      throw new HttpException(
        'YouTube API not available',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Get or create channel record
      const channelInfo = await this.youtubeService.getChannel(channelId);
      
      const channel = await this.prisma.channel.upsert({
        where: { externalId: channelId },
        create: {
          name: channelInfo.title,
          source: 'youtube',
          externalId: channelId,
        },
        update: {
          name: channelInfo.title,
        },
      });

      // Get videos from YouTube
      const { videos: youtubeVideos } = await this.youtubeService.getChannelVideos(
        channelId,
        maxResults,
      );

      const syncResults = {
        channelId: channel.id,
        channelName: channel.name,
        totalFound: youtubeVideos.length,
        created: 0,
        updated: 0,
        errors: [] as string[],
      };

      // Process each video
      for (const ytVideo of youtubeVideos) {
        try {
          const existingVideo = await this.prisma.video.findUnique({
            where: { youtubeId: ytVideo.id },
          });

          if (existingVideo && !forceRefresh) {
            continue; // Skip existing videos unless force refresh
          }

          // Get transcript if available
          const transcript = await this.youtubeService.getVideoTranscript(ytVideo.id);

          const videoData = {
            title: ytVideo.title,
            description: ytVideo.description,
            youtubeId: ytVideo.id,
            duration: ytVideo.duration,
            publishedAt: new Date(ytVideo.publishedAt),
            thumbnails: ytVideo.thumbnails,
            tags: ytVideo.tags || [],
            transcript: transcript || undefined,
            channelId: channel.id,
          };

          if (existingVideo) {
            // Update existing video
            await this.prisma.video.update({
              where: { id: existingVideo.id },
              data: videoData,
            });
            syncResults.updated++;
          } else {
            // Create new video
            await this.prisma.video.create({
              data: videoData,
            });
            syncResults.created++;
          }

        } catch (error) {
          this.logger.error(`Error processing video ${ytVideo.id}:`, error);
          syncResults.errors.push(`Video ${ytVideo.title}: ${error.message}`);
        }
      }

      this.logger.log(
        `Sync completed for channel ${channel.name}: ${syncResults.created} created, ${syncResults.updated} updated`,
      );

      return syncResults;

    } catch (error) {
      this.logger.error('Error syncing channel videos:', error);
      throw new HttpException(
        'Failed to sync channel videos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Private helper methods
   */
  private async updateWatchProgress(
    userId: string, 
    videoId: string, 
    progress: number, 
    metadata?: any,
  ) {
    const interaction = await this.prisma.videoInteraction.upsert({
      where: {
        userId_videoId_action: {
          userId,
          videoId,
          action: 'WATCH',
        },
      },
      create: {
        userId,
        videoId,
        action: 'WATCH',
        progress,
        metadata,
      },
      update: {
        progress: Math.max(progress, 0), // Always use highest progress
        metadata,
      },
    });

    // Auto-complete if progress >= 90%
    if (progress >= 90) {
      await this.markVideoComplete(userId, videoId);
    }

    return interaction;
  }

  private async toggleVideoLike(userId: string, videoId: string) {
    const existingLike = await this.prisma.videoInteraction.findUnique({
      where: {
        userId_videoId_action: {
          userId,
          videoId,
          action: 'LIKE',
        },
      },
    });

    if (existingLike) {
      // Remove like
      await this.prisma.videoInteraction.delete({
        where: { id: existingLike.id },
      });
      return { action: 'unliked' };
    } else {
      // Add like
      await this.prisma.videoInteraction.create({
        data: {
          userId,
          videoId,
          action: 'LIKE',
        },
      });
      return { action: 'liked' };
    }
  }

  private async markVideoComplete(userId: string, videoId: string) {
    const interaction = await this.prisma.videoInteraction.upsert({
      where: {
        userId_videoId_action: {
          userId,
          videoId,
          action: 'COMPLETE',
        },
      },
      create: {
        userId,
        videoId,
        action: 'COMPLETE',
        progress: 100,
      },
      update: {
        progress: 100,
      },
    });

    // Award XP for completing video (only once)
    if (!interaction.id) { // This is a new record
      // TODO: Integrate with gamification service to award XP
      this.logger.log(`User ${userId} completed video ${videoId} - award XP`);
    }

    return interaction;
  }

  private async incrementViewCount(videoId: string, userId: string) {
    // Check if user has already viewed this video in the last 24 hours
    const recentView = await this.prisma.videoInteraction.findFirst({
      where: {
        userId,
        videoId,
        action: 'WATCH',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    if (!recentView) {
      // Increment view count
      await this.prisma.video.update({
        where: { id: videoId },
        data: { views: { increment: 1 } },
      });
    }
  }
}