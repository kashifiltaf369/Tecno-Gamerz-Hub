import { z } from 'zod';
import type { ID, Timestamp } from './index';

// Role definitions
export enum Role {
  ADMIN = 'ADMIN',
  GAMER = 'GAMER',
  FAN = 'FAN',
}

// Permission keys
export const PERMISSIONS = {
  // Global
  ALL: '*',
  
  // User management
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  
  // Tournament permissions
  TOURNAMENT_CREATE: 'tournament:create',
  TOURNAMENT_JOIN: 'tournament:join',
  TOURNAMENT_MANAGE: 'tournament:manage',
  
  // Video permissions
  VIDEO_UPLOAD: 'video:upload',
  VIDEO_MANAGE: 'video:manage',
  
  // Commerce permissions
  SHOP_MANAGE_SELF: 'shop:manage:self',
  SHOP_MANAGE_ALL: 'shop:manage:all',
  ORDER_CREATE: 'order:create',
  ORDER_MANAGE: 'order:manage',
  
  // Community permissions
  COMMENT_CREATE: 'comment:create',
  COMMENT_MODERATE: 'comment:moderate',
  
  // Donation permissions
  DONATE_CREATE: 'donate:create',
  DONATE_MANAGE: 'donate:manage',
  
  // Giveaway permissions
  GIVEAWAY_CREATE: 'giveaway:create',
  GIVEAWAY_MANAGE: 'giveaway:manage',
  
  // Admin permissions
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_USERS: 'admin:users',
  ADMIN_ANALYTICS: 'admin:analytics',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

// User types
export interface User {
  id: ID;
  name: string;
  email: string;
  passwordHash?: string; // Only include in internal operations
  role: Role;
  username?: string;
  image?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Public user type (without sensitive fields)
export interface PublicUser {
  id: ID;
  name: string;
  email: string;
  role: Role;
  username?: string;
  image?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserWithRoles extends User {
  roles: Role[];
  permissions: Permission[];
}

// OAuth Provider types
export enum OAuthProvider {
  GOOGLE = 'google',
  TWITCH = 'twitch',
  YOUTUBE = 'youtube',
}

export interface OAuthAccount {
  id: ID;
  userId: ID;
  provider: OAuthProvider;
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Timestamp;
  tokenType?: string;
  scope?: string;
  idToken?: string;
}

// Auth session types
export interface AuthSession {
  user: UserWithRoles;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Timestamp;
}

// JWT payload
export interface JWTPayload {
  sub: ID; // user id
  email: string;
  username?: string;
  roles: Role[];
  permissions: Permission[];
  iat: number;
  exp: number;
  aud: string;
  iss: string;
}

// Auth response types
export interface AuthResponse {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresAt: number;
}

// Validation schemas
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  image: z.string().url().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;