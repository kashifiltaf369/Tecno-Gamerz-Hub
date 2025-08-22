import { z } from 'zod';
import type { ID, PaginationParams, ApiResponse } from './index';
import type { User, UserWithRoles, Role, Permission } from './auth';

// API Request/Response types

// Health check
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version: string;
  dependencies: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    storage: 'up' | 'down';
  };
}

// Authentication endpoints
export interface AuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
  user: UserWithRoles;
}

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;

// User management endpoints
export interface GetUsersParams extends PaginationParams {
  search?: string;
  role?: Role;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface CreateUserRequest {
  email: string;
  username?: string;
  roles?: Role[];
}

export interface UpdateUserRequest {
  username?: string;
  image?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface AssignRoleRequest {
  userId: ID;
  roles: Role[];
}

// RBAC endpoints
export interface CheckPermissionRequest {
  userId: ID;
  permission: Permission;
  resource?: string;
  resourceId?: ID;
}

export interface CheckPermissionResponse {
  allowed: boolean;
  reason?: string;
}

// Queue management
export interface QueueJobStatus {
  id: string;
  name: string;
  data: unknown;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
  progress: number;
  createdAt: string;
  processedAt?: string;
  completedAt?: string;
  failedReason?: string;
}

export interface CreateJobRequest {
  name: string;
  data: unknown;
  options?: {
    delay?: number;
    priority?: number;
    attempts?: number;
    backoff?: 'exponential' | 'fixed';
  };
}

// Storage endpoints
export interface UploadUrlRequest {
  filename: string;
  contentType: string;
  size: number;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

export interface DeleteFileRequest {
  key: string;
}

// Audit log endpoints
export interface GetAuditLogsParams extends PaginationParams {
  userId?: ID;
  action?: string;
  resource?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuditLogEntry {
  id: ID;
  userId?: ID;
  user?: Pick<User, 'id' | 'email' | 'username'>;
  action: string;
  resource: string;
  resourceId?: ID;
  metadata?: unknown;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Error responses
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  validationErrors?: ValidationError[];
}

// Common API response types
export type UserResponse = ApiResponse<User>;
export type UsersResponse = ApiResponse<User[]>;
export type AuthResponse = ApiResponse<AuthTokenResponse>;
export type PermissionResponse = ApiResponse<CheckPermissionResponse>;
export type HealthResponse = ApiResponse<HealthCheckResponse>;
export type UploadResponse = ApiResponse<UploadUrlResponse>;
export type JobResponse = ApiResponse<QueueJobStatus>;
export type AuditLogsResponse = ApiResponse<AuditLogEntry[]>;

// API client configuration
export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

// Request context (for server-side)
export interface RequestContext {
  user?: UserWithRoles;
  requestId: string;
  ipAddress?: string;
  userAgent?: string;
  startTime: number;
}

// Middleware types
export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface CacheOptions {
  ttl: number;
  key?: string;
  tags?: string[];
}