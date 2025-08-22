// Environment constants
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const IS_DEVELOPMENT = NODE_ENV === 'development';
export const IS_TEST = NODE_ENV === 'test';

// Application constants
export const APP_NAME = 'Tecno Gamerz Hub';
export const APP_VERSION = process.env.npm_package_version || '0.1.0';

// JWT constants
export const JWT_ALGORITHM = 'RS256' as const;
export const JWT_ISSUER = 'tecno-gamerz-hub';
export const JWT_AUDIENCE = 'tecno-gamerz-api';
export const JWT_ACCESS_TOKEN_EXPIRES_IN = '15m';
export const JWT_REFRESH_TOKEN_EXPIRES_IN = '7d';

// Rate limiting constants
export const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
export const DEFAULT_RATE_LIMIT_MAX_REQUESTS = 100;
export const AUTH_RATE_LIMIT_MAX_REQUESTS = 5; // For login attempts
export const API_RATE_LIMIT_MAX_REQUESTS = 1000; // For API endpoints

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  VERY_LONG: 3600, // 1 hour
  USER_SESSION: 86400, // 24 hours
  USER_PERMISSIONS: 3600, // 1 hour
} as const;

// Database constants
export const MAX_CONNECTION_POOL_SIZE = 10;
export const CONNECTION_TIMEOUT_MS = 10000;
export const QUERY_TIMEOUT_MS = 30000;

// File upload constants
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
] as const;
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
] as const;

// Pagination constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Queue constants
export const QUEUE_NAMES = {
  MAIL: 'mail',
  AUDIT: 'audit',
  NOTIFICATIONS: 'notifications',
  FILE_PROCESSING: 'file-processing',
} as const;

// Queue job priorities
export const JOB_PRIORITY = {
  LOW: 1,
  NORMAL: 5,
  HIGH: 10,
  CRITICAL: 20,
} as const;

// Request timeout constants
export const REQUEST_TIMEOUT = {
  DEFAULT: 30000, // 30 seconds
  UPLOAD: 300000, // 5 minutes
  LONG_RUNNING: 600000, // 10 minutes
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// CORS constants
export const CORS_MAX_AGE = 86400; // 24 hours

// Security constants
export const BCRYPT_ROUNDS = 12;
export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;

// Audit log constants
export const AUDIT_LOG_RETENTION_DAYS = 90;

// Feature flags
export const FEATURES = {
  OAUTH_GOOGLE: process.env.OAUTH_GOOGLE_ENABLED === 'true',
  OAUTH_TWITCH: process.env.OAUTH_TWITCH_ENABLED === 'true',
  OAUTH_YOUTUBE: process.env.OAUTH_YOUTUBE_ENABLED === 'true',
  QUEUE_PROCESSING: process.env.QUEUE_PROCESSING_ENABLED !== 'false',
  FILE_UPLOADS: process.env.FILE_UPLOADS_ENABLED !== 'false',
  AUDIT_LOGGING: process.env.AUDIT_LOGGING_ENABLED !== 'false',
} as const;