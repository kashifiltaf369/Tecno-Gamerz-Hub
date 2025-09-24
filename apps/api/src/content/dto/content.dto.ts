import { 
  IsString, 
  MinLength, 
  MaxLength, 
  IsUrl,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateUserContentDto {
  @ApiProperty({ 
    example: 'Epic Headshot Compilation', 
    description: 'Title of the content' 
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({ 
    example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
    description: 'Video URL (YouTube, Twitch, etc.)' 
  })
  @IsUrl({}, { message: 'Please provide a valid video URL' })
  videoUrl: string;
}

export class ContentFiltersDto {
  @ApiPropertyOptional({ 
    example: 'epic', 
    description: 'Search in content titles' 
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ 
    example: 1, 
    description: 'Page number for pagination' 
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiPropertyOptional({ 
    example: 12, 
    description: 'Number of items per page' 
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiPropertyOptional({ 
    example: 'createdAt', 
    description: 'Sort by field' 
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ 
    example: 'desc', 
    description: 'Sort order' 
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';
}