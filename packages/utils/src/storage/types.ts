// Storage driver interface
export interface StorageDriver {
  /**
   * Upload a file to storage
   * @param key - The storage key/path for the file
   * @param data - File data as Buffer or ReadableStream
   * @param options - Upload options
   * @returns Upload result with public URL
   */
  put(
    key: string,
    data: Buffer | NodeJS.ReadableStream,
    options: UploadOptions
  ): Promise<UploadResult>;

  /**
   * Get a signed URL for accessing a private file
   * @param key - The storage key/path for the file
   * @param options - Signed URL options
   * @returns Signed URL with expiration
   */
  getSignedUrl(key: string, options?: SignedUrlOptions): Promise<string>;

  /**
   * Delete a file from storage
   * @param key - The storage key/path for the file
   */
  delete(key: string): Promise<void>;

  /**
   * Check if a file exists
   * @param key - The storage key/path for the file
   */
  exists(key: string): Promise<boolean>;

  /**
   * Get file metadata
   * @param key - The storage key/path for the file
   */
  getMetadata(key: string): Promise<FileMetadata>;

  /**
   * Copy a file within storage
   * @param sourceKey - Source file key
   * @param destinationKey - Destination file key
   */
  copy(sourceKey: string, destinationKey: string): Promise<void>;

  /**
   * List files with a prefix
   * @param prefix - Key prefix to filter by
   * @param options - List options
   */
  list(prefix: string, options?: ListOptions): Promise<FileInfo[]>;
}

// Upload options
export interface UploadOptions {
  contentType: string;
  contentLength?: number;
  cacheControl?: string;
  metadata?: Record<string, string>;
  acl?: 'private' | 'public-read' | 'public-read-write';
  expires?: Date;
}

// Upload result
export interface UploadResult {
  key: string;
  url: string;
  etag?: string;
  versionId?: string;
  size?: number;
}

// Signed URL options
export interface SignedUrlOptions {
  expiresIn?: number; // seconds
  operation?: 'getObject' | 'putObject' | 'deleteObject';
  responseHeaders?: Record<string, string>;
}

// File metadata
export interface FileMetadata {
  key: string;
  size: number;
  contentType: string;
  lastModified: Date;
  etag: string;
  metadata?: Record<string, string>;
}

// File info for listing
export interface FileInfo {
  key: string;
  size: number;
  lastModified: Date;
  etag: string;
  storageClass?: string;
}

// List options
export interface ListOptions {
  maxKeys?: number;
  marker?: string;
  delimiter?: string;
}

// Storage configuration
export interface StorageConfig {
  provider: 's3' | 'r2' | 'supabase';
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string;
  forcePathStyle?: boolean;
  publicUrl?: string;
  cdnUrl?: string;
}

// Provider-specific configurations
export interface S3Config extends StorageConfig {
  provider: 's3';
  region: string;
}

export interface R2Config extends StorageConfig {
  provider: 'r2';
  accountId: string;
  endpoint: string;
}

export interface SupabaseConfig extends StorageConfig {
  provider: 'supabase';
  projectUrl: string;
  anonKey: string;
}

// Error types
export class StorageError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class FileNotFoundError extends StorageError {
  constructor(key: string) {
    super(`File not found: ${key}`, 'FILE_NOT_FOUND', 404, { key });
    this.name = 'FileNotFoundError';
  }
}

export class UploadError extends StorageError {
  constructor(message: string, details?: unknown) {
    super(message, 'UPLOAD_ERROR', 500, details);
    this.name = 'UploadError';
  }
}

export class ConfigurationError extends StorageError {
  constructor(message: string) {
    super(message, 'CONFIGURATION_ERROR', 500);
    this.name = 'ConfigurationError';
  }
}

// Utility types
export type StorageProvider = StorageConfig['provider'];

export interface PresignedPostData {
  url: string;
  fields: Record<string, string>;
}

export interface MultipartUploadOptions {
  partSize?: number;
  queueSize?: number;
  tags?: Record<string, string>;
}

// File validation
export interface FileValidationRule {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

// Storage stats
export interface StorageStats {
  totalFiles: number;
  totalSize: number;
  byContentType: Record<string, { count: number; size: number }>;
  byFolder: Record<string, { count: number; size: number }>;
}