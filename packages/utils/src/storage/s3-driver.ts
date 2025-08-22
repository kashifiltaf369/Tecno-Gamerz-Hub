import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type {
  StorageDriver,
  StorageConfig,
  UploadOptions,
  UploadResult,
  SignedUrlOptions,
  FileMetadata,
  FileInfo,
  ListOptions,
} from './types';
import {
  StorageError,
  FileNotFoundError,
  UploadError,
  ConfigurationError,
} from './types';
import { logger } from '../logger';

export class S3StorageDriver implements StorageDriver {
  private client: S3Client;
  private bucket: string;
  private publicUrl?: string;
  private cdnUrl?: string;

  constructor(config: StorageConfig) {
    this.validateConfig(config);
    
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl;
    this.cdnUrl = config.cdnUrl;

    // Initialize S3 client
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: config.endpoint,
      forcePathStyle: config.forcePathStyle ?? false,
    });

    logger.info({
      provider: config.provider,
      bucket: config.bucket,
      region: config.region,
      endpoint: config.endpoint,
    }, 'S3 storage driver initialized');
  }

  private validateConfig(config: StorageConfig): void {
    if (!config.bucket) {
      throw new ConfigurationError('Storage bucket is required');
    }
    if (!config.region) {
      throw new ConfigurationError('Storage region is required');
    }
    if (!config.accessKeyId) {
      throw new ConfigurationError('Storage access key ID is required');
    }
    if (!config.secretAccessKey) {
      throw new ConfigurationError('Storage secret access key is required');
    }
  }

  async put(
    key: string,
    data: Buffer | NodeJS.ReadableStream,
    options: UploadOptions
  ): Promise<UploadResult> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: options.contentType,
        ContentLength: options.contentLength,
        CacheControl: options.cacheControl,
        Metadata: options.metadata,
        ACL: options.acl,
        Expires: options.expires,
      });

      const result = await this.client.send(command);
      
      const url = this.getPublicUrl(key);
      
      logger.debug({
        key,
        contentType: options.contentType,
        size: options.contentLength,
        etag: result.ETag,
      }, 'File uploaded successfully');

      return {
        key,
        url,
        etag: result.ETag,
        versionId: result.VersionId,
        size: options.contentLength,
      };
    } catch (error) {
      logger.error({ err: error, key }, 'Failed to upload file');
      throw new UploadError(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`, error);
    }
  }

  async getSignedUrl(key: string, options: SignedUrlOptions = {}): Promise<string> {
    try {
      const { expiresIn = 3600, operation = 'getObject' } = options;
      
      let command;
      switch (operation) {
        case 'getObject':
          command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ResponseCacheControl: options.responseHeaders?.['cache-control'],
            ResponseContentDisposition: options.responseHeaders?.['content-disposition'],
            ResponseContentType: options.responseHeaders?.['content-type'],
          });
          break;
        case 'putObject':
          command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
          });
          break;
        case 'deleteObject':
          command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
          });
          break;
        default:
          throw new StorageError(`Unsupported operation: ${operation}`, 'INVALID_OPERATION');
      }

      const signedUrl = await getSignedUrl(this.client, command, {
        expiresIn,
      });

      logger.debug({
        key,
        operation,
        expiresIn,
      }, 'Generated signed URL');

      return signedUrl;
    } catch (error) {
      logger.error({ err: error, key }, 'Failed to generate signed URL');
      throw new StorageError(`Failed to generate signed URL: ${error instanceof Error ? error.message : 'Unknown error'}`, 'SIGNED_URL_ERROR');
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      
      logger.debug({ key }, 'File deleted successfully');
    } catch (error) {
      logger.error({ err: error, key }, 'Failed to delete file');
      throw new StorageError(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'DELETE_ERROR');
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (error: any) {
      if (error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      logger.error({ err: error, key }, 'Failed to check file existence');
      throw new StorageError(`Failed to check file existence: ${error.message}`, 'EXISTS_ERROR');
    }
  }

  async getMetadata(key: string): Promise<FileMetadata> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const result = await this.client.send(command);

      if (!result.ContentLength || !result.LastModified || !result.ETag) {
        throw new StorageError('Incomplete metadata received', 'METADATA_ERROR');
      }

      return {
        key,
        size: result.ContentLength,
        contentType: result.ContentType || 'application/octet-stream',
        lastModified: result.LastModified,
        etag: result.ETag,
        metadata: result.Metadata,
      };
    } catch (error: any) {
      if (error.$metadata?.httpStatusCode === 404) {
        throw new FileNotFoundError(key);
      }
      logger.error({ err: error, key }, 'Failed to get file metadata');
      throw new StorageError(`Failed to get file metadata: ${error.message}`, 'METADATA_ERROR');
    }
  }

  async copy(sourceKey: string, destinationKey: string): Promise<void> {
    try {
      const command = new CopyObjectCommand({
        Bucket: this.bucket,
        Key: destinationKey,
        CopySource: `${this.bucket}/${sourceKey}`,
      });

      await this.client.send(command);
      
      logger.debug({
        sourceKey,
        destinationKey,
      }, 'File copied successfully');
    } catch (error) {
      logger.error({ err: error, sourceKey, destinationKey }, 'Failed to copy file');
      throw new StorageError(`Failed to copy file: ${error instanceof Error ? error.message : 'Unknown error'}`, 'COPY_ERROR');
    }
  }

  async list(prefix: string, options: ListOptions = {}): Promise<FileInfo[]> {
    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: options.maxKeys,
        StartAfter: options.marker,
        Delimiter: options.delimiter,
      });

      const result = await this.client.send(command);
      
      const files: FileInfo[] = [];
      
      if (result.Contents) {
        for (const object of result.Contents) {
          if (object.Key && object.Size !== undefined && object.LastModified && object.ETag) {
            files.push({
              key: object.Key,
              size: object.Size,
              lastModified: object.LastModified,
              etag: object.ETag,
              storageClass: object.StorageClass,
            });
          }
        }
      }

      logger.debug({
        prefix,
        count: files.length,
      }, 'Listed files successfully');

      return files;
    } catch (error) {
      logger.error({ err: error, prefix }, 'Failed to list files');
      throw new StorageError(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`, 'LIST_ERROR');
    }
  }

  private getPublicUrl(key: string): string {
    if (this.cdnUrl) {
      return `${this.cdnUrl}/${key}`;
    }
    
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    
    // Fallback to S3 URL format
    const endpoint = this.client.config.endpoint;
    if (endpoint && typeof endpoint === 'string') {
      return `${endpoint}/${this.bucket}/${key}`;
    }
    
    return `https://${this.bucket}.s3.amazonaws.com/${key}`;
  }
}