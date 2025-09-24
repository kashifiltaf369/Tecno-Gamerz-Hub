import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID of the message receiver' })
  @IsUUID()
  receiverId: string;

  @ApiProperty({ example: 'Hello! How are you doing?', description: 'Message content' })
  @IsString()
  content: string;
}

export class GetMessagesQueryDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID of the other user in the conversation' })
  @IsUUID()
  otherUserId: string;

  @ApiProperty({ example: '20', description: 'Number of messages to return', required: false, default: 50 })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({ example: '0', description: 'Number of messages to skip', required: false, default: 0 })
  @IsOptional()
  @IsString()
  offset?: string;
}

export class MarkMessagesAsReadDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID of the sender whose messages to mark as read' })
  @IsUUID()
  senderId: string;
}

export class GetConversationsQueryDto {
  @ApiProperty({ example: '10', description: 'Number of conversations to return', required: false, default: 20 })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({ example: '0', description: 'Number of conversations to skip', required: false, default: 0 })
  @IsOptional()
  @IsString()
  offset?: string;
}

// WebSocket DTOs
export interface WsMessageData {
  receiverId: string;
  content: string;
}

export interface WsJoinRoomData {
  conversationId: string;
}

export interface WsTypingData {
  receiverId: string;
  isTyping: boolean;
}