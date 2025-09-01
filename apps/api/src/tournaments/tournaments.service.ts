import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { GamificationService } from '../common/services/gamification.service';
import { CreateTournamentDto, UpdateTournamentDto, TournamentFiltersDto, CreateMatchResultDto, CreateBulkMatchResultsDto } from './dto/tournament.dto';
import { Tournament, TournamentParticipant, PaginatedResponse, RoleName, MatchResult } from '@tecno-gamerz/types';
import { Prisma } from '@prisma/client';

@Injectable()
export class TournamentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService
  ) {}

  async create(createTournamentDto: CreateTournamentDto, userId: string): Promise<Tournament> {
    const { title, description, game, startDate, endDate } = createTournamentDto;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start <= now) {
      throw new BadRequestException('Tournament start date must be in the future');
    }

    if (end <= start) {
      throw new BadRequestException('Tournament end date must be after start date');
    }

    // Get user to determine if they are admin (for Tecno Gamerz official tournaments)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isTecnoGamerzOfficial = user.role === RoleName.ADMIN;

    const tournament = await this.prisma.tournament.create({
      data: {
        title,
        description,
        game,
        startDate: start,
        endDate: end,
        createdById: userId,
        isTecnoGamerzOfficial,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            image: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return {
      ...tournament,
      participantCount: tournament._count.participants,
    } as Tournament;
  }

  async findAll(filters: TournamentFiltersDto): Promise<PaginatedResponse<Tournament>> {
    const {
      game,
      status,
      isTecnoGamerzOfficial,
      search,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;
    const where: Prisma.TournamentWhereInput = {};

    // Apply filters
    if (game) {
      where.game = {
        contains: game,
        mode: 'insensitive',
      };
    }

    if (isTecnoGamerzOfficial !== undefined) {
      where.isTecnoGamerzOfficial = isTecnoGamerzOfficial;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Status filter based on dates
    if (status) {
      const now = new Date();
      switch (status) {
        case 'UPCOMING':
          where.startDate = { gt: now };
          break;
        case 'ACTIVE':
          where.AND = [
            { startDate: { lte: now } },
            { endDate: { gt: now } },
          ];
          break;
        case 'COMPLETED':
          where.endDate = { lte: now };
          break;
      }
    }

    const [tournaments, total] = await this.prisma.$transaction([
      this.prisma.tournament.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
              role: true,
              image: true,
            },
          },
          _count: {
            select: {
              participants: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.tournament.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tournaments.map(tournament => ({
        ...tournament,
        participantCount: tournament._count.participants,
      })) as Tournament[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string, includeParticipants = false): Promise<Tournament> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            image: true,
          },
        },
        participants: includeParticipants ? {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                image: true,
              },
            },
          },
        } : false,
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return {
      ...tournament,
      participantCount: tournament._count.participants,
    } as Tournament;
  }

  async update(id: string, updateTournamentDto: UpdateTournamentDto, userId: string): Promise<Tournament> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      select: { createdById: true, startDate: true, endDate: true },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    // Only the tournament creator or admin can update the tournament
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (tournament.createdById !== userId && user?.role !== RoleName.ADMIN) {
      throw new ForbiddenException('You can only update tournaments you created');
    }

    // Validate dates if provided
    const updateData: any = { ...updateTournamentDto };

    if (updateTournamentDto.startDate || updateTournamentDto.endDate) {
      const start = updateTournamentDto.startDate ? new Date(updateTournamentDto.startDate) : tournament.startDate;
      const end = updateTournamentDto.endDate ? new Date(updateTournamentDto.endDate) : tournament.endDate;
      const now = new Date();

      if (start <= now) {
        throw new BadRequestException('Tournament start date must be in the future');
      }

      if (end <= start) {
        throw new BadRequestException('Tournament end date must be after start date');
      }

      updateData.startDate = start;
      updateData.endDate = end;
    }

    const updatedTournament = await this.prisma.tournament.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
            role: true,
            image: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return {
      ...updatedTournament,
      participantCount: updatedTournament._count.participants,
    } as Tournament;
  }

  async remove(id: string, userId: string): Promise<void> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    // Only the tournament creator or admin can delete the tournament
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (tournament.createdById !== userId && user?.role !== RoleName.ADMIN) {
      throw new ForbiddenException('You can only delete tournaments you created');
    }

    await this.prisma.tournament.delete({
      where: { id },
    });
  }

  async joinTournament(tournamentId: string, userId: string): Promise<TournamentParticipant> {
    // Check if tournament exists
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { startDate: true, endDate: true },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    // Check if tournament is still upcoming or active
    const now = new Date();
    if (tournament.endDate <= now) {
      throw new BadRequestException('Cannot join a completed tournament');
    }

    // Check if user is already participating
    const existingParticipant = await this.prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId,
        },
      },
    });

    if (existingParticipant) {
      throw new ConflictException('You are already participating in this tournament');
    }

    // Get tournament details for XP award
    const tournamentForXp = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { title: true, isTecnoGamerzOfficial: true },
    });

    // Create participation record and award XP in a transaction
    const participant = await this.prisma.$transaction(async (prisma) => {
      const newParticipant = await prisma.tournamentParticipant.create({
        data: {
          tournamentId,
          userId,
        },
        include: {
          tournament: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  email: true,
                  role: true,
                  image: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });

      // Award XP and badges for joining tournament
      await this.gamificationService.awardJoinTournamentXp(
        userId,
        tournamentId,
        tournamentForXp?.title || 'Tournament',
        tournamentForXp?.isTecnoGamerzOfficial || false
      );

      return newParticipant;
    });

    return participant as TournamentParticipant;
  }

  async leaveTournament(tournamentId: string, userId: string): Promise<void> {
    // Check if participation exists
    const participant = await this.prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('You are not participating in this tournament');
    }

    // Remove participation
    await this.prisma.tournamentParticipant.delete({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId,
        },
      },
    });
  }

  async getUserParticipations(userId: string): Promise<TournamentParticipant[]> {
    const participations = await this.prisma.tournamentParticipant.findMany({
      where: { userId },
      include: {
        tournament: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
                role: true,
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });

    return participations as TournamentParticipant[];
  }

  // Match Results methods
  async createMatchResult(tournamentId: string, createMatchResultDto: CreateMatchResultDto): Promise<MatchResult> {
    const { userId, score } = createMatchResultDto;

    // Verify tournament exists
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { 
        id: true, 
        title: true, 
        isTecnoGamerzOfficial: true,
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, totalPoints: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify user is a participant
    const participant = await this.prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId,
        },
      },
    });

    if (!participant) {
      throw new BadRequestException('User is not a participant of this tournament');
    }

    // Calculate awarded points with multiplier
    const baseMultiplier = 1.0;
    const officialMultiplier = tournament.isTecnoGamerzOfficial ? 1.5 : 1.0;
    const awardedPoints = Math.floor(score * baseMultiplier * officialMultiplier);

    // Use transaction to create match result, update user points, and award XP
    const result = await this.prisma.$transaction(async (prisma) => {
      // Create match result
      const matchResult = await prisma.matchResult.create({
        data: {
          tournamentId,
          userId,
          score,
          awardedPoints,
        },
        include: {
          tournament: {
            select: {
              id: true,
              title: true,
              game: true,
              isTecnoGamerzOfficial: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });

      // Update user's total points
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalPoints: {
            increment: awardedPoints,
          },
        },
      });

      // Award XP for match participation
      await this.gamificationService.awardMatchParticipationXp(
        userId,
        tournamentId,
        tournament.title,
        tournament.isTecnoGamerzOfficial
      );

      return matchResult;
    });

    return result as MatchResult;
  }

  async createBulkMatchResults(tournamentId: string, createBulkMatchResultsDto: CreateBulkMatchResultsDto): Promise<MatchResult[]> {
    const { results } = createBulkMatchResultsDto;

    // Verify tournament exists
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { 
        id: true, 
        title: true, 
        isTecnoGamerzOfficial: true,
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    // Verify all users exist and are participants
    const userIds = results.map(result => result.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, totalPoints: true },
    });

    if (users.length !== userIds.length) {
      throw new BadRequestException('One or more users not found');
    }

    const participants = await this.prisma.tournamentParticipant.findMany({
      where: {
        tournamentId,
        userId: { in: userIds },
      },
    });

    if (participants.length !== userIds.length) {
      throw new BadRequestException('One or more users are not participants of this tournament');
    }

    // Calculate awarded points with multiplier
    const baseMultiplier = 1.0;
    const officialMultiplier = tournament.isTecnoGamerzOfficial ? 1.5 : 1.0;

    const matchResultsData = results.map(result => ({
      tournamentId,
      userId: result.userId,
      score: result.score,
      awardedPoints: Math.floor(result.score * baseMultiplier * officialMultiplier),
    }));

    // Use transaction to create all match results, update user points, and award XP
    const createdResults = await this.prisma.$transaction(async (prisma) => {
      // Create all match results
      const matchResults = await Promise.all(
        matchResultsData.map(data => 
          prisma.matchResult.create({
            data,
            include: {
              tournament: {
                select: {
                  id: true,
                  title: true,
                  game: true,
                  isTecnoGamerzOfficial: true,
                },
              },
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  image: true,
                },
              },
            },
          })
        )
      );

      // Update all user points
      await Promise.all(
        matchResultsData.map(data => 
          prisma.user.update({
            where: { id: data.userId },
            data: {
              totalPoints: {
                increment: data.awardedPoints,
              },
            },
          })
        )
      );

      // Award XP for match participation for all users
      await Promise.all(
        matchResultsData.map(data =>
          this.gamificationService.awardMatchParticipationXp(
            data.userId,
            tournamentId,
            tournament.title,
            tournament.isTecnoGamerzOfficial
          )
        )
      );

      return matchResults;
    });

    return createdResults as MatchResult[];
  }

  async getTournamentResults(tournamentId: string): Promise<MatchResult[]> {
    // Verify tournament exists
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    const results = await this.prisma.matchResult.findMany({
      where: { tournamentId },
      include: {
        tournament: {
          select: {
            id: true,
            title: true,
            game: true,
            isTecnoGamerzOfficial: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        score: 'desc',
      },
    });

    return results as MatchResult[];
  }
}