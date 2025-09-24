// Leaderboard and scoring system types
import { ID, Timestamp } from './index';
import { User } from './auth';
import { Tournament } from './tournaments';

// Match result interface
export interface MatchResult {
  id: ID;
  tournamentId: ID;
  userId: ID;
  score: number;
  awardedPoints: number; // Final points awarded (with multiplier applied)
  createdAt: Timestamp;
  
  // Relations
  tournament?: Tournament;
  user?: User;
}

// Create match result payload
export interface CreateMatchResultDto {
  tournamentId: ID;
  userId: ID;
  score: number;
}

// Leaderboard entry interface
export interface LeaderboardEntry {
  rank: number;
  user: Pick<User, 'id' | 'name' | 'username' | 'image'> & {
    level?: number;
    xp?: number;
  };
  totalPoints: number;
  hasOfficialTournamentPoints: boolean; // Indicates if user has points from Tecno Gamerz Official tournaments
}

// Global leaderboard response
export interface GlobalLeaderboardResponse {
  entries: LeaderboardEntry[];
  totalUsers: number;
  lastUpdated: Timestamp;
}

// User rank and stats
export interface UserRankStats {
  user: Pick<User, 'id' | 'name' | 'username' | 'image' | 'totalPoints'>;
  rank: number;
  totalUsers: number;
  percentile: number; // User's percentile in the leaderboard (0-100)
  pointsFromOfficialTournaments: number;
  pointsFromRegularTournaments: number;
  recentResults: MatchResult[];
}

// Leaderboard filters
export interface LeaderboardFilters {
  limit?: number;
  offset?: number;
}

// Scoring configuration
export interface ScoringConfig {
  baseMultiplier: number; // Base points multiplier (1.0)
  officialTournamentMultiplier: number; // Multiplier for Tecno Gamerz Official tournaments (1.5)
}

// Match result with detailed tournament info
export interface MatchResultWithTournament extends MatchResult {
  tournament: Pick<Tournament, 'id' | 'title' | 'game' | 'isTecnoGamerzOfficial'>;
}

// Bulk match results creation payload
export interface CreateBulkMatchResultsDto {
  tournamentId: ID;
  results: Array<{
    userId: ID;
    score: number;
  }>;
}