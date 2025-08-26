import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto, UpdateTournamentDto, TournamentFiltersDto, CreateMatchResultDto, CreateBulkMatchResultsDto } from './dto/tournament.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Tournament, TournamentParticipant, PaginatedResponse, RoleName, MatchResult } from '@tecno-gamerz/types';

@ApiTags('tournaments')
@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tournament' })
  @ApiResponse({ 
    status: 201, 
    description: 'Tournament created successfully',
    type: Object 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid tournament data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required' 
  })
  async create(
    @Body() createTournamentDto: CreateTournamentDto,
    @Request() req: any,
  ): Promise<Tournament> {
    return this.tournamentsService.create(createTournamentDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tournaments with filtering and pagination' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tournaments retrieved successfully',
    type: Object 
  })
  @ApiQuery({ name: 'game', required: false, description: 'Filter by game name' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by tournament status' })
  @ApiQuery({ name: 'isTecnoGamerzOfficial', required: false, description: 'Filter by official tournaments' })
  @ApiQuery({ name: 'search', required: false, description: 'Search in title and description' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort by field' })
  @ApiQuery({ name: 'sortOrder', required: false, description: 'Sort order (asc/desc)' })
  async findAll(@Query() filters: TournamentFiltersDto): Promise<PaginatedResponse<Tournament>> {
    return this.tournamentsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tournament by ID' })
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiQuery({ 
    name: 'includeParticipants', 
    required: false, 
    description: 'Include participants list' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Tournament retrieved successfully',
    type: Object 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tournament not found' 
  })
  async findOne(
    @Param('id') id: string,
    @Query('includeParticipants') includeParticipants?: string,
  ): Promise<Tournament> {
    const include = includeParticipants === 'true';
    return this.tournamentsService.findOne(id, include);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update tournament (creator or admin only)' })
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Tournament updated successfully',
    type: Object 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid tournament data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - You can only update your own tournaments' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tournament not found' 
  })
  async update(
    @Param('id') id: string,
    @Body() updateTournamentDto: UpdateTournamentDto,
    @Request() req: any,
  ): Promise<Tournament> {
    return this.tournamentsService.update(id, updateTournamentDto, req.user.sub);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete tournament (creator or admin only)' })
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiResponse({ 
    status: 204, 
    description: 'Tournament deleted successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - You can only delete your own tournaments' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tournament not found' 
  })
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    return this.tournamentsService.remove(id, req.user.sub);
  }

  @Post(':id/join')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a tournament' })
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiResponse({ 
    status: 201, 
    description: 'Joined tournament successfully',
    type: Object 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Cannot join tournament' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tournament not found' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - Already participating in tournament' 
  })
  async joinTournament(
    @Param('id') tournamentId: string,
    @Request() req: any,
  ): Promise<TournamentParticipant> {
    return this.tournamentsService.joinTournament(tournamentId, req.user.sub);
  }

  @Delete(':id/leave')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Leave a tournament' })
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiResponse({ 
    status: 204, 
    description: 'Left tournament successfully' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tournament not found or not participating' 
  })
  async leaveTournament(
    @Param('id') tournamentId: string,
    @Request() req: any,
  ): Promise<void> {
    return this.tournamentsService.leaveTournament(tournamentId, req.user.sub);
  }

  @Get('user/participations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user tournament participations' })
  @ApiResponse({ 
    status: 200, 
    description: 'User participations retrieved successfully',
    type: [Object] 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required' 
  })
  async getUserParticipations(@Request() req: any): Promise<TournamentParticipant[]> {
    return this.tournamentsService.getUserParticipations(req.user.sub);
  }

  // Match Results Endpoints
  @Post(':id/results')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create match result for a tournament (Admin only)' })
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiResponse({ 
    status: 201, 
    description: 'Match result created successfully',
    type: Object 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid match result data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin access required' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tournament or user not found' 
  })
  async createMatchResult(
    @Param('id') tournamentId: string,
    @Body() createMatchResultDto: CreateMatchResultDto,
  ): Promise<MatchResult> {
    return this.tournamentsService.createMatchResult(tournamentId, createMatchResultDto);
  }

  @Post(':id/results/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleName.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create multiple match results for a tournament (Admin only)' })
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiResponse({ 
    status: 201, 
    description: 'Match results created successfully',
    type: [Object] 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Invalid match results data' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - JWT token required' 
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin access required' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tournament not found' 
  })
  async createBulkMatchResults(
    @Param('id') tournamentId: string,
    @Body() createBulkMatchResultsDto: CreateBulkMatchResultsDto,
  ): Promise<MatchResult[]> {
    return this.tournamentsService.createBulkMatchResults(tournamentId, createBulkMatchResultsDto);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'Get match results for a tournament' })
  @ApiParam({ name: 'id', description: 'Tournament ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Match results retrieved successfully',
    type: [Object] 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Tournament not found' 
  })
  async getTournamentResults(@Param('id') tournamentId: string): Promise<MatchResult[]> {
    return this.tournamentsService.getTournamentResults(tournamentId);
  }
}