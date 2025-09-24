import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateUserContentDto, ContentFiltersDto } from './dto/content.dto';
import { UserContent, PaginatedResponse } from '@tecno-gamerz/types';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async createContent(createContentDto: CreateUserContentDto, userId: string): Promise<UserContent> {
    const { title, videoUrl } = createContentDto;

    // Validate video URL format
    const normalizedUrl = videoUrl.trim();
    const validUrlPattern = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|twitch\.tv|vimeo\.com)\/.+$/i;
    
    if (!validUrlPattern.test(normalizedUrl)) {
      throw new BadRequestException('Video URL must be from YouTube, Twitch, or Vimeo');
    }

    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const content = await this.prisma.userContent.create({
      data: {
        title: title.trim(),
        videoUrl: normalizedUrl,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    return content as UserContent;
  }

  async findAll(filters: ContentFiltersDto): Promise<PaginatedResponse<UserContent>> {
    const {
      search,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;
    const where: Prisma.UserContentWhereInput = {};

    // Apply search filter
    if (search) {
      where.title = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [contents, total] = await this.prisma.$transaction([
      this.prisma.userContent.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      this.prisma.userContent.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: contents as UserContent[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string): Promise<UserContent> {
    const content = await this.prisma.userContent.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return content as UserContent;
  }

  async findUserContent(userId: string): Promise<UserContent[]> {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const contents = await this.prisma.userContent.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return contents as UserContent[];
  }

  async deleteContent(id: string, userId: string): Promise<void> {
    const content = await this.prisma.userContent.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    // Check if user owns the content
    if (content.userId !== userId) {
      // Allow admins to delete any content
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (user?.role !== 'ADMIN') {
        throw new BadRequestException('You can only delete your own content');
      }
    }

    await this.prisma.userContent.delete({
      where: { id },
    });
  }
}