import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ContentService } from './content.service';
import { CreateUserContentDto, ContentFiltersDto } from './dto/content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserContent, PaginatedResponse } from '@tecno-gamerz/types';

@ApiTags('content')
@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Share user content (highlights/clips)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Content shared successfully',
    type: Object 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid content data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required' 
  })
  async create(
    @Body() createContentDto: CreateUserContentDto,
    @Request() req: any,
  ): Promise<UserContent> {
    return this.contentService.createContent(createContentDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user content with filtering and pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Content retrieved successfully',
    type: Object 
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search in content titles' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)' })
  async findAll(@Query() filters: ContentFiltersDto): Promise<PaginatedResponse<UserContent>> {
    return this.contentService.findAll(filters);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get content by specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'User content retrieved successfully',
    type: [Object] 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async findUserContent(@Param('userId') userId: string): Promise<UserContent[]> {
    return this.contentService.findUserContent(userId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user content' })
  @ApiResponse({ 
    status: 200, 
    description: 'User content retrieved successfully',
    type: [Object] 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required' 
  })
  async findMyContent(@Request() req: any): Promise<UserContent[]> {
    return this.contentService.findUserContent(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get content by ID' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Content retrieved successfully',
    type: Object 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Content not found' 
  })
  async findOne(@Param('id') id: string): Promise<UserContent> {
    return this.contentService.findOne(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete content (owner or admin only)' })
  @ApiParam({ name: 'id', description: 'Content ID' })
  @ApiResponse({ 
    status: 204, 
    description: 'Content deleted successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - You can only delete your own content' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Content not found' 
  })
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    return this.contentService.deleteContent(id, req.user.sub);
  }
}