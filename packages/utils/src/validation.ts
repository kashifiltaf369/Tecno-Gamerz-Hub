import { z } from 'zod';
import {
  PASSWORD_MIN_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from './constants';

// Common validation schemas
export const IdSchema = z.string().min(1, 'ID is required');

export const EmailSchema = z
  .string()
  .email('Invalid email address')
  .min(1, 'Email is required')
  .max(320, 'Email is too long');

export const PasswordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .regex(/^(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
  .regex(/^(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
  .regex(/^(?=.*\d)/, 'Password must contain at least one number')
  .regex(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?])/, 'Password must contain at least one special character');

export const UsernameSchema = z
  .string()
  .min(USERNAME_MIN_LENGTH, `Username must be at least ${USERNAME_MIN_LENGTH} characters`)
  .max(USERNAME_MAX_LENGTH, `Username must be no more than ${USERNAME_MAX_LENGTH} characters`)
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .regex(/^[a-zA-Z]/, 'Username must start with a letter');

export const UrlSchema = z
  .string()
  .url('Invalid URL format')
  .min(1, 'URL is required');

export const DateSchema = z
  .string()
  .datetime('Invalid date format')
  .or(z.date());

// Pagination schemas
export const PaginationSchema = z.object({
  page: z
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .default(1),
  limit: z
    .number()
    .int('Limit must be an integer')
    .min(1, 'Limit must be at least 1')
    .max(MAX_PAGE_SIZE, `Limit cannot exceed ${MAX_PAGE_SIZE}`)
    .default(DEFAULT_PAGE_SIZE),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export const PaginationQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1))
    .optional()
    .default('1')
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val)),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(MAX_PAGE_SIZE))
    .optional()
    .default(DEFAULT_PAGE_SIZE.toString())
    .transform((val) => (typeof val === 'string' ? parseInt(val, 10) : val)),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});

// File validation schemas
export const FileSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  contentType: z.string().min(1, 'Content type is required'),
  size: z.number().int().min(1, 'File size must be greater than 0'),
});

export const ImageFileSchema = FileSchema.extend({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
});

export const VideoFileSchema = FileSchema.extend({
  contentType: z.enum(['video/mp4', 'video/webm', 'video/ogg']),
});

// Search schemas
export const SearchSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query is too long'),
  filters: z.record(z.string()).optional(),
});

// Environment variable schemas
export const DatabaseConfigSchema = z.object({
  DATABASE_URL: z.string().url('Invalid database URL'),
  DATABASE_POOL_SIZE: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(50))
    .optional()
    .default('10'),
});

export const RedisConfigSchema = z.object({
  REDIS_URL: z.string().url('Invalid Redis URL'),
  REDIS_KEY_PREFIX: z.string().optional().default('tgh:'),
});

export const JWTConfigSchema = z.object({
  JWT_PRIVATE_KEY: z.string().min(1, 'JWT private key is required'),
  JWT_PUBLIC_KEY: z.string().min(1, 'JWT public key is required'),
});

export const StorageConfigSchema = z.object({
  STORAGE_PROVIDER: z.enum(['s3', 'r2', 'supabase']).default('s3'),
  STORAGE_BUCKET: z.string().min(1, 'Storage bucket is required'),
  STORAGE_REGION: z.string().min(1, 'Storage region is required'),
  STORAGE_ACCESS_KEY: z.string().min(1, 'Storage access key is required'),
  STORAGE_SECRET_KEY: z.string().min(1, 'Storage secret key is required'),
  STORAGE_ENDPOINT: z.string().url().optional(),
});

// API request validation
export const ApiKeySchema = z
  .string()
  .regex(/^tgh_[a-zA-Z0-9]{32}$/, 'Invalid API key format');

export const BearerTokenSchema = z
  .string()
  .regex(/^Bearer\s+[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+$/, 'Invalid Bearer token format');

// Validation helpers
export const validateEmail = (email: string): boolean => {
  return EmailSchema.safeParse(email).success;
};

export const validatePassword = (password: string): boolean => {
  return PasswordSchema.safeParse(password).success;
};

export const validateUsername = (username: string): boolean => {
  return UsernameSchema.safeParse(username).success;
};

export const validateUrl = (url: string): boolean => {
  return UrlSchema.safeParse(url).success;
};

// Sanitization helpers
export const sanitizeString = (str: string): string => {
  return str.trim().replace(/[<>]/g, '');
};

export const sanitizeSearchQuery = (query: string): string => {
  return query.trim().replace(/[<>&'"]/g, '').substring(0, 100);
};

// Custom validation utilities
export const createEnumValidator = <T extends Record<string, string | number>>(enumObject: T) => {
  const values = Object.values(enumObject) as Array<T[keyof T]>;
  return z.enum(values as [T[keyof T], ...T[keyof T][]]);
};

export const createOptionalNumberValidator = (min?: number, max?: number) => {
  let schema = z.number().int();
  if (min !== undefined) schema = schema.min(min);
  if (max !== undefined) schema = schema.max(max);
  return schema.optional();
};

export const createRequiredStringValidator = (minLength = 1, maxLength = 255) => {
  return z.string().min(minLength).max(maxLength);
};

// Validation error formatter
export const formatValidationErrors = (error: z.ZodError) => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }));
};

// Safe parsing with detailed error info
export const safeParseWithDetails = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    return {
      success: false,
      error: formatValidationErrors(result.error),
      data: null,
    };
  }
  
  return {
    success: true,
    error: null,
    data: result.data,
  };
};