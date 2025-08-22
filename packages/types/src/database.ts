import type { ID, Timestamp, JSONValue } from './index';
import type { Role, Permission, OAuthProvider } from './auth';

// Database model interfaces matching Prisma schema

export interface DbUser {
  id: ID;
  email: string;
  username?: string;
  image?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DbAccount {
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DbRole {
  id: ID;
  name: Role;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DbUserRole {
  id: ID;
  userId: ID;
  roleId: ID;
  assignedAt: Timestamp;
  assignedBy?: ID;
}

export interface DbPermission {
  id: ID;
  key: Permission;
  description?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DbRolePermission {
  id: ID;
  roleId: ID;
  permissionId: ID;
  createdAt: Timestamp;
}

export interface DbSession {
  id: ID;
  sessionToken: string;
  userId: ID;
  expires: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DbAuditLog {
  id: ID;
  userId?: ID;
  action: string;
  resource: string;
  resourceId?: ID;
  metadata?: JSONValue;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Timestamp;
}

// Relations
export interface DbUserWithRelations extends DbUser {
  accounts: DbAccount[];
  userRoles: (DbUserRole & {
    role: DbRole & {
      rolePermissions: (DbRolePermission & {
        permission: DbPermission;
      })[];
    };
  })[];
  sessions: DbSession[];
  auditLogs: DbAuditLog[];
}

export interface DbRoleWithPermissions extends DbRole {
  rolePermissions: (DbRolePermission & {
    permission: DbPermission;
  })[];
  userRoles: DbUserRole[];
}

// Query options
export interface FindUserOptions {
  includeAccounts?: boolean;
  includeRoles?: boolean;
  includePermissions?: boolean;
  includeSessions?: boolean;
}

export interface CreateUserOptions {
  email: string;
  username?: string;
  image?: string;
  roles?: Role[];
}

export interface UpdateUserOptions {
  username?: string;
  image?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

// Audit log helpers
export const AUDIT_ACTIONS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  ROLE_ASSIGNED: 'role.assigned',
  ROLE_REMOVED: 'role.removed',
  PERMISSION_GRANTED: 'permission.granted',
  PERMISSION_REVOKED: 'permission.revoked',
} as const;

export type AuditAction = typeof AUDIT_ACTIONS[keyof typeof AUDIT_ACTIONS];