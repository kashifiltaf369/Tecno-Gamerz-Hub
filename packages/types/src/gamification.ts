// Gamification system types for XP, Levels, and Badges

// Badge types
export type BadgeType = 'rookie' | 'contender' | 'champion' | 'tecno-fan';

export interface Badge {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
}

export interface BadgeDefinition {
  type: BadgeType;
  name: string;
  description: string;
  icon: string;
  criteria: string;
}

// Level and XP types
export interface LevelInfo {
  currentLevel: number;
  currentXp: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpToNextLevel: number;
  progressPercentage: number;
}

export interface XpGainEvent {
  action: XpAction;
  baseXp: number;
  multiplier: number;
  finalXp: number;
  isTecnoGamerzOfficial?: boolean;
  source: string; // tournament name, etc.
}

export type XpAction = 'join_tournament' | 'participate_match' | 'win_tournament' | 'create_account';

// XP calculation constants
export const XP_REWARDS = {
  CREATE_ACCOUNT: 0, // Badge only
  JOIN_TOURNAMENT: 50,
  PARTICIPATE_MATCH: 100,
  WIN_TOURNAMENT: 500,
} as const;

export const XP_MULTIPLIERS = {
  REGULAR: 1.0,
  TECNO_GAMERZ_OFFICIAL: 1.25, // +25% bonus for official tournaments
} as const;

export const LEVEL_SYSTEM = {
  XP_PER_LEVEL: 1000, // Level up every 1000 XP
  MAX_LEVEL: 100, // Future-proof with max level
} as const;

// Badge definitions
export const BADGE_DEFINITIONS: Record<BadgeType, BadgeDefinition> = {
  rookie: {
    type: 'rookie',
    name: 'Rookie',
    description: 'Welcome to Tecno Gamerz Hub! Your gaming journey begins here.',
    icon: '🎮',
    criteria: 'Create an account',
  },
  contender: {
    type: 'contender',
    name: 'Contender',
    description: 'Ready to compete! You\'ve joined your first tournament.',
    icon: '⚔️',
    criteria: 'Join your first tournament',
  },
  champion: {
    type: 'champion',
    name: 'Champion',
    description: 'Victory is yours! You\'ve won your first tournament.',
    icon: '🏆',
    criteria: 'Win your first tournament',
  },
  'tecno-fan': {
    type: 'tecno-fan',
    name: 'Tecno Fan',
    description: 'A true supporter! You\'ve participated in an official Tecno Gamerz tournament.',
    icon: '👑',
    criteria: 'Join an official Tecno Gamerz tournament',
  },
} as const;

// Helper types for API responses
export interface UserGameProfile {
  userId: string;
  xp: number;
  level: number;
  badges: Badge[];
  levelInfo: LevelInfo;
  recentXpGains?: XpGainEvent[];
}

export interface ProfileStats {
  totalTournaments: number;
  tournamentsWon: number;
  totalMatches: number;
  winRate: number;
  favoriteGame?: string;
}