import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateTournamentDto, UpdateTournamentDto, TournamentFiltersDto } from './dto/tournament.dto';
import { Tournament, TournamentParticipant, PaginatedResponse, RoleName } from '@tecno-gamerz/types';
import { Prisma } from '@prisma/client';

@Injectable()
export class TournamentsService {
  constructor(private readonly prisma: PrismaService) {}

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

    // Create participation record
    const participant = await this.prisma.tournamentParticipant.create({
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
}