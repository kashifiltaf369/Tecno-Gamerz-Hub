import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { GlobalLeaderboardResponse, UserRankStats, LeaderboardFilters } from '@tecno-gamerz/types';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get global leaderboard' })
  @ApiResponse({ 
    status: 200, 
    description: 'Global leaderboard retrieved successfully',
    type: Object 
  })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of entries to return (max 100)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of entries to skip' })
  async getGlobalLeaderboard(@Query() filters: LeaderboardFilters): Promise<GlobalLeaderboardResponse> {
    return this.leaderboardService.getGlobalLeaderboard(filters);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user rank and stats' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User rank and stats retrieved successfully',
    type: Object 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async getUserRankStats(@Param('userId') userId: string): Promise<UserRankStats> {
    return this.leaderboardService.getUserRankStats(userId);
  }
}