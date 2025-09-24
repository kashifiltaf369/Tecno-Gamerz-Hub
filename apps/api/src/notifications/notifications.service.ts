import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateNotificationDto, GetNotificationsQueryDto, MarkAsReadDto, NotificationType } from './dto/notifications.dto';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async createNotification(createNotificationDto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: createNotificationDto.userId,
        type: createNotificationDto.type,
        message: createNotificationDto.message,
        metadata: createNotificationDto.metadata || {},
      },
    });

    return notification;
  }

  async getNotifications(userId: string, query: GetNotificationsQueryDto) {
    const { limit = '20', offset = '0', isRead, type } = query;
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    const where: any = { userId };
    
    if (isRead !== undefined) {
      where.isRead = isRead;
    }
    
    if (type) {
      where.type = type;
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      skip: offsetNum,
    });

    const total = await this.prisma.notification.count({
      where,
    });

    const unreadCount = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return {
      notifications,
      total,
      unreadCount,
      limit: limitNum,
      offset: offsetNum,
    };
  }

  async markAsRead(userId: string, markAsReadDto: MarkAsReadDto) {
    const { notificationIds } = markAsReadDto;

    // Verify all notifications belong to the user
    const notifications = await this.prisma.notification.findMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
    });

    if (notifications.length !== notificationIds.length) {
      throw new ForbiddenException('Some notifications do not belong to you or do not exist');
    }

    // Update notifications to read
    await this.prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId,
      },
      data: {
        isRead: true,
      },
    });

    return { message: `Marked ${notificationIds.length} notifications as read` };
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { message: `Marked ${result.count} notifications as read` };
  }

  async deleteNotification(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You can only delete your own notifications');
    }

    await this.prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Notification deleted successfully' };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  // Helper method to create system notifications
  async createSystemNotification(userId: string, type: NotificationType, message: string, metadata?: any) {
    return this.createNotification({
      userId,
      type,
      message,
      metadata,
    });
  }

  // Helper method for level up notifications
  async createLevelUpNotification(userId: string, newLevel: number) {
    return this.createSystemNotification(
      userId,
      NotificationType.LEVEL_UP,
      `Congratulations! You've reached level ${newLevel}!`,
      { newLevel }
    );
  }

  // Helper method for badge earned notifications
  async createBadgeEarnedNotification(userId: string, badgeName: string, badgeDescription: string) {
    return this.createSystemNotification(
      userId,
      NotificationType.BADGE_EARNED,
      `You've earned a new badge: ${badgeName}!`,
      { badgeName, badgeDescription }
    );
  }

  // Helper method for tournament notifications
  async createTournamentNotification(userId: string, type: NotificationType.TOURNAMENT_START | NotificationType.TOURNAMENT_WIN, tournamentTitle: string, tournamentId: string) {
    const message = type === NotificationType.TOURNAMENT_START 
      ? `Tournament "${tournamentTitle}" has started!`
      : `Congratulations! You won the tournament "${tournamentTitle}"!`;

    return this.createSystemNotification(
      userId,
      type,
      message,
      { tournamentId, tournamentTitle }
    );
  }

  // Helper method for message notifications
  async createMessageNotification(userId: string, senderName: string, senderId: string) {
    return this.createSystemNotification(
      userId,
      NotificationType.MESSAGE_RECEIVED,
      `You have a new message from ${senderName}`,
      { senderId, senderName }
    );
  }
}