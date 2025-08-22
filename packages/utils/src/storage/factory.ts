import type { StorageDriver, StorageConfig } from './types';
import { S3StorageDriver } from './s3-driver';
import { ConfigurationError } from './types';
import { logger } from '../logger';

/**
 * Factory function to create storage driver instances
 * @param config Storage configuration
 * @returns StorageDriver instance
 */
export function createStorageDriver(config: StorageConfig): StorageDriver {
  logger.info({
    provider: config.provider,
    bucket: config.bucket,
  }, 'Creating storage driver');

  switch (config.provider) {
    case 's3':
    case 'r2':
      // Both S3 and R2 (Cloudflare) use the S3-compatible API
      return new S3StorageDriver(config);
    
    case 'supabase':
      // TODO: Implement Supabase storage driver
      throw new ConfigurationError('Supabase storage provider not yet implemented');
    
    default:
      throw new ConfigurationError(`Unsupported storage provider: ${(config as any).provider}`);
  }
}

/**
 * Create storage driver from environment variables
 * @returns StorageDriver instance
 */
export function createStorageDriverFromEnv(): StorageDriver {
  const provider = process.env.STORAGE_PROVIDER as StorageConfig['provider'];
  
  if (!provider) {
    throw new ConfigurationError('STORAGE_PROVIDER environment variable is required');
  }

  const config: StorageConfig = {
    provider,
    bucket: process.env.STORAGE_BUCKET!,
    region: process.env.STORAGE_REGION!,
    accessKeyId: process.env.STORAGE_ACCESS_KEY!,
    secretAccessKey: process.env.STORAGE_SECRET_KEY!,
    endpoint: process.env.STORAGE_ENDPOINT,
    forcePathStyle: process.env.STORAGE_FORCE_PATH_STYLE === 'true',
    publicUrl: process.env.STORAGE_PUBLIC_URL,
    cdnUrl: process.env.STORAGE_CDN_URL,
  };

  return createStorageDriver(config);
}

/**
 * Storage driver registry for dependency injection
 */
class StorageDriverRegistry {
  private drivers = new Map<string, StorageDriver>();
  
  register(name: string, driver: StorageDriver): void {
    this.drivers.set(name, driver);
    logger.debug({ name }, 'Storage driver registered');
  }
  
  get(name: string): StorageDriver {
    const driver = this.drivers.get(name);
    if (!driver) {
      throw new ConfigurationError(`Storage driver '${name}' not found in registry`);
    }
    return driver;
  }
  
  has(name: string): boolean {
    return this.drivers.has(name);
  }
  
  remove(name: string): boolean {
    return this.drivers.delete(name);
  }
  
  clear(): void {
    this.drivers.clear();
  }
  
  list(): string[] {
    return Array.from(this.drivers.keys());
  }
}

export const storageRegistry = new StorageDriverRegistry();

// Default driver setup
let defaultDriver: StorageDriver | null = null;

export function setDefaultStorageDriver(driver: StorageDriver): void {
  defaultDriver = driver;
  logger.info('Default storage driver set');
}

export function getDefaultStorageDriver(): StorageDriver {
  if (!defaultDriver) {
    // Try to create from environment variables
    try {
      defaultDriver = createStorageDriverFromEnv();
      logger.info('Default storage driver created from environment');
    } catch (error) {
      throw new ConfigurationError('No default storage driver configured and failed to create from environment');
    }
  }
  
  return defaultDriver;
}

// Utility functions for common storage operations
export interface StorageHelpers {
  /**
   * Generate a unique file key with timestamp and random suffix
   */
  generateFileKey(prefix: string, filename: string): string;
  
  /**
   * Extract file extension from filename
   */
  getFileExtension(filename: string): string;
  
  /**
   * Generate thumbnail key from original key
   */
  generateThumbnailKey(originalKey: string, size: string): string;
  
  /**
   * Validate file type against allowed types
   */
  validateFileType(contentType: string, allowedTypes: string[]): boolean;
  
  /**
   * Get MIME type from file extension
   */
  getMimeTypeFromExtension(extension: string): string;
}

export const storageHelpers: StorageHelpers = {
  generateFileKey(prefix: string, filename: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const extension = this.getFileExtension(filename);
    const baseName = filename.replace(/\.[^/.]+$/, ''); // Remove extension
    const safeName = baseName.replace(/[^a-zA-Z0-9_-]/g, '_'); // Sanitize
    
    return `${prefix}/${timestamp}_${randomSuffix}_${safeName}${extension}`;
  },
  
  getFileExtension(filename: string): string {
    const lastDotIndex = filename.lastIndexOf('.');
    return lastDotIndex !== -1 ? filename.substring(lastDotIndex) : '';
  },
  
  generateThumbnailKey(originalKey: string, size: string): string {
    const extension = this.getFileExtension(originalKey);
    const basePath = originalKey.replace(extension, '');
    return `${basePath}_thumb_${size}${extension}`;
  },
  
  validateFileType(contentType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(contentType);
  },
  
  getMimeTypeFromExtension(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.ogg': 'video/ogg',
      '.pdf': 'application/pdf',
      '.txt': 'text/plain',
      '.json': 'application/json',
      '.zip': 'application/zip',
    };
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
  },
};

// Export commonly used configurations
export const DEFAULT_UPLOAD_OPTIONS = {
  acl: 'public-read' as const,
  cacheControl: 'public, max-age=31536000', // 1 year
};

export const PRIVATE_UPLOAD_OPTIONS = {
  acl: 'private' as const,
  cacheControl: 'private, no-cache',
};

export const IMAGE_UPLOAD_OPTIONS = {
  ...DEFAULT_UPLOAD_OPTIONS,
  metadata: {
    type: 'image',
  },
};

export const VIDEO_UPLOAD_OPTIONS = {
  ...DEFAULT_UPLOAD_OPTIONS,
  metadata: {
    type: 'video',
  },
};