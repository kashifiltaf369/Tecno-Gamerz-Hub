import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueController } from './queue.controller';
import { QueueService } from './queue.service';
import { QUEUE_NAMES } from '@tecno-gamerz/utils/constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: QUEUE_NAMES.MAIL },
      { name: QUEUE_NAMES.AUDIT },
      { name: QUEUE_NAMES.NOTIFICATIONS },
      { name: QUEUE_NAMES.FILE_PROCESSING },
    ),
  ],
  controllers: [QueueController],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}