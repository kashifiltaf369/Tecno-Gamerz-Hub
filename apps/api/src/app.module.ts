import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bull';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RbacModule } from './rbac/rbac.module';
import { QueueModule } from './queue/queue.module';
import { TournamentsModule } from './tournaments/tournaments.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { FriendsModule } from './friends/friends.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ChatModule } from './chat/chat.module';
import { ContentModule } from './content/content.module';
import { VideosModule } from './videos/videos.module';
import { configuration } from './config/configuration';
import { validationSchema } from './config/validation';
import { IS_PRODUCTION } from '@tecno-gamerz/utils/constants';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    // Logging
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || (IS_PRODUCTION ? 'info' : 'debug'),
        transport: IS_PRODUCTION
          ? undefined
          : {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            },
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'res.headers["set-cookie"]',
            'password',
            'token',
            'accessToken',
            'refreshToken',
          ],
          censor: '[REDACTED]',
        },
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
            query: req.query,
            params: req.params,
            headers: {
              host: req.headers.host,
              'user-agent': req.headers['user-agent'],
              'content-type': req.headers['content-type'],
            },
            remoteAddress: req.ip,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
            headers: {
              'content-type': res.headers['content-type'],
            },
          }),
        },
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot({
      ttl: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
      limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    }),

    // Queue system
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB || '0', 10),
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'tgh:',
      },
    }),

    // Feature modules
    HealthModule,
    AuthModule,
    UsersModule,
    RbacModule,
    QueueModule,
    TournamentsModule,
    LeaderboardModule,
    FriendsModule,
    NotificationsModule,
    ChatModule,
    ContentModule,
    VideosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}