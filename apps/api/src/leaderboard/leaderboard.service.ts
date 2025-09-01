import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { GamificationService } from '../common/services/gamification.service';
import { GlobalLeaderboardResponse, UserRankStats, LeaderboardFilters, LeaderboardEntry, MatchResult } from '@tecno-gamerz/types';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gamificationService: GamificationService
  ) {}

  async getGlobalLeaderboard(filters: LeaderboardFilters): Promise<GlobalLeaderboardResponse> {
    const { limit = 50, offset = 0 } = filters;
    
    // Ensure limit doesn't exceed 100
    const safeLimit = Math.min(limit, 100);

    // Get top users by total points including XP and level
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        totalPoints: true,
        xp: true,
        level: true,
        matchResults: {
          select: {
            tournament: {
              select: {
                isTecnoGamerzOfficial: true,
              },
            },
          },
        },
      },
      where: {
        totalPoints: {
          gt: 0, // Only include users with points
        },
      },
      orderBy: {
        totalPoints: 'desc',
      },
      skip: offset,
      take: safeLimit,
    });

    // Count total users with points
    const totalUsers = await this.prisma.user.count({
      where: {
        totalPoints: {
          gt: 0,
        },
      },
    });

    // Transform to leaderboard entries with ranks including XP and level
    const entries: LeaderboardEntry[] = users.map((user, index) => ({
      rank: offset + index + 1,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        level: user.level, // Include level in user data
        xp: user.xp, // Include XP in user data
      },
      totalPoints: user.totalPoints,
      hasOfficialTournamentPoints: user.matchResults.some(
        result => result.tournament.isTecnoGamerzOfficial
      ),
    }));

    return {
      entries,
      totalUsers,
      lastUpdated: new Date(),
    };
  }

  async getUserRankStats(userId: string): Promise<UserRankStats> {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        totalPoints: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Count users with higher total points to determine rank
    const usersAhead = await this.prisma.user.count({
      where: {
        totalPoints: {
          gt: user.totalPoints,
        },
      },
    });

    const rank = usersAhead + 1;

    // Count total users with points
    const totalUsers = await this.prisma.user.count({
      where: {
        totalPoints: {
          gt: 0,
        },
      },
    });

    // Calculate percentile (higher is better)
    const percentile = totalUsers > 1 ? Math.round(((totalUsers - rank) / (totalUsers - 1)) * 100) : 100;

    // Get points breakdown from official vs regular tournaments
    const matchResults = await this.prisma.matchResult.findMany({
      where: { userId },
      select: {
        awardedPoints: true,
        tournament: {
          select: {
            isTecnoGamerzOfficial: true,
          },
        },
      },
    });

    const pointsFromOfficialTournaments = matchResults
      .filter(result => result.tournament.isTecnoGamerzOfficial)
      .reduce((sum, result) => sum + result.awardedPoints, 0);

    const pointsFromRegularTournaments = matchResults
      .filter(result => !result.tournament.isTecnoGamerzOfficial)
      .reduce((sum, result) => sum + result.awardedPoints, 0);

    // Get recent match results
    const recentResults = await this.prisma.matchResult.findMany({
      where: { userId },
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
        createdAt: 'desc',
      },
      take: 10,
    });

    return {
      user,
      rank,
      totalUsers,
      percentile,
      pointsFromOfficialTournaments,
      pointsFromRegularTournaments,
      recentResults: recentResults as MatchResult[],
    };
  }
}