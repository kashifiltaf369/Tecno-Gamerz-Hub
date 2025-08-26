import { Test, TestingModule } from '@nestjs/testing';
import { TournamentsService } from './tournaments.service';
import { PrismaService } from '../common/services/prisma.service';
import { NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { RoleName } from '@tecno-gamerz/types';

describe('TournamentsService', () => {
  let service: TournamentsService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockUser = {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
    role: RoleName.GAMER,
  };

  const mockAdminUser = {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: RoleName.ADMIN,
  };

  const mockTournament = {
    id: 'tournament1',
    title: 'Test Tournament',
    description: 'Test tournament description',
    game: 'Test Game',
    startDate: new Date('2024-12-01T10:00:00Z'),
    endDate: new Date('2024-12-01T18:00:00Z'),
    createdById: 'user1',
    isTecnoGamerzOfficial: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: mockUser,
    _count: { participants: 0 },
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
      },
      tournament: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      tournamentParticipant: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TournamentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TournamentsService>(TournamentsService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTournamentDto = {
      title: 'Test Tournament',
      description: 'Test tournament description',
      game: 'Test Game',
      startDate: '2024-12-01T10:00:00Z',
      endDate: '2024-12-01T18:00:00Z',
    };

    it('should create a tournament successfully', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.tournament.create.mockResolvedValue(mockTournament);

      const result = await service.create(createTournamentDto, 'user1');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user1' },
      });
      expect(prismaService.tournament.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Tournament',
          description: 'Test tournament description',
          game: 'Test Game',
          startDate: new Date('2024-12-01T10:00:00Z'),
          endDate: new Date('2024-12-01T18:00:00Z'),
          createdById: 'user1',
          isTecnoGamerzOfficial: false,
        },
        include: expect.any(Object),
      });
      expect(result).toEqual({
        ...mockTournament,
        participantCount: 0,
      });
    });

    it('should set isTecnoGamerzOfficial to true for admin users', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockAdminUser);
      const adminTournament = { ...mockTournament, isTecnoGamerzOfficial: true };
      prismaService.tournament.create.mockResolvedValue(adminTournament);

      const result = await service.create(createTournamentDto, 'admin1');

      expect(prismaService.tournament.create).toHaveBeenCalledWith({
        data: {
          title: 'Test Tournament',
          description: 'Test tournament description',
          game: 'Test Game',
          startDate: new Date('2024-12-01T10:00:00Z'),
          endDate: new Date('2024-12-01T18:00:00Z'),
          createdById: 'admin1',
          isTecnoGamerzOfficial: true,
        },
        include: expect.any(Object),
      });
    });

    it('should throw BadRequestException if start date is in the past', async () => {
      const pastDateDto = {
        ...createTournamentDto,
        startDate: '2020-01-01T10:00:00Z',
      };

      await expect(service.create(pastDateDto, 'user1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if end date is before start date', async () => {
      const invalidDateDto = {
        ...createTournamentDto,
        startDate: '2024-12-01T18:00:00Z',
        endDate: '2024-12-01T10:00:00Z',
      };

      await expect(service.create(invalidDateDto, 'user1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createTournamentDto, 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a tournament by id', async () => {
      prismaService.tournament.findUnique.mockResolvedValue(mockTournament);

      const result = await service.findOne('tournament1');

      expect(prismaService.tournament.findUnique).toHaveBeenCalledWith({
        where: { id: 'tournament1' },
        include: expect.any(Object),
      });
      expect(result).toEqual({
        ...mockTournament,
        participantCount: 0,
      });
    });

    it('should throw NotFoundException if tournament not found', async () => {
      prismaService.tournament.findUnique.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated tournaments', async () => {
      const tournaments = [mockTournament];
      const total = 1;

      prismaService.$transaction.mockResolvedValue([tournaments, total]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: [{ ...mockTournament, participantCount: 0 }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });
  });

  describe('joinTournament', () => {
    const mockParticipant = {
      id: 'participant1',
      tournamentId: 'tournament1',
      userId: 'user1',
      joinedAt: new Date(),
      tournament: mockTournament,
      user: mockUser,
    };

    it('should allow user to join tournament', async () => {
      prismaService.tournament.findUnique.mockResolvedValue({
        startDate: new Date('2024-12-01T10:00:00Z'),
        endDate: new Date('2024-12-01T18:00:00Z'),
      });
      prismaService.tournamentParticipant.findUnique.mockResolvedValue(null);
      prismaService.tournamentParticipant.create.mockResolvedValue(mockParticipant);

      const result = await service.joinTournament('tournament1', 'user1');

      expect(prismaService.tournamentParticipant.create).toHaveBeenCalledWith({
        data: {
          tournamentId: 'tournament1',
          userId: 'user1',
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockParticipant);
    });

    it('should throw NotFoundException if tournament not found', async () => {
      prismaService.tournament.findUnique.mockResolvedValue(null);

      await expect(service.joinTournament('nonexistent', 'user1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for completed tournaments', async () => {
      prismaService.tournament.findUnique.mockResolvedValue({
        startDate: new Date('2020-01-01T10:00:00Z'),
        endDate: new Date('2020-01-01T18:00:00Z'),
      });

      await expect(service.joinTournament('tournament1', 'user1')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ConflictException if user already participating', async () => {
      prismaService.tournament.findUnique.mockResolvedValue({
        startDate: new Date('2024-12-01T10:00:00Z'),
        endDate: new Date('2024-12-01T18:00:00Z'),
      });
      prismaService.tournamentParticipant.findUnique.mockResolvedValue(mockParticipant);

      await expect(service.joinTournament('tournament1', 'user1')).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Updated Tournament',
    };

    it('should update tournament if user is creator', async () => {
      const tournamentData = {
        createdById: 'user1',
        startDate: new Date('2024-12-01T10:00:00Z'),
        endDate: new Date('2024-12-01T18:00:00Z'),
      };
      const updatedTournament = { ...mockTournament, title: 'Updated Tournament' };

      prismaService.tournament.findUnique.mockResolvedValue(tournamentData);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.tournament.update.mockResolvedValue(updatedTournament);

      const result = await service.update('tournament1', updateDto, 'user1');

      expect(result).toEqual({
        ...updatedTournament,
        participantCount: 0,
      });
    });

    it('should throw ForbiddenException if user is not creator or admin', async () => {
      const tournamentData = {
        createdById: 'other-user',
        startDate: new Date('2024-12-01T10:00:00Z'),
        endDate: new Date('2024-12-01T18:00:00Z'),
      };

      prismaService.tournament.findUnique.mockResolvedValue(tournamentData);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.update('tournament1', updateDto, 'user1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('remove', () => {
    it('should delete tournament if user is creator', async () => {
      const tournamentData = { createdById: 'user1' };

      prismaService.tournament.findUnique.mockResolvedValue(tournamentData);
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.tournament.delete.mockResolvedValue(undefined);

      await service.remove('tournament1', 'user1');

      expect(prismaService.tournament.delete).toHaveBeenCalledWith({
        where: { id: 'tournament1' },
      });
    });

    it('should throw ForbiddenException if user is not creator or admin', async () => {
      const tournamentData = { createdById: 'other-user' };

      prismaService.tournament.findUnique.mockResolvedValue(tournamentData);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.remove('tournament1', 'user1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});