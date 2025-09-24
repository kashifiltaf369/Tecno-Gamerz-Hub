import { IsString, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
}

export class SendFriendRequestDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'ID of the user to send friend request to' })
  @IsUUID()
  receiverId: string;
}

export class RespondToFriendRequestDto {
  @ApiProperty({ example: 'ACCEPTED', enum: FriendshipStatus, description: 'Response to the friend request' })
  @IsEnum(FriendshipStatus)
  status: FriendshipStatus.ACCEPTED | FriendshipStatus.DECLINED;
}

export class GetFriendsQueryDto {
  @ApiProperty({ example: 'ACCEPTED', enum: FriendshipStatus, description: 'Filter by friendship status', required: false })
  @IsOptional()
  @IsEnum(FriendshipStatus)
  status?: FriendshipStatus;

  @ApiProperty({ example: '10', description: 'Number of results to return', required: false, default: 20 })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiProperty({ example: '0', description: 'Number of results to skip', required: false, default: 0 })
  @IsOptional()
  @IsString()
  offset?: string;
}