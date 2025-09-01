import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WsMessageData, WsJoinRoomData, WsTypingData } from './dto/chat.dto';

// JWT Guard for WebSocket (simplified version)
class WsJwtGuard {
  constructor(private jwtService: JwtService) {}

  canActivate(client: Socket): boolean {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) return false;
      
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      return true;
    } catch (error) {
      return false;
    }
  }
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private connectedUsers = new Map<string, Socket[]>(); // userId -> array of sockets

  constructor(
    private chatService: ChatService,
    private notificationsService: NotificationsService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      client.data.userId = userId;

      // Add to connected users
      if (!this.connectedUsers.has(userId)) {
        this.connectedUsers.set(userId, []);
      }
      this.connectedUsers.get(userId).push(client);

      // Join user to their personal room for notifications
      client.join(`user-${userId}`);

      // Emit online status to friends
      this.server.emit('user-online', { userId });

      this.logger.log(`User ${userId} connected`);
    } catch (error) {
      this.logger.error('Connection failed:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      // Remove from connected users
      const userSockets = this.connectedUsers.get(userId);
      if (userSockets) {
        const index = userSockets.indexOf(client);
        if (index > -1) {
          userSockets.splice(index, 1);
        }
        if (userSockets.length === 0) {
          this.connectedUsers.delete(userId);
          // Emit offline status to friends
          this.server.emit('user-offline', { userId });
        }
      }
      this.logger.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join-conversation')
  async handleJoinConversation(
    @MessageBody() data: WsJoinRoomData,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    const { conversationId } = data;
    
    // Join the conversation room
    client.join(conversationId);
    
    this.logger.log(`User ${userId} joined conversation ${conversationId}`);
    
    // Optionally mark messages as read when joining conversation
    // This would require parsing the conversationId to get the other user
  }

  @SubscribeMessage('leave-conversation')
  async handleLeaveConversation(
    @MessageBody() data: WsJoinRoomData,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    const { conversationId } = data;
    
    // Leave the conversation room
    client.leave(conversationId);
    
    this.logger.log(`User ${userId} left conversation ${conversationId}`);
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @MessageBody() data: WsMessageData,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    const { receiverId, content } = data;

    try {
      // Save message to database
      const message = await this.chatService.sendMessage(userId, { receiverId, content });
      
      // Generate conversation ID
      const conversationId = this.chatService.generateConversationId(userId, receiverId);
      
      // Send message to conversation room
      this.server.to(conversationId).emit('new-message', {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        receiverId: message.receiverId,
        createdAt: message.createdAt,
        sender: message.sender,
        receiver: message.receiver,
      });

      // Send notification to receiver if they're online but not in conversation
      const receiverSockets = this.connectedUsers.get(receiverId);
      if (receiverSockets && receiverSockets.length > 0) {
        // Check if receiver is in the conversation room
        const receiverInConversation = receiverSockets.some(socket => 
          socket.rooms.has(conversationId)
        );
        
        if (!receiverInConversation) {
          // Send notification if not in conversation
          this.server.to(`user-${receiverId}`).emit('message-notification', {
            senderId: userId,
            senderName: message.sender.name,
            content: content.length > 50 ? content.substring(0, 50) + '...' : content,
          });
        }
      }

      // Acknowledge message sent
      client.emit('message-sent', { messageId: message.id, success: true });

    } catch (error) {
      this.logger.error('Failed to send message:', error);
      client.emit('message-sent', { success: false, error: error.message });
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: WsTypingData,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    const { receiverId, isTyping } = data;

    // Generate conversation ID
    const conversationId = this.chatService.generateConversationId(userId, receiverId);
    
    // Send typing indicator to conversation room (excluding sender)
    client.to(conversationId).emit('user-typing', {
      userId,
      isTyping,
    });
  }

  @SubscribeMessage('mark-messages-read')
  async handleMarkMessagesRead(
    @MessageBody() data: { senderId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    const { senderId } = data;

    try {
      await this.chatService.markMessagesAsRead(userId, { senderId });
      
      // Notify the sender that their messages were read
      const conversationId = this.chatService.generateConversationId(userId, senderId);
      this.server.to(conversationId).emit('messages-read', {
        readBy: userId,
        senderId,
      });

    } catch (error) {
      this.logger.error('Failed to mark messages as read:', error);
    }
  }

  // Method to send notifications to online users
  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user-${userId}`).emit('notification', notification);
  }

  // Method to check if user is online
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  // Method to get online friends of a user
  getOnlineFriends(friendIds: string[]): string[] {
    return friendIds.filter(friendId => this.isUserOnline(friendId));
  }
}