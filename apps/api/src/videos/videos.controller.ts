import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { VideosService } from './videos.service';
import { 
  VideoFiltersDto, 
  SyncVideosDto, 
  CreateVideoInteractionDto,
  CreateVideoClipDto,
  VideoResponseDto,
  VideoDetailResponseDto,
} from './dto/video.dto';

@ApiTags('videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of videos' })
  @ApiResponse({ 
    status: 200, 
    description: 'Videos retrieved successfully',
    type: [VideoResponseDto],
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title/description' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  @ApiQuery({ name: 'official', required: false, type: Boolean, description: 'Show only official videos' })
  @ApiQuery({ name: 'sort', required: false, enum: ['newest', 'oldest', 'most_viewed', 'alphabetical'] })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  async getVideos(
    @Query() filters: VideoFiltersDto,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    return this.videosService.getVideos(filters, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get video details by ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Video details retrieved successfully',
    type: VideoDetailResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async getVideoById(
    @Param('id') id: string,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id;
    return this.videosService.getVideoById(id, userId);
  }

  @Get(':id/transcript')
  @ApiOperation({ summary: 'Get video transcript' })
  @ApiResponse({ 
    status: 200, 
    description: 'Video transcript retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async getVideoTranscript(@Param('id') id: string) {
    return this.videosService.getVideoTranscript(id);
  }

  @Post(':id/interaction')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record video interaction (watch, like, etc.)' })
  @ApiResponse({ status: 201, description: 'Interaction recorded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  @HttpCode(HttpStatus.OK)
  async recordInteraction(
    @Param('id') videoId: string,
    @Body() dto: Omit<CreateVideoInteractionDto, 'videoId'>,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.videosService.recordInteraction(userId, { ...dto, videoId });
  }

  @Post('clips')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a video clip' })
  @ApiResponse({ status: 201, description: 'Clip created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Video not found' })
  async createClip(
    @Body() dto: CreateVideoClipDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.videosService.createClip(userId, dto);
  }

  // Admin endpoints
  @Post('admin/sync')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync videos from YouTube channel (Admin only)' })
  @ApiResponse({ status: 200, description: 'Videos synced successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  @ApiResponse({ status: 503, description: 'YouTube API unavailable' })
  async syncChannelVideos(@Body() dto: SyncVideosDto) {
    return this.videosService.syncChannelVideos(dto);
  }
}