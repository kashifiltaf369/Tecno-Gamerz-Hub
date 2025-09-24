import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import {
  Badge,
  BadgeType,
  XpAction,
  XpGainEvent,
  LevelInfo,
  UserGameProfile,
} from '@tecno-gamerz/types';
import {
  calculateLevelFromXp,
  calculateLevelInfo,
  calculateXpGain,
  checkBadgeEligibility,
  createBadge,
  parseBadgesFromJson,
  badgesToJson,
  hasLeveledUp,
} from '@tecno-gamerz/utils';

@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Award XP to a user for a specific action
   */
  async awardXp(
    userId: string,
    action: XpAction,
    isTecnoGamerzOfficial: boolean = false,
    source: string = '',
    additionalContext?: {
      tournamentId?: string;
      isWin?: boolean;
    }
  ): Promise<XpGainEvent> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, badges: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const xpGain = calculateXpGain(action, isTecnoGamerzOfficial, source);
    const newXp = user.xp + xpGain.finalXp;
    const newLevel = calculateLevelFromXp(newXp);
    const leveledUp = hasLeveledUp(user.xp, newXp);

    // Check for new badges
    const existingBadges = parseBadgesFromJson(user.badges);
    const badgeContext = this.createBadgeContext(action, isTecnoGamerzOfficial, additionalContext);
    const newBadgeTypes = checkBadgeEligibility(existingBadges, badgeContext);
    const newBadges = newBadgeTypes.map(createBadge);
    const updatedBadges = [...existingBadges, ...newBadges];

    // Update user with new XP, level, and badges
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXp,
        level: newLevel,
        badges: badgesToJson(updatedBadges),
      },
    });

    // Log the XP gain event (for future analytics)
    if (leveledUp) {
      console.log(`User ${userId} leveled up to ${newLevel}!`);
    }

    if (newBadges.length > 0) {
      console.log(`User ${userId} earned new badges:`, newBadgeTypes);
    }

    return xpGain;
  }

  /**
   * Get user's complete game profile
   */
  async getUserGameProfile(userId: string): Promise<UserGameProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        xp: true,
        level: true,
        badges: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const badges = parseBadgesFromJson(user.badges);
    const levelInfo = calculateLevelInfo(user.xp);

    return {
      userId: user.id,
      xp: user.xp,
      level: user.level,
      badges,
      levelInfo,
    };
  }

  /**
   * Award initial badges for new users
   */
  async awardInitialBadges(userId: string): Promise<void> {
    await this.awardXp(userId, 'create_account', false, 'Account Creation', {});
  }

  /**
   * Award XP and badges for joining a tournament
   */
  async awardJoinTournamentXp(
    userId: string,
    tournamentId: string,
    tournamentTitle: string,
    isTecnoGamerzOfficial: boolean
  ): Promise<XpGainEvent> {
    return this.awardXp(
      userId,
      'join_tournament',
      isTecnoGamerzOfficial,
      tournamentTitle,
      { tournamentId }
    );
  }

  /**
   * Award XP for participating in a match
   */
  async awardMatchParticipationXp(
    userId: string,
    tournamentId: string,
    tournamentTitle: string,
    isTecnoGamerzOfficial: boolean
  ): Promise<XpGainEvent> {
    return this.awardXp(
      userId,
      'participate_match',
      isTecnoGamerzOfficial,
      tournamentTitle,
      { tournamentId }
    );
  }

  /**
   * Award XP for winning a tournament
   */
  async awardTournamentWinXp(
    userId: string,
    tournamentId: string,
    tournamentTitle: string,
    isTecnoGamerzOfficial: boolean
  ): Promise<XpGainEvent> {
    return this.awardXp(
      userId,
      'win_tournament',
      isTecnoGamerzOfficial,
      tournamentTitle,
      { tournamentId, isWin: true }
    );
  }

  /**
   * Get leaderboard with XP and level information
   */
  async getXpLeaderboard(limit: number = 50): Promise<Array<{
    userId: string;
    name: string;
    username: string | null;
    image: string | null;
    xp: number;
    level: number;
    totalPoints: number;
  }>> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        xp: true,
        level: true,
        totalPoints: true,
      },
      orderBy: [
        { xp: 'desc' },
        { totalPoints: 'desc' },
        { createdAt: 'asc' },
      ],
      take: limit,
    });

    return users.map(user => ({
      userId: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      xp: user.xp,
      level: user.level,
      totalPoints: user.totalPoints,
    }));
  }

  /**
   * Helper to create badge context based on action
   */
  private createBadgeContext(
    action: XpAction,
    isTecnoGamerzOfficial: boolean,
    additionalContext?: {
      tournamentId?: string;
      isWin?: boolean;
    }
  ): {
    hasJoinedTournament?: boolean;
    hasWonTournament?: boolean;
    hasJoinedOfficialTournament?: boolean;
    isNewUser?: boolean;
  } {
    const context: any = {};

    switch (action) {
      case 'create_account':
        context.isNewUser = true;
        break;
      case 'join_tournament':
        context.hasJoinedTournament = true;
        if (isTecnoGamerzOfficial) {
          context.hasJoinedOfficialTournament = true;
        }
        break;
      case 'participate_match':
        // Match participation doesn't award badges directly
        break;
      case 'win_tournament':
        context.hasWonTournament = true;
        if (isTecnoGamerzOfficial) {
          context.hasJoinedOfficialTournament = true;
        }
        break;
    }

    return context;
  }
}