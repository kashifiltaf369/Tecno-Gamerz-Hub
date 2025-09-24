import { 
  IsString, 
  IsDateString, 
  MinLength, 
  MaxLength, 
  IsOptional, 
  IsBoolean,
  IsEnum,
  IsUUID,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { TournamentStatus } from '@tecno-gamerz/types/tournaments';

export class CreateTournamentDto {
  @ApiProperty({ 
    example: 'Tecno Gamerz Championship 2024', 
    description: 'Tournament title' 
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({ 
    example: 'Join us for the ultimate gaming competition with exciting prizes!', 
    description: 'Tournament description' 
  })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description: string;

  @ApiProperty({ 
    example: 'Call of Duty: Warzone', 
    description: 'Game name' 
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  game: string;

  @ApiProperty({ 
    example: '2024-12-01T10:00:00Z', 
    description: 'Tournament start date and time (ISO 8601)' 
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({ 
    example: '2024-12-01T18:00:00Z', 
    description: 'Tournament end date and time (ISO 8601)' 
  })
  @IsDateString()
  endDate: string;
}

export class UpdateTournamentDto {
  @ApiPropertyOptional({ 
    example: 'Updated Tournament Title', 
    description: 'Tournament title' 
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ 
    example: 'Updated tournament description', 
    description: 'Tournament description' 
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ 
    example: 'Fortnite', 
    description: 'Game name' 
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  game?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-01T10:00:00Z', 
    description: 'Tournament start date and time (ISO 8601)' 
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ 
    example: '2024-12-01T18:00:00Z', 
    description: 'Tournament end date and time (ISO 8601)' 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class TournamentFiltersDto {
  @ApiPropertyOptional({ 
    example: 'Call of Duty', 
    description: 'Filter by game name' 
  })
  @IsOptional()
  @IsString()
  game?: string;

  @ApiPropertyOptional({ 
    enum: TournamentStatus,
    description: 'Filter by tournament status' 
  })
  @IsOptional()
  @IsEnum(TournamentStatus)
  status?: TournamentStatus;

  @ApiPropertyOptional({ 
    example: true, 
    description: 'Filter by Tecno Gamerz official tournaments' 
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isTecnoGamerzOfficial?: boolean;

  @ApiPropertyOptional({ 
    example: 'championship', 
    description: 'Search in title and description' 
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
    example: 10, 
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

export class JoinTournamentDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000', 
    description: 'Tournament ID to join' 
  })
  @IsUUID()
  tournamentId: string;
}

export class CreateMatchResultDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174001', 
    description: 'User ID who achieved this score' 
  })
  @IsUUID()
  userId: string;

  @ApiProperty({ 
    example: 2500, 
    description: 'User score in the tournament' 
  })
  @IsNumber()
  @Min(0)
  score: number;
}

export class BulkMatchResultDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174001', 
    description: 'User ID who achieved this score' 
  })
  @IsUUID()
  userId: string;

  @ApiProperty({ 
    example: 2500, 
    description: 'User score in the tournament' 
  })
  @IsNumber()
  @Min(0)
  score: number;
}

export class CreateBulkMatchResultsDto {
  @ApiProperty({ 
    type: [BulkMatchResultDto],
    description: 'Array of match results to create' 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkMatchResultDto)
  results: BulkMatchResultDto[];
}

export class UpdateStreamDto {
  @ApiProperty({ 
    example: 'https://www.twitch.tv/tecnogamerz', 
    description: 'Twitch or YouTube stream URL' 
  })
  @IsString()
  @IsOptional()
  streamUrl?: string | null;
}