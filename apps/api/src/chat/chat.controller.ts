import { 
  Controller, 
  Post, 
  Get, 
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
import { ChatService } from './chat.service';
import { SendMessageDto, GetMessagesQueryDto, MarkMessagesAsReadDto, GetConversationsQueryDto } from './dto/chat.dto';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @ApiOperation({ summary: 'Send a message to a friend' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Message sent successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        content: { type: 'string' },
        isRead: { type: 'boolean' },
        createdAt: { type: 'string' },
        sender: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            image: { type: 'string' }
          }
        },
        receiver: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            username: { type: 'string' },
            image: { type: 'string' }
          }
        }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Cannot send message to yourself' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Can only message friends' })
  async sendMessage(@Request() req, @Body() sendMessageDto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.sub, sendMessageDto);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get messages with another user' })
  @ApiQuery({ name: 'otherUserId', description: 'ID of the other user in the conversation' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of messages to return (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of messages to skip (default: 0)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Messages retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              content: { type: 'string' },
              isRead: { type: 'boolean' },
              createdAt: { type: 'string' },
              sender: { type: 'object' },
              receiver: { type: 'object' }
            }
          }
        },
        total: { type: 'number' },
        limit: { type: 'number' },
        offset: { type: 'number' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Can only view messages from friends' })
  async getMessages(@Request() req, @Query() query: GetMessagesQueryDto) {
    return this.chatService.getMessages(req.user.sub, query);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of conversations to return (default: 20)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of conversations to skip (default: 0)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Conversations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        conversations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  username: { type: 'string' },
                  image: { type: 'string' }
                }
              },
              lastMessage: {
                type: 'object',
                properties: {
                  content: { type: 'string' },
                  createdAt: { type: 'string' },
                  senderId: { type: 'string' },
                  isRead: { type: 'boolean' }
                }
              },
              unreadCount: { type: 'number' }
            }
          }
        },
        total: { type: 'number' },
        limit: { type: 'number' },
        offset: { type: 'number' }
      }
    }
  })
  async getConversations(@Request() req, @Query() query: GetConversationsQueryDto) {
    return this.chatService.getConversations(req.user.sub, query);
  }

  @Patch('messages/mark-read')
  @ApiOperation({ summary: 'Mark messages from a user as read' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Messages marked as read successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  async markMessagesAsRead(@Request() req, @Body() markAsReadDto: MarkMessagesAsReadDto) {
    return this.chatService.markMessagesAsRead(req.user.sub, markAsReadDto);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get count of unread messages' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Unread message count retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        unreadCount: { type: 'number' }
      }
    }
  })
  async getUnreadMessageCount(@Request() req) {
    const unreadCount = await this.chatService.getUnreadMessageCount(req.user.sub);
    return { unreadCount };
  }

  @Delete('message/:messageId')
  @ApiOperation({ summary: 'Delete a message (sender only)' })
  @ApiParam({ name: 'messageId', description: 'ID of the message to delete' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Message deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Message not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Can only delete own messages' })
  async deleteMessage(@Request() req, @Param('messageId') messageId: string) {
    return this.chatService.deleteMessage(req.user.sub, messageId);
  }
}