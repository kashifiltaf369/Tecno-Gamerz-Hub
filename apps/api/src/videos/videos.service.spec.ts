import { Test, TestingModule } from '@nestjs/testing';
import { VideosService } from './videos.service';
import { PrismaService } from '../common/services/prisma.service';
import { YouTubeService } from './services/youtube.service';
import { ConfigService } from '@nestjs/config';

describe('VideosService', () => {
  let service: VideosService;
  let prismaService: PrismaService;
  let youtubeService: YouTubeService;

  const mockPrismaService = {
    video: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    videoInteraction: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    videoQuizAttempt: {
      count: jest.fn(),
    },
    channel: {
      upsert: jest.fn(),
    },
  };

  const mockYouTubeService = {
    isAvailable: jest.fn(),
    getChannel: jest.fn(),
    getChannelVideos: jest.fn(),
    getVideoTranscript: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideosService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: YouTubeService,
          useValue: mockYouTubeService,
        },
      ],
    }).compile();

    service = module.get<VideosService>(VideosService);
    prismaService = module.get<PrismaService>(PrismaService);
    youtubeService = module.get<YouTubeService>(YouTubeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getVideos', () => {
    it('should return paginated videos with filters', async () => {
      const mockVideos = [
        {
          id: '1',
          title: 'Test Video',
          youtubeId: 'test123',
          channel: { id: 'ch1', name: 'Test Channel', externalId: 'ext1' },
          views: 100,
          tags: ['gaming'],
          _count: { videoInteractions: 0, videoQuizzes: 0, videoClips: 0 },
        },
      ];

      mockPrismaService.video.findMany.mockResolvedValue(mockVideos);
      mockPrismaService.video.count.mockResolvedValue(1);

      const filters = {
        search: 'test',
        page: 1,
        limit: 20,
        sort: 'newest',
      };

      const result = await service.getVideos(filters);

      expect(result.videos).toHaveLength(1);
      expect(result.pagination.totalCount).toBe(1);
      expect(mockPrismaService.video.findMany).toHaveBeenCalled();
      expect(mockPrismaService.video.count).toHaveBeenCalled();
    });

    it('should filter by search query', async () => {
      const filters = {
        search: 'GTA',
        page: 1,
        limit: 20,
        sort: 'newest',
      };

      mockPrismaService.video.findMany.mockResolvedValue([]);
      mockPrismaService.video.count.mockResolvedValue(0);

      await service.getVideos(filters);

      expect(mockPrismaService.video.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'GTA', mode: 'insensitive' } },
              { description: { contains: 'GTA', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('should filter by tags', async () => {
      const filters = {
        tag: 'gaming',
        page: 1,
        limit: 20,
        sort: 'newest',
      };

      mockPrismaService.video.findMany.mockResolvedValue([]);
      mockPrismaService.video.count.mockResolvedValue(0);

      await service.getVideos(filters);

      expect(mockPrismaService.video.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tags: { has: 'gaming' },
          }),
        }),
      );
    });

    it('should filter official content', async () => {
      const filters = {
        official: true,
        page: 1,
        limit: 20,
        sort: 'newest',
      };

      mockPrismaService.video.findMany.mockResolvedValue([]);
      mockPrismaService.video.count.mockResolvedValue(0);

      await service.getVideos(filters);

      expect(mockPrismaService.video.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            channel: {
              name: { contains: 'Techno Gamerz', mode: 'insensitive' },
            },
          }),
        }),
      );
    });
  });

  describe('getVideoById', () => {
    it('should return video with details', async () => {
      const mockVideo = {
        id: '1',
        title: 'Test Video',
        youtubeId: 'test123',
        channel: { id: 'ch1', name: 'Test Channel', externalId: 'ext1' },
        videoQuizzes: [],
        videoClips: [],
      };

      mockPrismaService.video.findUnique.mockResolvedValue(mockVideo);
      mockPrismaService.video.findMany.mockResolvedValue([]); // Related videos

      const result = await service.getVideoById('1');

      expect(result).toBeDefined();
      expect(result.id).toBe('1');
      expect(mockPrismaService.video.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException for non-existent video', async () => {
      mockPrismaService.video.findUnique.mockResolvedValue(null);

      await expect(service.getVideoById('nonexistent')).rejects.toThrow();
    });
  });

  describe('recordInteraction', () => {
    it('should record watch interaction', async () => {
      const mockVideo = { id: '1', title: 'Test Video' };
      mockPrismaService.video.findUnique.mockResolvedValue(mockVideo);
      mockPrismaService.videoInteraction.upsert.mockResolvedValue({});

      const dto = {
        videoId: '1',
        action: 'WATCH' as const,
        progress: 50,
      };

      await service.recordInteraction('user1', dto);

      expect(mockPrismaService.video.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should toggle like interaction', async () => {
      const mockVideo = { id: '1', title: 'Test Video' };
      mockPrismaService.video.findUnique.mockResolvedValue(mockVideo);
      mockPrismaService.videoInteraction.findUnique.mockResolvedValue(null);
      mockPrismaService.videoInteraction.create.mockResolvedValue({});

      const dto = {
        videoId: '1',
        action: 'LIKE' as const,
      };

      const result = await service.recordInteraction('user1', dto);

      expect(result).toEqual({ action: 'liked' });
      expect(mockPrismaService.videoInteraction.create).toHaveBeenCalled();
    });

    it('should mark video as complete', async () => {
      const mockVideo = { id: '1', title: 'Test Video' };
      mockPrismaService.video.findUnique.mockResolvedValue(mockVideo);
      mockPrismaService.videoInteraction.upsert.mockResolvedValue({});

      const dto = {
        videoId: '1',
        action: 'COMPLETE' as const,
      };

      await service.recordInteraction('user1', dto);

      expect(mockPrismaService.videoInteraction.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            action: 'COMPLETE',
            progress: 100,
          }),
          update: expect.objectContaining({
            progress: 100,
          }),
        }),
      );
    });
  });

  describe('createClip', () => {
    it('should create a video clip', async () => {
      const mockVideo = { id: '1', title: 'Test Video', duration: 300 };
      const mockClip = {
        id: 'clip1',
        title: 'Test Clip',
        user: { id: 'user1', name: 'Test User', username: 'testuser' },
        video: { title: 'Test Video', youtubeId: 'test123' },
      };

      mockPrismaService.video.findUnique.mockResolvedValue(mockVideo);
      mockPrismaService.videoClip.create.mockResolvedValue(mockClip);

      const dto = {
        videoId: '1',
        title: 'Test Clip',
        description: 'A test clip',
        startTime: 10,
        endTime: 60,
        isPublic: true,
      };

      const result = await service.createClip('user1', dto);

      expect(result).toBeDefined();
      expect(result.title).toBe('Test Clip');
      expect(mockPrismaService.videoClip.create).toHaveBeenCalled();
    });

    it('should validate clip times', async () => {
      const mockVideo = { id: '1', title: 'Test Video', duration: 300 };
      mockPrismaService.video.findUnique.mockResolvedValue(mockVideo);

      const dto = {
        videoId: '1',
        title: 'Test Clip',
        startTime: 100,
        endTime: 50, // End before start
        isPublic: true,
      };

      await expect(service.createClip('user1', dto)).rejects.toThrow(
        'Start time must be before end time',
      );
    });

    it('should validate clip end time against video duration', async () => {
      const mockVideo = { id: '1', title: 'Test Video', duration: 300 };
      mockPrismaService.video.findUnique.mockResolvedValue(mockVideo);

      const dto = {
        videoId: '1',
        title: 'Test Clip',
        startTime: 10,
        endTime: 400, // Beyond video duration
        isPublic: true,
      };

      await expect(service.createClip('user1', dto)).rejects.toThrow(
        'End time cannot exceed video duration',
      );
    });
  });

  describe('syncChannelVideos', () => {
    it('should sync videos from YouTube channel', async () => {
      const mockChannelInfo = {
        id: 'UC123',
        title: 'Test Channel',
        description: 'A test channel',
        thumbnails: {},
      };

      const mockYouTubeVideos = [
        {
          id: 'video1',
          title: 'Test Video 1',
          description: 'Description 1',
          publishedAt: '2024-01-01T00:00:00Z',
          thumbnails: {},
          duration: 300,
          tags: ['test'],
          channelId: 'UC123',
          channelTitle: 'Test Channel',
        },
      ];

      const mockChannel = { id: 'ch1', name: 'Test Channel', externalId: 'UC123' };

      mockYouTubeService.isAvailable.mockReturnValue(true);
      mockYouTubeService.getChannel.mockResolvedValue(mockChannelInfo);
      mockYouTubeService.getChannelVideos.mockResolvedValue({
        videos: mockYouTubeVideos,
      });
      mockYouTubeService.getVideoTranscript.mockResolvedValue(null);

      mockPrismaService.channel.upsert.mockResolvedValue(mockChannel);
      mockPrismaService.video.findUnique.mockResolvedValue(null);
      mockPrismaService.video.create.mockResolvedValue({});

      const dto = {
        channelId: 'UC123',
        maxResults: 10,
        forceRefresh: false,
      };

      const result = await service.syncChannelVideos(dto);

      expect(result.created).toBe(1);
      expect(result.updated).toBe(0);
      expect(mockYouTubeService.getChannel).toHaveBeenCalledWith('UC123');
      expect(mockYouTubeService.getChannelVideos).toHaveBeenCalledWith('UC123', 10);
      expect(mockPrismaService.video.create).toHaveBeenCalled();
    });

    it('should handle YouTube API unavailable', async () => {
      mockYouTubeService.isAvailable.mockReturnValue(false);

      const dto = {
        channelId: 'UC123',
        maxResults: 10,
        forceRefresh: false,
      };

      await expect(service.syncChannelVideos(dto)).rejects.toThrow(
        'YouTube API not available',
      );
    });
  });
});