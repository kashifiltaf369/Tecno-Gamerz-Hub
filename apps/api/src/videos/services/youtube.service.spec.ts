import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { YouTubeService } from './youtube.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('YouTubeService', () => {
  let service: YouTubeService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YouTubeService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<YouTubeService>(YouTubeService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize with API key', () => {
      mockConfigService.get.mockReturnValue('test-api-key');
      
      const newService = new YouTubeService(configService);
      
      expect(newService.isAvailable()).toBe(true);
    });

    it('should handle missing API key', () => {
      mockConfigService.get.mockReturnValue(undefined);
      
      const newService = new YouTubeService(configService);
      
      expect(newService.isAvailable()).toBe(false);
    });
  });

  describe('isAvailable', () => {
    it('should return true when API key is configured', () => {
      mockConfigService.get.mockReturnValue('test-api-key');
      
      const newService = new YouTubeService(configService);
      
      expect(newService.isAvailable()).toBe(true);
    });

    it('should return false when API key is not configured', () => {
      mockConfigService.get.mockReturnValue(null);
      
      const newService = new YouTubeService(configService);
      
      expect(newService.isAvailable()).toBe(false);
    });
  });

  describe('getChannel', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue('test-api-key');
      service = new YouTubeService(configService);
    });

    it('should return channel information', async () => {
      const mockChannelData = {
        data: {
          items: [
            {
              id: 'UC123',
              snippet: {
                title: 'Test Channel',
                description: 'A test channel',
                thumbnails: { default: { url: 'thumbnail.jpg' } },
              },
              statistics: {
                subscriberCount: '1000',
              },
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockChannelData);

      const result = await service.getChannel('UC123');

      expect(result).toEqual({
        id: 'UC123',
        title: 'Test Channel',
        description: 'A test channel',
        thumbnails: { default: { url: 'thumbnail.jpg' } },
        subscriberCount: '1000',
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/youtube/v3/channels',
        {
          params: {
            key: 'test-api-key',
            id: 'UC123',
            part: 'snippet,statistics',
          },
        }
      );
    });

    it('should throw error when channel not found', async () => {
      const mockResponse = {
        data: { items: [] },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      await expect(service.getChannel('invalid')).rejects.toThrow('Channel not found');
    });

    it('should throw error when API key not configured', async () => {
      mockConfigService.get.mockReturnValue(null);
      const serviceWithoutKey = new YouTubeService(configService);

      await expect(serviceWithoutKey.getChannel('UC123')).rejects.toThrow(
        'YouTube API key not configured'
      );
    });

    it('should handle API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getChannel('UC123')).rejects.toThrow(
        'Failed to fetch channel information'
      );
    });
  });

  describe('getChannelVideos', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue('test-api-key');
      service = new YouTubeService(configService);
    });

    it('should return channel videos', async () => {
      const mockChannelResponse = {
        data: {
          items: [
            {
              contentDetails: {
                relatedPlaylists: {
                  uploads: 'UU123',
                },
              },
            },
          ],
        },
      };

      const mockPlaylistResponse = {
        data: {
          items: [
            {
              snippet: {
                resourceId: {
                  videoId: 'video123',
                },
              },
            },
          ],
          nextPageToken: 'next-token',
        },
      };

      const mockVideosResponse = {
        data: {
          items: [
            {
              id: 'video123',
              snippet: {
                title: 'Test Video',
                description: 'A test video',
                publishedAt: '2024-01-01T00:00:00Z',
                thumbnails: { default: { url: 'thumbnail.jpg' } },
                tags: ['test'],
                channelId: 'UC123',
                channelTitle: 'Test Channel',
              },
              contentDetails: {
                duration: 'PT5M30S', // 5 minutes 30 seconds
              },
            },
          ],
        },
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockChannelResponse)
        .mockResolvedValueOnce(mockPlaylistResponse)
        .mockResolvedValueOnce(mockVideosResponse);

      const result = await service.getChannelVideos('UC123', 10);

      expect(result.videos).toHaveLength(1);
      expect(result.videos[0]).toEqual({
        id: 'video123',
        title: 'Test Video',
        description: 'A test video',
        publishedAt: '2024-01-01T00:00:00Z',
        thumbnails: { default: { url: 'thumbnail.jpg' } },
        duration: 330, // 5 minutes 30 seconds in seconds
        tags: ['test'],
        channelId: 'UC123',
        channelTitle: 'Test Channel',
      });
      expect(result.nextPageToken).toBe('next-token');
    });

    it('should return empty array when no videos found', async () => {
      const mockChannelResponse = {
        data: {
          items: [
            {
              contentDetails: {
                relatedPlaylists: {
                  uploads: 'UU123',
                },
              },
            },
          ],
        },
      };

      const mockPlaylistResponse = {
        data: {
          items: [],
        },
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockChannelResponse)
        .mockResolvedValueOnce(mockPlaylistResponse);

      const result = await service.getChannelVideos('UC123', 10);

      expect(result.videos).toHaveLength(0);
    });

    it('should handle channel not found', async () => {
      const mockChannelResponse = {
        data: { items: [] },
      };

      mockedAxios.get.mockResolvedValueOnce(mockChannelResponse);

      await expect(service.getChannelVideos('invalid', 10)).rejects.toThrow('Channel not found');
    });
  });

  describe('parseDuration', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue('test-api-key');
      service = new YouTubeService(configService);
    });

    it('should parse ISO 8601 duration correctly', () => {
      // Access private method for testing
      const parseDuration = (service as any).parseDuration;

      expect(parseDuration('PT1H30M45S')).toBe(5445); // 1 hour 30 minutes 45 seconds
      expect(parseDuration('PT15M30S')).toBe(930); // 15 minutes 30 seconds  
      expect(parseDuration('PT45S')).toBe(45); // 45 seconds
      expect(parseDuration('PT2H')).toBe(7200); // 2 hours
      expect(parseDuration('PT30M')).toBe(1800); // 30 minutes
    });

    it('should handle invalid duration format', () => {
      const parseDuration = (service as any).parseDuration;
      
      expect(parseDuration('invalid')).toBe(0);
      expect(parseDuration('')).toBe(0);
    });
  });

  describe('extractVideoId', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue('test-api-key');
      service = new YouTubeService(configService);
    });

    it('should extract video ID from various YouTube URL formats', () => {
      expect(service.extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(service.extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(service.extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(service.extractVideoId('dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ'); // Direct ID
    });

    it('should return null for invalid URLs', () => {
      expect(service.extractVideoId('https://example.com')).toBe(null);
      expect(service.extractVideoId('invalid-url')).toBe(null);
      expect(service.extractVideoId('')).toBe(null);
    });
  });

  describe('searchTecnoGamerzChannel', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue('test-api-key');
      service = new YouTubeService(configService);
    });

    it('should find TecnoGamerz channel', async () => {
      const mockSearchResponse = {
        data: {
          items: [
            {
              snippet: {
                channelId: 'UC123',
                title: 'Techno Gamerz',
                channelTitle: 'Techno Gamerz',
              },
            },
          ],
        },
      };

      mockedAxios.get.mockResolvedValue(mockSearchResponse);

      const result = await service.searchTecnoGamerzChannel();

      expect(result).toBe('UC123');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://www.googleapis.com/youtube/v3/search',
        {
          params: {
            key: 'test-api-key',
            q: 'Techno Gamerz',
            type: 'channel',
            part: 'snippet',
            maxResults: 5,
          },
        }
      );
    });

    it('should return null when channel not found', async () => {
      const mockSearchResponse = {
        data: { items: [] },
      };

      mockedAxios.get.mockResolvedValue(mockSearchResponse);

      const result = await service.searchTecnoGamerzChannel();

      expect(result).toBe(null);
    });

    it('should handle search API errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Search API Error'));

      const result = await service.searchTecnoGamerzChannel();

      expect(result).toBe(null);
    });
  });

  describe('getVideoTranscript', () => {
    beforeEach(() => {
      mockConfigService.get.mockReturnValue('test-api-key');
      service = new YouTubeService(configService);
    });

    it('should return null when no captions available', async () => {
      const mockCaptionsResponse = {
        data: { items: [] },
      };

      mockedAxios.get.mockResolvedValue(mockCaptionsResponse);

      const result = await service.getVideoTranscript('video123');

      expect(result).toBe(null);
    });

    it('should return null when API key not available', async () => {
      mockConfigService.get.mockReturnValue(null);
      const serviceWithoutKey = new YouTubeService(configService);

      const result = await serviceWithoutKey.getVideoTranscript('video123');

      expect(result).toBe(null);
    });

    it('should handle transcript fetch errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Transcript API Error'));

      const result = await service.getVideoTranscript('video123');

      expect(result).toBe(null);
    });
  });
});