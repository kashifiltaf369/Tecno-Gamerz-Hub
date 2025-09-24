import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { FriendsService } from '../friends/friends.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SendMessageDto, GetMessagesQueryDto, MarkMessagesAsReadDto, GetConversationsQueryDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private friendsService: FriendsService,
    private notificationsService: NotificationsService,
  ) {}

  async sendMessage(senderId: string, sendMessageDto: SendMessageDto) {
    const { receiverId, content } = sendMessageDto;

    // Prevent self-messaging
    if (senderId === receiverId) {
      throw new BadRequestException('You cannot send a message to yourself');
    }

    // Check if users are friends
    const areFriends = await this.friendsService.areFriends(senderId, receiverId);
    if (!areFriends) {
      throw new ForbiddenException('You can only send messages to your friends');
    }

    // Create the message
    const message = await this.prisma.chatMessage.create({
      data: {
        senderId,
        receiverId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, username: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, username: true, image: true },
        },
      },
    });

    // Create notification for receiver
    await this.notificationsService.createMessageNotification(
      receiverId,
      message.sender.name,
      senderId
    );

    return message;
  }

  async getMessages(userId: string, query: GetMessagesQueryDto) {
    const { otherUserId, limit = '50', offset = '0' } = query;
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    // Check if users are friends
    const areFriends = await this.friendsService.areFriends(userId, otherUserId);
    if (!areFriends) {
      throw new ForbiddenException('You can only view messages from your friends');
    }

    const messages = await this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, username: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, username: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      skip: offsetNum,
    });

    const total = await this.prisma.chatMessage.count({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    });

    return {
      messages: messages.reverse(), // Reverse to get chronological order
      total,
      limit: limitNum,
      offset: offsetNum,
    };
  }

  async markMessagesAsRead(userId: string, markAsReadDto: MarkMessagesAsReadDto) {
    const { senderId } = markAsReadDto;

    // Mark all unread messages from sender as read
    const result = await this.prisma.chatMessage.updateMany({
      where: {
        senderId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { message: `Marked ${result.count} messages as read` };
  }

  async getConversations(userId: string, query: GetConversationsQueryDto) {
    const { limit = '20', offset = '0' } = query;
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    // Get all unique conversations (users who have exchanged messages)
    const conversations = await this.prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      select: {
        senderId: true,
        receiverId: true,
        createdAt: true,
        content: true,
        isRead: true,
        sender: {
          select: { id: true, name: true, email: true, username: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, username: true, image: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Process conversations to get unique users with latest message
    const conversationMap = new Map();
    
    for (const message of conversations) {
      const otherUser = message.senderId === userId ? message.receiver : message.sender;
      const conversationKey = otherUser.id;
      
      if (!conversationMap.has(conversationKey)) {
        // Count unread messages from this user
        const unreadCount = await this.prisma.chatMessage.count({
          where: {
            senderId: otherUser.id,
            receiverId: userId,
            isRead: false,
          },
        });

        conversationMap.set(conversationKey, {
          user: otherUser,
          lastMessage: {
            content: message.content,
            createdAt: message.createdAt,
            senderId: message.senderId,
            isRead: message.isRead,
          },
          unreadCount,
        });
      }
    }

    // Convert map to array and apply pagination
    const conversationList = Array.from(conversationMap.values())
      .slice(offsetNum, offsetNum + limitNum);

    return {
      conversations: conversationList,
      total: conversationMap.size,
      limit: limitNum,
      offset: offsetNum,
    };
  }

  async getUnreadMessageCount(userId: string): Promise<number> {
    return this.prisma.chatMessage.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }

  async deleteMessage(userId: string, messageId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Only sender can delete their own messages
    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.chatMessage.delete({
      where: { id: messageId },
    });

    return { message: 'Message deleted successfully' };
  }

  // Helper method to generate conversation ID for WebSocket rooms
  generateConversationId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `conversation-${sortedIds[0]}-${sortedIds[1]}`;
  }
}