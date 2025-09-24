import { Module } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { TournamentsController } from './tournaments.controller';
import { PrismaService } from '../common/services/prisma.service';
import { GamificationService } from '../common/services/gamification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  controllers: [TournamentsController],
  providers: [
    TournamentsService,
    PrismaService,
    GamificationService,
    JwtAuthGuard,
    RolesGuard,
  ],
  exports: [TournamentsService],
})
export class TournamentsModule {}