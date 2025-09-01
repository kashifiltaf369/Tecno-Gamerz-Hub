// Gamification utilities for XP, levels, and badges calculation

import {
  Badge,
  BadgeType,
  BadgeDefinition,
  LevelInfo,
  XpAction,
  XpGainEvent,
  XP_REWARDS,
  XP_MULTIPLIERS,
  LEVEL_SYSTEM,
  BADGE_DEFINITIONS,
} from '@tecno-gamerz-hub/types';

/**
 * Calculate level from total XP
 * Formula: Level = floor(XP / 1000) + 1
 */
export function calculateLevelFromXp(xp: number): number {
  const level = Math.floor(xp / LEVEL_SYSTEM.XP_PER_LEVEL) + 1;
  return Math.min(level, LEVEL_SYSTEM.MAX_LEVEL);
}

/**
 * Calculate XP required for a specific level
 */
export function calculateXpForLevel(level: number): number {
  return (level - 1) * LEVEL_SYSTEM.XP_PER_LEVEL;
}

/**
 * Calculate detailed level information including progress to next level
 */
export function calculateLevelInfo(totalXp: number): LevelInfo {
  const currentLevel = calculateLevelFromXp(totalXp);
  const xpForCurrentLevel = calculateXpForLevel(currentLevel);
  const xpForNextLevel = calculateXpForLevel(currentLevel + 1);
  const currentXp = totalXp - xpForCurrentLevel;
  const xpToNextLevel = xpForNextLevel - totalXp;
  const xpNeededForNextLevel = LEVEL_SYSTEM.XP_PER_LEVEL;
  const progressPercentage = Math.round((currentXp / xpNeededForNextLevel) * 100);

  return {
    currentLevel,
    currentXp,
    xpForCurrentLevel,
    xpForNextLevel,
    xpToNextLevel: Math.max(0, xpToNextLevel),
    progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
  };
}

/**
 * Calculate XP gain for a specific action
 */
export function calculateXpGain(
  action: XpAction,
  isTecnoGamerzOfficial: boolean = false,
  source: string = ''
): XpGainEvent {
  const baseXp = XP_REWARDS[action.toUpperCase() as keyof typeof XP_REWARDS] || 0;
  const multiplier = isTecnoGamerzOfficial 
    ? XP_MULTIPLIERS.TECNO_GAMERZ_OFFICIAL 
    : XP_MULTIPLIERS.REGULAR;
  const finalXp = Math.floor(baseXp * multiplier);

  return {
    action,
    baseXp,
    multiplier,
    finalXp,
    isTecnoGamerzOfficial,
    source,
  };
}

/**
 * Check which badges a user should earn based on their actions
 */
export function checkBadgeEligibility(
  existingBadges: Badge[],
  context: {
    hasJoinedTournament?: boolean;
    hasWonTournament?: boolean;
    hasJoinedOfficialTournament?: boolean;
    isNewUser?: boolean;
  }
): BadgeType[] {
  const earnedBadgeTypes = existingBadges.map(badge => badge.type);
  const newBadges: BadgeType[] = [];

  // Check for Rookie badge
  if (context.isNewUser && !earnedBadgeTypes.includes('rookie')) {
    newBadges.push('rookie');
  }

  // Check for Contender badge
  if (context.hasJoinedTournament && !earnedBadgeTypes.includes('contender')) {
    newBadges.push('contender');
  }

  // Check for Champion badge
  if (context.hasWonTournament && !earnedBadgeTypes.includes('champion')) {
    newBadges.push('champion');
  }

  // Check for Tecno Fan badge
  if (context.hasJoinedOfficialTournament && !earnedBadgeTypes.includes('tecno-fan')) {
    newBadges.push('tecno-fan');
  }

  return newBadges;
}

/**
 * Create a badge from its type
 */
export function createBadge(badgeType: BadgeType): Badge {
  const definition = BADGE_DEFINITIONS[badgeType];
  
  return {
    type: badgeType,
    name: definition.name,
    description: definition.description,
    icon: definition.icon,
    earnedAt: new Date(),
  };
}

/**
 * Parse badges JSON from database
 */
export function parseBadgesFromJson(badgesJson: any): Badge[] {
  try {
    if (Array.isArray(badgesJson)) {
      return badgesJson.map(badge => ({
        ...badge,
        earnedAt: new Date(badge.earnedAt),
      }));
    }
    return [];
  } catch (error) {
    console.warn('Failed to parse badges JSON:', error);
    return [];
  }
}

/**
 * Convert badges to JSON for database storage
 */
export function badgesToJson(badges: Badge[]): any {
  return badges.map(badge => ({
    ...badge,
    earnedAt: badge.earnedAt.toISOString(),
  }));
}

/**
 * Check if user has leveled up after XP gain
 */
export function hasLeveledUp(oldXp: number, newXp: number): boolean {
  const oldLevel = calculateLevelFromXp(oldXp);
  const newLevel = calculateLevelFromXp(newXp);
  return newLevel > oldLevel;
}

/**
 * Get level up rewards (for future expansion)
 */
export function getLevelUpRewards(newLevel: number): {
  xpBonus?: number;
  badges?: BadgeType[];
  title?: string;
} {
  // Future implementation for level-specific rewards
  const rewards: any = {};
  
  // Example milestone rewards
  if (newLevel === 10) {
    rewards.title = 'Rising Star';
  } else if (newLevel === 25) {
    rewards.title = 'Elite Gamer';
  } else if (newLevel === 50) {
    rewards.title = 'Gaming Legend';
  }

  return rewards;
}

/**
 * Format XP number for display
 */
export function formatXp(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  } else if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

/**
 * Get badge rarity/tier (for styling purposes)
 */
export function getBadgeRarity(badgeType: BadgeType): 'common' | 'rare' | 'epic' | 'legendary' {
  const rarityMap: Record<BadgeType, 'common' | 'rare' | 'epic' | 'legendary'> = {
    rookie: 'common',
    contender: 'common',
    champion: 'rare',
    'tecno-fan': 'epic',
  };
  
  return rarityMap[badgeType] || 'common';
}