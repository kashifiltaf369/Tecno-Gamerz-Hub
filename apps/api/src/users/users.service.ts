import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@tecno-gamerz/utils/db';
import { GamificationService } from '../common/services/gamification.service';
import { UserGameProfile, ProfileStats } from '@tecno-gamerz/types';

@Injectable()
export class UsersService {
  constructor(private readonly gamificationService: GamificationService) {}
  async findOne(id: string) {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      ...user,
      roles: user.userRoles.map(ur => ur.role.name),
    };
  }

  async findAll() {
    const users = await db.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      take: 50, // Limit for safety
    });

    return users.map(user => ({
      ...user,
      roles: user.userRoles.map(ur => ur.role.name),
    }));
  }

  async getUserProfile(userId: string): Promise<{
    user: any;
    gameProfile: UserGameProfile;
    stats: ProfileStats;
  }> {
    const user = await this.findOne(userId);
    const gameProfile = await this.gamificationService.getUserGameProfile(userId);

    // Calculate user statistics
    const [
      totalTournaments,
      tournamentsWon,
      totalMatches,
      favoriteGameResult
    ] = await Promise.all([
      // Total tournaments joined
      db.tournamentParticipant.count({
        where: { userId },
      }),
      
      // Tournaments won (assuming highest scorer wins - this is a simplified approach)
      db.matchResult.count({
        where: {
          userId,
          // This is a simplified win condition - in a real app you'd have proper win tracking
        },
      }),
      
      // Total matches played
      db.matchResult.count({
        where: { userId },
      }),
      
      // Most played game
      db.matchResult.groupBy({
        by: ['tournamentId'],
        where: { userId },
        _count: {
          tournamentId: true,
        },
        orderBy: {
          _count: {
            tournamentId: 'desc',
          },
        },
        take: 1,
      }),
    ]);

    const stats: ProfileStats = {
      totalTournaments,
      tournamentsWon, // Simplified - should be based on actual tournament results
      totalMatches,
      winRate: totalMatches > 0 ? Math.round((tournamentsWon / totalMatches) * 100) : 0,
      favoriteGame: undefined, // Would need to join with tournament data for game info
    };

    return {
      user,
      gameProfile,
      stats,
    };
  }
}