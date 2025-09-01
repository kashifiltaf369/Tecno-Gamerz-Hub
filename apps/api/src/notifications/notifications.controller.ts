import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Delete, 
  Param, 
  Body, 
  Query, 
  UseGuards, 
  Request,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto, GetNotificationsQueryDto, MarkAsReadDto } from './dto/notifications.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of notifications to return (default: 20)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of notifications to skip (default: 0)' })
  @ApiQuery({ name: 'isRead', required: false, description: 'Filter by read status (true/false)' })
  @ApiQuery({ name: 'type', required: false, enum: ['FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'TOURNAMENT_START', 'TOURNAMENT_WIN', 'MESSAGE_RECEIVED', 'LEVEL_UP', 'BADGE_EARNED'], description: 'Filter by notification type' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Notifications retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              message: { type: 'string' },
              isRead: { type: 'boolean' },
              metadata: { type: 'object' },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        },
        total: { type: 'number' },
        unreadCount: { type: 'number' },
        limit: { type: 'number' },
        offset: { type: 'number' }
      }
    }
  })
  async getNotifications(@Request() req, @Query() query: GetNotificationsQueryDto) {
    return this.notificationsService.getNotifications(req.user.sub, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread notifications' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Unread count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        unreadCount: { type: 'number' }
      }
    }
  })
  async getUnreadCount(@Request() req) {
    const unreadCount = await this.notificationsService.getUnreadCount(req.user.sub);
    return { unreadCount };
  }

  @Patch('mark-as-read')
  @ApiOperation({ summary: 'Mark specific notifications as read' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Notifications marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Some notifications do not belong to you' })
  async markAsRead(@Request() req, @Body() markAsReadDto: MarkAsReadDto) {
    return this.notificationsService.markAsRead(req.user.sub, markAsReadDto);
  }

  @Patch('mark-all-as-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'All notifications marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Delete(':notificationId')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiParam({ name: 'notificationId', description: 'ID of the notification to delete' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Notification deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'You can only delete your own notifications' })
  async deleteNotification(@Request() req, @Param('notificationId') notificationId: string) {
    return this.notificationsService.deleteNotification(req.user.sub, notificationId);
  }

  // Admin-only endpoint for creating notifications (could be used for system announcements)
  @Post()
  @ApiOperation({ summary: 'Create a notification (Admin only)' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Notification created successfully',
  })
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(createNotificationDto);
  }
}