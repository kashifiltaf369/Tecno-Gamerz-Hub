// Tournament related types
import { ID, Timestamp } from './index';
import { User } from './auth';

export enum TournamentStatus {
  UPCOMING = 'UPCOMING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Core tournament interface
export interface Tournament {
  id: ID;
  title: string;
  description: string;
  game: string;
  streamUrl?: string | null; // Twitch/YouTube stream URL
  startDate: Timestamp;
  endDate: Timestamp;
  createdById: ID;
  isTecnoGamerzOfficial: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Relations
  createdBy?: User;
  participants?: TournamentParticipant[];
  participantCount?: number;
}

// Tournament participant interface
export interface TournamentParticipant {
  id: ID;
  tournamentId: ID;
  userId: ID;
  joinedAt: Timestamp;
  
  // Relations
  tournament?: Tournament;
  user?: User;
}

// Tournament creation payload
export interface CreateTournamentDto {
  title: string;
  description: string;
  game: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
}

// Tournament update payload
export interface UpdateTournamentDto {
  title?: string;
  description?: string;
  game?: string;
  startDate?: string; // ISO string
  endDate?: string; // ISO string
}

// Tournament query filters
export interface TournamentFilters {
  game?: string;
  status?: TournamentStatus;
  isTecnoGamerzOfficial?: boolean;
  createdById?: ID;
  search?: string; // Search in title/description
}

// Tournament participation response
export interface TournamentParticipationResponse {
  tournament: Tournament;
  participant: TournamentParticipant;
  message: string;
}

// Tournament statistics
export interface TournamentStats {
  totalTournaments: number;
  activeTournaments: number;
  completedTournaments: number;
  totalParticipants: number;
  popularGames: Array<{
    game: string;
    count: number;
  }>;
}

// Tournament with detailed participant info
export interface TournamentWithParticipants extends Tournament {
  participants: Array<TournamentParticipant & {
    user: Pick<User, 'id' | 'name' | 'username' | 'image'>;
  }>;
}