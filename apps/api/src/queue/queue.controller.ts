import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QueueService } from './queue.service';

@ApiTags('Queue')
@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('jobs')
  @ApiOperation({ summary: 'Create a new job' })
  @ApiResponse({ status: 201, description: 'Job created successfully' })
  async createJob(@Body() body: { name: string; data: any; options?: any }) {
    return this.queueService.addJob(body.name, body.data, body.options);
  }

  @Get('jobs/:queueName')
  @ApiOperation({ summary: 'Get jobs in queue' })
  @ApiResponse({ status: 200, description: 'Jobs retrieved successfully' })
  async getJobs(@Param('queueName') queueName: string) {
    return this.queueService.getJobs(queueName);
  }

  @Get('status/:queueName')
  @ApiOperation({ summary: 'Get queue status' })
  @ApiResponse({ status: 200, description: 'Queue status retrieved successfully' })
  async getQueueStatus(@Param('queueName') queueName: string) {
    return this.queueService.getQueueStatus(queueName);
  }
}