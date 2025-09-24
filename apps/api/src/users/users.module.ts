import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { GamificationService } from '../common/services/gamification.service';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, GamificationService, PrismaService],
  exports: [UsersService],
})
export class UsersModule {}