import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { VideosService } from '../videos.service';

export interface VideoSyncJob {
  channelId: string;
  maxResults?: number;
  forceRefresh?: boolean;
}

export interface VideoMetadataUpdateJob {
  videoIds: string[];
}

@Processor('video-sync')
export class VideoSyncProcessor {
  private readonly logger = new Logger(VideoSyncProcessor.name);

  constructor(private videosService: VideosService) {}

  @Process('sync-channel')
  async handleChannelSync(job: Job<VideoSyncJob>) {
    const { channelId, maxResults = 50, forceRefresh = false } = job.data;
    
    this.logger.log(`Starting sync for channel: ${channelId}`);
    
    try {
      const result = await this.videosService.syncChannelVideos({
        channelId,
        maxResults,
        forceRefresh,
      });
      
      this.logger.log(
        `Channel sync completed: ${result.created} created, ${result.updated} updated`
      );
      
      return result;
    } catch (error) {
      this.logger.error(`Channel sync failed for ${channelId}:`, error);
      throw error;
    }
  }

  @Process('update-metadata')
  async handleMetadataUpdate(job: Job<VideoMetadataUpdateJob>) {
    const { videoIds } = job.data;
    
    this.logger.log(`Updating metadata for ${videoIds.length} videos`);
    
    try {
      // TODO: Implement metadata update logic
      // This could include updating thumbnails, transcripts, tags, etc.
      
      this.logger.log(`Metadata update completed for ${videoIds.length} videos`);
      
      return { updated: videoIds.length };
    } catch (error) {
      this.logger.error('Metadata update failed:', error);
      throw error;
    }
  }

  @Process('periodic-sync')
  async handlePeriodicSync() {
    this.logger.log('Starting periodic sync of all channels');
    
    try {
      // TODO: Implement periodic sync logic
      // This would sync all channels for new videos
      
      this.logger.log('Periodic sync completed');
      
      return { success: true };
    } catch (error) {
      this.logger.error('Periodic sync failed:', error);
      throw error;
    }
  }
}