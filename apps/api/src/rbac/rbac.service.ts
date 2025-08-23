import { Injectable } from '@nestjs/common';
import { db } from '@tecno-gamerz/utils/db';

@Injectable()
export class RbacService {
  async getAllRoles() {
    return db.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  async getAllPermissions() {
    return db.permission.findMany();
  }

  async checkPermission(userId: string, permissionKey: string): Promise<{ allowed: boolean; reason?: string }> {
    // Get user with roles and permissions
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return { allowed: false, reason: 'User not found' };
    }

    // Check if user has the required permission
    const userPermissions = user.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.key)
    );

    // Check for wildcard permission (admin)
    if (userPermissions.includes('*')) {
      return { allowed: true };
    }

    // Check for specific permission
    if (userPermissions.includes(permissionKey)) {
      return { allowed: true };
    }

    return { allowed: false, reason: 'Insufficient permissions' };
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return [];
    }

    return user.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.key)
    );
  }
}