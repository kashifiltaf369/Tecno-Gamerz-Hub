import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { YouTubeService } from './services/youtube.service';
import { VideoSyncProcessor } from './processors/video-sync.processor';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video-sync',
    }),
  ],
  controllers: [VideosController],
  providers: [
    VideosService,
    YouTubeService,
    VideoSyncProcessor,
    PrismaService,
  ],
  exports: [VideosService, YouTubeService],
})
export class VideosModule {}