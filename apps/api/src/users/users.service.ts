import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '@tecno-gamerz/utils/db';

@Injectable()
export class UsersService {
  async findOne(id: string) {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      ...user,
      roles: user.userRoles.map(ur => ur.role.name),
    };
  }

  async findAll() {
    const users = await db.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
      take: 50, // Limit for safety
    });

    return users.map(user => ({
      ...user,
      roles: user.userRoles.map(ur => ur.role.name),
    }));
  }
}