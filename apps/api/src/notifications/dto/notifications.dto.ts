import { IsString, IsBoolean, IsEnum, IsOptional, IsJSON } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum NotificationType {
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  FRIEND_ACCEPTED = 'FRIEND_ACCEPTED',
  TOURNAMENT_START = 'TOURNAMENT_START',
  TOURNAMENT_WIN = 'TOURNAMENT_WIN',
  MESSAGE_RECEIVED = 'MESSAGE_RECEIVED',
  LEVEL_UP = 'LEVEL_UP',
  BADGE_EARNED = 'BADGE_EARNED',
}

export class CreateNotificationDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID of the user to receive the notification' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'FRIEND_REQUEST', enum: NotificationType, description: 'Type of notification' })
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({ example: 'John Doe sent you a friend request', description: 'Notification message' })
  @IsString()
  message: string;

  @ApiProperty({ 
    example: '{"friendshipId": "123e4567-e89b-12d3-a456-426614174000"}', 
    description: 'Additional metadata for the notification',
    required: false 
  })
  @IsOptional()
  @IsJSON()
  metadata?: any;
}

export class GetNotificationsQueryDto {
  @ApiProperty({ example: '20', description: 'Number of notifications to return', required: false, default: 20 })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({ example: '0', description: 'Number of notifications to skip', required: false, default: 0 })
  @IsOptional()
  @IsString()
  offset?: string;

  @ApiProperty({ example: 'false', description: 'Filter by read status', required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({ example: 'FRIEND_REQUEST', enum: NotificationType, description: 'Filter by notification type', required: false })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;
}

export class MarkAsReadDto {
  @ApiProperty({ 
    example: '["123e4567-e89b-12d3-a456-426614174000", "456e7890-e89b-12d3-a456-426614174001"]', 
    description: 'Array of notification IDs to mark as read' 
  })
  @IsString({ each: true })
  notificationIds: string[];
}