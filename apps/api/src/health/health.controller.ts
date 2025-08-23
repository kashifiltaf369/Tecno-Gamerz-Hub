import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { HealthService } from './health.service';
import type { HealthCheckResponse } from '@tecno-gamerz/types';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private healthService: HealthService,
  ) {}

  @Get('liveness')
  @ApiOperation({ summary: 'Liveness probe' })
  @ApiResponse({ status: 200, description: 'Service is alive' })
  @HealthCheck()
  liveness() {
    return this.health.check([
      () => this.healthService.isHealthy('api'),
    ]);
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Readiness probe' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  @HealthCheck()
  readiness() {
    return this.health.check([
      () => this.healthService.checkDatabase(),
      () => this.healthService.checkRedis(),
      () => this.healthService.checkStorage(),
    ]);
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health status' })
  @ApiResponse({ status: 200, description: 'Detailed health information' })
  async detailed(): Promise<HealthCheckResponse> {
    return this.healthService.getDetailedHealth();
  }
}