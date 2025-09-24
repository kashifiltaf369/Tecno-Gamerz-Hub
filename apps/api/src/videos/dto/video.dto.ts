import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsEnum, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVideoInteractionDto {
  @ApiProperty({ description: 'Video ID' })
  @IsString()
  videoId: string;

  @ApiProperty({ 
    description: 'Interaction type',
    enum: ['WATCH', 'LIKE', 'COMMENT', 'CLIP', 'COMPLETE', 'QUIZ_ATTEMPT']
  })
  @IsEnum(['WATCH', 'LIKE', 'COMMENT', 'CLIP', 'COMPLETE', 'QUIZ_ATTEMPT'])
  action: string;

  @ApiPropertyOptional({ description: 'Watch progress percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({ description: 'Additional metadata as JSON' })
  @IsOptional()
  metadata?: any;
}

export class CreateVideoClipDto {
  @ApiProperty({ description: 'Video ID to clip from' })
  @IsString()
  videoId: string;

  @ApiProperty({ description: 'Clip title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Clip description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Start time in seconds' })
  @IsNumber()
  @Min(0)
  startTime: number;

  @ApiProperty({ description: 'End time in seconds' })
  @IsNumber()
  @Min(0)
  endTime: number;

  @ApiPropertyOptional({ description: 'Make clip public', default: true })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean = true;
}

export class CreateVideoQuizDto {
  @ApiProperty({ description: 'Video ID to attach quiz to' })
  @IsString()
  videoId: string;

  @ApiProperty({ description: 'Quiz title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Quiz description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Quiz questions with options and correct answers' })
  questions: any[];

  @ApiPropertyOptional({ description: 'XP reward for completing quiz', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  xpReward?: number = 50;

  @ApiPropertyOptional({ description: 'Coins reward for completing quiz', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  coinsReward?: number = 10;
}

export class SubmitQuizAnswersDto {
  @ApiProperty({ description: 'Quiz ID' })
  @IsString()
  quizId: string;

  @ApiProperty({ description: 'User answers array' })
  @IsArray()
  answers: any[];
}

export class VideoFiltersDto {
  @ApiPropertyOptional({ description: 'Search query for title/description' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by tag' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'Show only official TecnoGamerz videos' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  official?: boolean;

  @ApiPropertyOptional({ 
    description: 'Sort order',
    enum: ['newest', 'oldest', 'most_viewed', 'alphabetical']
  })
  @IsOptional()
  @IsEnum(['newest', 'oldest', 'most_viewed', 'alphabetical'])
  sort?: string = 'newest';

  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class SyncVideosDto {
  @ApiProperty({ description: 'YouTube channel ID to sync from' })
  @IsString()
  channelId: string;

  @ApiPropertyOptional({ description: 'Maximum number of videos to sync', default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  maxResults?: number = 50;

  @ApiPropertyOptional({ description: 'Force refresh existing videos', default: false })
  @IsOptional()
  @IsBoolean()
  forceRefresh?: boolean = false;
}

export class VideoResponseDto {
  id: string;
  title: string;
  description?: string;
  youtubeId: string;
  duration?: number;
  publishedAt?: Date;
  thumbnails?: any;
  tags: string[];
  transcript?: string;
  views: number;
  channel: {
    id: string;
    name: string;
    externalId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class VideoDetailResponseDto extends VideoResponseDto {
  videoInteractions?: any[];
  videoQuizzes?: any[];
  videoClips?: any[];
  relatedVideos?: VideoResponseDto[];
  userProgress?: {
    watchProgress: number;
    hasLiked: boolean;
    hasCompleted: boolean;
    quizzesCompleted: number;
  };
}