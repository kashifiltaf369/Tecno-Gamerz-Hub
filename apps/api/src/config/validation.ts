import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(4000),
  
  // Database
  DATABASE_URL: Joi.string().required(),
  DATABASE_POOL_SIZE: Joi.number().default(10),

  // JWT
  JWT_PRIVATE_KEY: Joi.string().required(),
  JWT_PUBLIC_KEY: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().optional(),
  REDIS_DB: Joi.number().default(0),
  REDIS_KEY_PREFIX: Joi.string().default('tgh:'),

  // CORS
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),

  // Storage
  STORAGE_PROVIDER: Joi.string().valid('s3', 'r2', 'supabase').default('s3'),
  STORAGE_BUCKET: Joi.string().optional(),
  STORAGE_REGION: Joi.string().optional(),
  STORAGE_ACCESS_KEY: Joi.string().optional(),
  STORAGE_SECRET_KEY: Joi.string().optional(),
  STORAGE_ENDPOINT: Joi.string().optional(),
  STORAGE_PUBLIC_URL: Joi.string().optional(),
  STORAGE_CDN_URL: Joi.string().optional(),

  // Features
  QUEUE_PROCESSING_ENABLED: Joi.string().valid('true', 'false').default('true'),
  FILE_UPLOADS_ENABLED: Joi.string().valid('true', 'false').default('true'),
  AUDIT_LOGGING_ENABLED: Joi.string().valid('true', 'false').default('true'),

  // Security
  BCRYPT_ROUNDS: Joi.number().default(12),

  // File uploads
  MAX_FILE_SIZE: Joi.number().default(52428800), // 50MB

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('debug'),
});