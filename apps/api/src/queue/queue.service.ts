import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { QUEUE_NAMES } from '@tecno-gamerz/utils/constants';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue(QUEUE_NAMES.MAIL) private mailQueue: Queue,
    @InjectQueue(QUEUE_NAMES.AUDIT) private auditQueue: Queue,
    @InjectQueue(QUEUE_NAMES.NOTIFICATIONS) private notificationQueue: Queue,
    @InjectQueue(QUEUE_NAMES.FILE_PROCESSING) private fileProcessingQueue: Queue,
  ) {}

  async addJob(queueName: string, data: any, options?: any) {
    const queue = this.getQueue(queueName);
    const job = await queue.add(data, options);
    
    return {
      id: job.id,
      name: job.name,
      data: job.data,
      options: job.opts,
    };
  }

  async getJobs(queueName: string) {
    const queue = this.getQueue(queueName);
    const jobs = await queue.getJobs(['waiting', 'active', 'completed', 'failed']);
    
    return jobs.map(job => ({
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress(),
      processedOn: job.processedOn,
      finishedOn: job.finishedOn,
      failedReason: job.failedReason,
    }));
  }

  async getQueueStatus(queueName: string) {
    const queue = this.getQueue(queueName);
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();

    return {
      name: queueName,
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      paused: await queue.isPaused(),
    };
  }

  private getQueue(queueName: string): Queue {
    switch (queueName) {
      case QUEUE_NAMES.MAIL:
        return this.mailQueue;
      case QUEUE_NAMES.AUDIT:
        return this.auditQueue;
      case QUEUE_NAMES.NOTIFICATIONS:
        return this.notificationQueue;
      case QUEUE_NAMES.FILE_PROCESSING:
        return this.fileProcessingQueue;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }
}