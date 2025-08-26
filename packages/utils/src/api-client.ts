import type { 
  LoginInput, 
  RegisterInput, 
  AuthResponse, 
  RefreshTokenResponse,
  PublicUser,
  ApiResponse 
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