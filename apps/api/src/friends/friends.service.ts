import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { FriendshipStatus, SendFriendRequestDto, RespondToFriendRequestDto, GetFriendsQueryDto } from './dto/friends.dto';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendFriendRequest(requesterId: string, sendFriendRequestDto: SendFriendRequestDto) {
    const { receiverId } = sendFriendRequestDto;

    // Prevent self-friendship
    if (requesterId === receiverId) {
      throw new BadRequestException('You cannot send a friend request to yourself');
    }

    // Check if receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    // Check if friendship already exists
    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, receiverId },
          { requesterId: receiverId, receiverId: requesterId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === FriendshipStatus.PENDING) {
        throw new BadRequestException('Friend request already sent');
      }
      if (existingFriendship.status === FriendshipStatus.ACCEPTED) {
        throw new BadRequestException('You are already friends with this user');
      }
      if (existingFriendship.status === FriendshipStatus.DECLINED) {
        // Allow resending after decline
        return this.prisma.friendship.update({
          where: { id: existingFriendship.id },
          data: { status: FriendshipStatus.PENDING, updatedAt: new Date() },
          include: {
            requester: {
              select: { id: true, name: true, email: true, username: true, image: true },
            },
            receiver: {
              select: { id: true, name: true, email: true, username: true, image: true },
            },
          },
        });
      }
    }

    // Create new friend request
    const friendship = await this.prisma.friendship.create({
      data: {
        requesterId,
        receiverId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true, username: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, username: true, image: true },
        },
      },
    });

    // Create notification for receiver
    await this.prisma.notification.create({
      data: {
        userId: receiverId,
        type: 'FRIEND_REQUEST',
        message: `${friendship.requester.name} sent you a friend request`,
        metadata: { friendshipId: friendship.id, requesterId },
      },
    });

    return friendship;
  }

  async respondToFriendRequest(userId: string, friendshipId: string, respondDto: RespondToFriendRequestDto) {
    const { status } = respondDto;

    // Find the friendship
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
      include: {
        requester: {
          select: { id: true, name: true, email: true, username: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, username: true, image: true },
        },
      },
    });

    if (!friendship) {
      throw new NotFoundException('Friend request not found');
    }

    // Check if user is the receiver of the request
    if (friendship.receiverId !== userId) {
      throw new ForbiddenException('You can only respond to friend requests sent to you');
    }

    // Check if request is still pending
    if (friendship.status !== FriendshipStatus.PENDING) {
      throw new BadRequestException('This friend request has already been responded to');
    }

    // Update the friendship status
    const updatedFriendship = await this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status },
      include: {
        requester: {
          select: { id: true, name: true, email: true, username: true, image: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, username: true, image: true },
        },
      },
    });

    // Create notification for requester if accepted
    if (status === FriendshipStatus.ACCEPTED) {
      await this.prisma.notification.create({
        data: {
          userId: friendship.requesterId,
          type: 'FRIEND_ACCEPTED',
          message: `${friendship.receiver.name} accepted your friend request`,
          metadata: { friendshipId: friendship.id, accepterId: userId },
        },
      });
    }

    return updatedFriendship;
  }

  async getFriends(userId: string, query: GetFriendsQueryDto) {
    const { status = FriendshipStatus.ACCEPTED, limit = '20', offset = '0' } = query;
    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    const friendships = await this.prisma.friendship.findMany({
      where: {
        status,
        OR: [
          { requesterId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true, username: true, image: true, level: true, xp: true },
        },
        receiver: {
          select: { id: true, name: true, email: true, username: true, image: true, level: true, xp: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limitNum,
      skip: offsetNum,
    });

    // Transform the response to return the friend (not the current user)
    const friends = friendships.map(friendship => ({
      id: friendship.id,
      status: friendship.status,
      createdAt: friendship.createdAt,
      friend: friendship.requesterId === userId ? friendship.receiver : friendship.requester,
    }));

    const total = await this.prisma.friendship.count({
      where: {
        status,
        OR: [
          { requesterId: userId },
          { receiverId: userId },
        ],
      },
    });

    return {
      friends,
      total,
      limit: limitNum,
      offset: offsetNum,
    };
  }

  async getFriendRequests(userId: string) {
    // Get incoming friend requests (where user is the receiver)
    const incomingRequests = await this.prisma.friendship.findMany({
      where: {
        receiverId: userId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        requester: {
          select: { id: true, name: true, email: true, username: true, image: true, level: true, xp: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get outgoing friend requests (where user is the requester)
    const outgoingRequests = await this.prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: FriendshipStatus.PENDING,
      },
      include: {
        receiver: {
          select: { id: true, name: true, email: true, username: true, image: true, level: true, xp: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      incoming: incomingRequests.map(req => ({
        id: req.id,
        user: req.requester,
        createdAt: req.createdAt,
      })),
      outgoing: outgoingRequests.map(req => ({
        id: req.id,
        user: req.receiver,
        createdAt: req.createdAt,
      })),
    };
  }

  async removeFriend(userId: string, friendshipId: string) {
    // Find the friendship
    const friendship = await this.prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    // Check if user is part of this friendship
    if (friendship.requesterId !== userId && friendship.receiverId !== userId) {
      throw new ForbiddenException('You can only remove your own friendships');
    }

    // Delete the friendship
    await this.prisma.friendship.delete({
      where: { id: friendshipId },
    });

    return { message: 'Friend removed successfully' };
  }

  async areFriends(userId: string, otherUserId: string): Promise<boolean> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [
          { requesterId: userId, receiverId: otherUserId },
          { requesterId: otherUserId, receiverId: userId },
        ],
      },
    });

    return !!friendship;
  }
}