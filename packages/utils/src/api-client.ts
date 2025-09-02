import type { 
  LoginInput, 
  RegisterInput, 
  AuthResponse, 
  RefreshTokenResponse,
  PublicUser,
  ApiResponse,
  Tournament,
  TournamentParticipant,
  CreateTournamentDto,
  UpdateTournamentDto,
  TournamentFilters,
  PaginatedResponse,
  MatchResult,
  CreateMatchResultDto,
  CreateBulkMatchResultsDto,
  GlobalLeaderboardResponse,
  UserRankStats,
  LeaderboardFilters,
  UserContent,
  CreateUserContentInput
} from '@tecno-gamerz/types';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private accessToken?: string;

  constructor(config: ApiClientConfig) {
    this.baseURL = config.baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout || 30000;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  clearAccessToken() {
    this.accessToken = undefined;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(credentials: LoginInput): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterInput): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async me(): Promise<ApiResponse<PublicUser>> {
    return this.request<PublicUser>('/auth/me');
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> {
    return this.request<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async logout(): Promise<ApiResponse<void>> {
    return this.request<void>('/auth/logout', {
      method: 'POST',
    });
  }

  // Tournament endpoints
  async getTournaments(filters?: TournamentFilters): Promise<ApiResponse<PaginatedResponse<Tournament>>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/tournaments?${queryString}` : '/tournaments';
    
    return this.request<PaginatedResponse<Tournament>>(endpoint);
  }

  async getTournament(id: string, includeParticipants = false): Promise<ApiResponse<Tournament>> {
    const endpoint = `/tournaments/${id}${includeParticipants ? '?includeParticipants=true' : ''}`;
    return this.request<Tournament>(endpoint);
  }

  async createTournament(tournamentData: CreateTournamentDto): Promise<ApiResponse<Tournament>> {
    return this.request<Tournament>('/tournaments', {
      method: 'POST',
      body: JSON.stringify(tournamentData),
    });
  }

  async updateTournament(id: string, tournamentData: UpdateTournamentDto): Promise<ApiResponse<Tournament>> {
    return this.request<Tournament>(`/tournaments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(tournamentData),
    });
  }

  async deleteTournament(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/tournaments/${id}`, {
      method: 'DELETE',
    });
  }

  async joinTournament(id: string): Promise<ApiResponse<TournamentParticipant>> {
    return this.request<TournamentParticipant>(`/tournaments/${id}/join`, {
      method: 'POST',
    });
  }

  async leaveTournament(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/tournaments/${id}/leave`, {
      method: 'DELETE',
    });
  }

  async getUserTournamentParticipations(): Promise<ApiResponse<TournamentParticipant[]>> {
    return this.request<TournamentParticipant[]>('/tournaments/user/participations');
  }

  async updateTournamentStream(id: string, streamUrl: string): Promise<ApiResponse<Tournament>> {
    return this.request<Tournament>(`/tournaments/${id}/stream`, {
      method: 'PATCH',
      body: JSON.stringify({ streamUrl }),
    });
  }

  // Match results endpoints
  async createMatchResult(matchResultData: CreateMatchResultDto): Promise<ApiResponse<MatchResult>> {
    return this.request<MatchResult>(`/tournaments/${matchResultData.tournamentId}/results`, {
      method: 'POST',
      body: JSON.stringify({
        userId: matchResultData.userId,
        score: matchResultData.score,
      }),
    });
  }

  async createBulkMatchResults(bulkData: CreateBulkMatchResultsDto): Promise<ApiResponse<MatchResult[]>> {
    return this.request<MatchResult[]>(`/tournaments/${bulkData.tournamentId}/results/bulk`, {
      method: 'POST',
      body: JSON.stringify({
        results: bulkData.results,
      }),
    });
  }

  async getTournamentResults(tournamentId: string): Promise<ApiResponse<MatchResult[]>> {
    return this.request<MatchResult[]>(`/tournaments/${tournamentId}/results`);
  }

  // Leaderboard endpoints
  async getGlobalLeaderboard(filters?: LeaderboardFilters): Promise<ApiResponse<GlobalLeaderboardResponse>> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/leaderboard?${queryString}` : '/leaderboard';
    
    return this.request<GlobalLeaderboardResponse>(endpoint);
  }

  async getUserRankStats(userId: string): Promise<ApiResponse<UserRankStats>> {
    return this.request<UserRankStats>(`/leaderboard/${userId}`);
  }

  // Content endpoints
  async getContent(): Promise<ApiResponse<UserContent[]>> {
    return this.request<UserContent[]>('/content');
  }

  async createContent(contentData: CreateUserContentInput): Promise<ApiResponse<UserContent>> {
    return this.request<UserContent>('/content', {
      method: 'POST',
      body: JSON.stringify(contentData),
    });
  }

  async deleteContent(id: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/content/${id}`, {
      method: 'DELETE',
    });
  }
}

// Default API client instance
export const createApiClient = (config: ApiClientConfig) => {
  return new ApiClient(config);
};

// Browser-specific client with default configuration
export const createBrowserApiClient = () => {
  const baseURL = typeof window !== 'undefined' 
    ? window.location.origin.replace(':3000', ':3001') // Development fallback
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  return new ApiClient({
    baseURL: `${baseURL}/api/v1`,
    timeout: 30000,
  });
};