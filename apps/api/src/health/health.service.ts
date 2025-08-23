import { Injectable } from '@nestjs/common';
import { HealthIndicatorResult, HealthIndicator } from '@nestjs/terminus';
import { db, checkDatabaseHealth } from '@tecno-gamerz/utils/db';
import { getDefaultStorageDriver } from '@tecno-gamerz/utils/storage';
import type { HealthCheckResponse } from '@tecno-gamerz/types';
import Redis from 'ioredis';

@Injectable()
export class HealthService extends HealthIndicator {
  private redis: Redis;

  constructor() {
    super();
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
    });
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isHealthy = true; // Basic liveness check
    const result = this.getStatus(key, isHealthy, { uptime: process.uptime() });

    if (isHealthy) {
      return result;
    }
    throw new Error('Service is not healthy');
  }

  async checkDatabase(): Promise<HealthIndicatorResult> {
    try {
      const isHealthy = await checkDatabaseHealth();
      const result = this.getStatus('database', isHealthy);

      if (isHealthy) {
        return result;
      }
      throw new Error('Database is not healthy');
    } catch (error) {
      throw new Error(`Database health check failed: ${error.message}`);
    }
  }

  async checkRedis(): Promise<HealthIndicatorResult> {
    try {
      await this.redis.ping();
      return this.getStatus('redis', true);
    } catch (error) {
      throw new Error(`Redis health check failed: ${error.message}`);
    }
  }

  async checkStorage(): Promise<HealthIndicatorResult> {
    try {
      // Try to get storage driver - if it fails, storage is not configured
      const storage = getDefaultStorageDriver();
      // TODO: Add actual storage health check when needed
      return this.getStatus('storage', true, { configured: true });
    } catch (error) {
      // Storage not configured is not a critical error for basic operation
      return this.getStatus('storage', true, { configured: false, reason: error.message });
    }
  }

  async getDetailedHealth(): Promise<HealthCheckResponse> {
    const timestamp = new Date().toISOString();
    const version = process.env.npm_package_version || '1.0.0';

    const dependencies = {
      database: 'down' as const,
      redis: 'down' as const,
      storage: 'down' as const,
    };

    // Check database
    try {
      const dbHealthy = await checkDatabaseHealth();
      dependencies.database = dbHealthy ? 'up' : 'down';
    } catch {
      dependencies.database = 'down';
    }

    // Check Redis
    try {
      await this.redis.ping();
      dependencies.redis = 'up';
    } catch {
      dependencies.redis = 'down';
    }

    // Check storage
    try {
      getDefaultStorageDriver();
      dependencies.storage = 'up';
    } catch {
      dependencies.storage = 'down';
    }

    const allUp = Object.values(dependencies).every(status => status === 'up');

    return {
      status: allUp ? 'ok' : 'error',
      timestamp,
      version,
      dependencies,
    };
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}