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
import { FriendsService } from './friends.service';
import { SendFriendRequestDto, RespondToFriendRequestDto, GetFriendsQueryDto } from './dto/friends.dto';

@ApiTags('Friends')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Post('request')
  @ApiOperation({ summary: 'Send a friend request' })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'Friend request sent successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string', enum: ['PENDING'] },
        requester: {
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
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request or friendship already exists' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'User not found' })
  async sendFriendRequest(@Request() req, @Body() sendFriendRequestDto: SendFriendRequestDto) {
    return this.friendsService.sendFriendRequest(req.user.sub, sendFriendRequestDto);
  }

  @Patch('request/:friendshipId')
  @ApiOperation({ summary: 'Accept or decline a friend request' })
  @ApiParam({ name: 'friendshipId', description: 'ID of the friendship to respond to' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Friend request response processed successfully',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid request or already responded' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Friend request not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to respond to this request' })
  async respondToFriendRequest(
    @Request() req, 
    @Param('friendshipId') friendshipId: string,
    @Body() respondDto: RespondToFriendRequestDto
  ) {
    return this.friendsService.respondToFriendRequest(req.user.sub, friendshipId, respondDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user friends list' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'ACCEPTED', 'DECLINED'], description: 'Filter by friendship status' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of results to return (default: 20)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of results to skip (default: 0)' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Friends list retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        friends: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              status: { type: 'string' },
              createdAt: { type: 'string' },
              friend: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  username: { type: 'string' },
                  image: { type: 'string' },
                  level: { type: 'number' },
                  xp: { type: 'number' }
                }
              }
            }
          }
        },
        total: { type: 'number' },
        limit: { type: 'number' },
        offset: { type: 'number' }
      }
    }
  })
  async getFriends(@Request() req, @Query() query: GetFriendsQueryDto) {
    return this.friendsService.getFriends(req.user.sub, query);
  }

  @Get('requests')
  @ApiOperation({ summary: 'Get pending friend requests' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Friend requests retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        incoming: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  username: { type: 'string' },
                  image: { type: 'string' },
                  level: { type: 'number' },
                  xp: { type: 'number' }
                }
              },
              createdAt: { type: 'string' }
            }
          }
        },
        outgoing: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  username: { type: 'string' },
                  image: { type: 'string' },
                  level: { type: 'number' },
                  xp: { type: 'number' }
                }
              },
              createdAt: { type: 'string' }
            }
          }
        }
      }
    }
  })
  async getFriendRequests(@Request() req) {
    return this.friendsService.getFriendRequests(req.user.sub);
  }

  @Delete(':friendshipId')
  @ApiOperation({ summary: 'Remove a friend or cancel friend request' })
  @ApiParam({ name: 'friendshipId', description: 'ID of the friendship to remove' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Friend removed successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Friendship not found' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Not authorized to remove this friendship' })
  async removeFriend(@Request() req, @Param('friendshipId') friendshipId: string) {
    return this.friendsService.removeFriend(req.user.sub, friendshipId);
  }

  @Get('check/:userId')
  @ApiOperation({ summary: 'Check if users are friends' })
  @ApiParam({ name: 'userId', description: 'ID of the user to check friendship with' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Friendship status checked successfully',
    schema: {
      type: 'object',
      properties: {
        areFriends: { type: 'boolean' }
      }
    }
  })
  async checkFriendship(@Request() req, @Param('userId') userId: string) {
    const areFriends = await this.friendsService.areFriends(req.user.sub, userId);
    return { areFriends };
  }
}