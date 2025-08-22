import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { logger } from './logger';
import { retry } from './index';
import {
  MAX_CONNECTION_POOL_SIZE,
  CONNECTION_TIMEOUT_MS,
  QUERY_TIMEOUT_MS,
  IS_DEVELOPMENT,
} from './constants';

// Global Prisma instance
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Database configuration
const databaseConfig: Prisma.PrismaClientOptions = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: IS_DEVELOPMENT
    ? [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ]
    : [
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
  errorFormat: 'pretty',
};

// Create Prisma client instance
function createPrismaClient(): PrismaClient {
  const prisma = new PrismaClient(databaseConfig);

  // Add query logging for development
  if (IS_DEVELOPMENT) {
    prisma.$on('query', (e) => {
      logger.debug({
        query: e.query,
        params: e.params,
        duration: e.duration,
      }, `Database query executed in ${e.duration}ms`);
    });
  }

  // Add error logging
  prisma.$on('error', (e) => {
    logger.error({
      target: e.target,
      message: e.message,
    }, 'Database error occurred');
  });

  // Add info and warning logging
  prisma.$on('info', (e) => {
    logger.info({
      target: e.target,
      message: e.message,
    }, 'Database info');
  });

  prisma.$on('warn', (e) => {
    logger.warn({
      target: e.target,
      message: e.message,
    }, 'Database warning');
  });

  return prisma;
}

// Initialize Prisma client with singleton pattern
export const db = globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = db;
}

// Database connection helpers
export async function connectDatabase(): Promise<void> {
  try {
    await retry(
      async () => {
        await db.$connect();
        logger.info('Database connected successfully');
      },
      {
        retries: 3,
        delay: 1000,
        backoff: 'exponential',
      }
    );
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to database');
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await db.$disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error({ err: error }, 'Error disconnecting from database');
  }
}

// Health check
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error({ err: error }, 'Database health check failed');
    return false;
  }
}

// Transaction helper with retry logic
export async function withTransaction<T>(
  callback: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
    retries?: number;
  }
): Promise<T> {
  const { retries = 3, ...transactionOptions } = options || {};

  return retry(
    async () => {
      return db.$transaction(callback, {
        maxWait: transactionOptions.maxWait || CONNECTION_TIMEOUT_MS,
        timeout: transactionOptions.timeout || QUERY_TIMEOUT_MS,
        isolationLevel: transactionOptions.isolationLevel,
      });
    },
    {
      retries,
      delay: 1000,
      backoff: 'exponential',
    }
  );
}

// Query helpers with built-in error handling
export async function safeQuery<T>(
  queryFn: () => Promise<T>,
  errorMessage = 'Database query failed'
): Promise<T | null> {
  try {
    return await queryFn();
  } catch (error) {
    logger.error({ err: error }, errorMessage);
    return null;
  }
}

export async function safeQueryThrow<T>(
  queryFn: () => Promise<T>,
  errorMessage = 'Database query failed'
): Promise<T> {
  try {
    return await queryFn();
  } catch (error) {
    logger.error({ err: error }, errorMessage);
    throw error;
  }
}

// Pagination helper
export function createPaginationArgs(
  page: number,
  limit: number
): { skip: number; take: number } {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

export function createCursorPaginationArgs(
  cursor?: string,
  limit = 20
): { cursor?: { id: string }; take: number; skip?: number } {
  if (cursor) {
    return {
      cursor: { id: cursor },
      take: limit,
      skip: 1, // Skip the cursor
    };
  }
  return { take: limit };
}

// Soft delete helper
export function createSoftDeleteCondition(): { deletedAt: null } {
  return { deletedAt: null };
}

// Search helper
export function createSearchCondition(
  query: string,
  fields: string[]
): Prisma.StringFilter[] {
  const searchTerm = { contains: query, mode: 'insensitive' as const };
  return fields.map(() => searchTerm);
}

// Migration helpers
export async function runMigrations(): Promise<void> {
  try {
    logger.info('Running database migrations...');
    // Note: In production, migrations should be run via CI/CD
    // This is mainly for development convenience
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    await execAsync('npx prisma migrate deploy');
    logger.info('Database migrations completed successfully');
  } catch (error) {
    logger.error({ err: error }, 'Failed to run database migrations');
    throw error;
  }
}

export async function generatePrismaClient(): Promise<void> {
  try {
    logger.info('Generating Prisma client...');
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    await execAsync('npx prisma generate');
    logger.info('Prisma client generated successfully');
  } catch (error) {
    logger.error({ err: error }, 'Failed to generate Prisma client');
    throw error;
  }
}

// Database seeding helper
export async function seedDatabase(): Promise<void> {
  try {
    logger.info('Seeding database...');
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execAsync = promisify(exec);
    
    await execAsync('npx prisma db seed');
    logger.info('Database seeded successfully');
  } catch (error) {
    logger.error({ err: error }, 'Failed to seed database');
    throw error;
  }
}

// Cleanup function for graceful shutdown
export async function cleanupDatabase(): Promise<void> {
  await disconnectDatabase();
}

// Database metrics (for monitoring)
export interface DatabaseMetrics {
  connectionCount: number;
  queryCount: number;
  averageQueryTime: number;
  errorCount: number;
}

// Simple metrics collector (extend as needed)
let queryCount = 0;
let errorCount = 0;
let totalQueryTime = 0;

export function collectDatabaseMetrics(): DatabaseMetrics {
  return {
    connectionCount: 1, // Simplified - would need actual connection pool info
    queryCount,
    averageQueryTime: queryCount > 0 ? totalQueryTime / queryCount : 0,
    errorCount,
  };
}

// Hook into Prisma events to collect metrics
if (IS_DEVELOPMENT) {
  db.$on('query', (e) => {
    queryCount++;
    totalQueryTime += e.duration;
  });

  db.$on('error', () => {
    errorCount++;
  });
}