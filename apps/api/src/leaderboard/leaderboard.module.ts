import { Module } from '@nestjs/common';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { PrismaService } from '../common/services/prisma.service';
import { GamificationService } from '../common/services/gamification.service';

@Module({
  controllers: [LeaderboardController],
  providers: [LeaderboardService, PrismaService, GamificationService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}