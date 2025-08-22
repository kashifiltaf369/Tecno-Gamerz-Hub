import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../packages/utils/src/crypto';

const prisma = new PrismaClient();

// Permission definitions for RBAC
const PERMISSIONS = {
  // Global
  ALL: '*',
  
  // User management
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  
  // Tournament permissions
  TOURNAMENT_CREATE: 'tournament:create',
  TOURNAMENT_JOIN: 'tournament:join',
  TOURNAMENT_MANAGE: 'tournament:manage',
  
  // Video permissions
  VIDEO_UPLOAD: 'video:upload',
  VIDEO_MANAGE: 'video:manage',
  
  // Commerce permissions
  SHOP_MANAGE_SELF: 'shop:manage:self',
  SHOP_MANAGE_ALL: 'shop:manage:all',
  ORDER_CREATE: 'order:create',
  ORDER_MANAGE: 'order:manage',
  
  // Community permissions
  COMMENT_CREATE: 'comment:create',
  COMMENT_MODERATE: 'comment:moderate',
  
  // Donation permissions
  DONATE_CREATE: 'donate:create',
  DONATE_MANAGE: 'donate:manage',
  
  // Giveaway permissions
  GIVEAWAY_CREATE: 'giveaway:create',
  GIVEAWAY_MANAGE: 'giveaway:manage',
  
  // Admin permissions
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_USERS: 'admin:users',
  ADMIN_ANALYTICS: 'admin:analytics',
} as const;

// Role permission mappings
const ROLE_PERMISSIONS = {
  ADMIN: [PERMISSIONS.ALL], // Admin has all permissions
  GAMER: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.TOURNAMENT_CREATE,
    PERMISSIONS.VIDEO_UPLOAD,
    PERMISSIONS.GIVEAWAY_CREATE,
    PERMISSIONS.SHOP_MANAGE_SELF,
    PERMISSIONS.COMMENT_CREATE,
    PERMISSIONS.DONATE_CREATE,
    PERMISSIONS.ORDER_CREATE,
  ],
  FAN: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.TOURNAMENT_JOIN,
    PERMISSIONS.DONATE_CREATE,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.COMMENT_CREATE,
  ],
} as const;

async function seedRolesAndPermissions() {
  console.log('🔑 Seeding roles and permissions...');

  // Create all permissions
  const permissions = Object.values(PERMISSIONS);
  for (const permissionKey of permissions) {
    await prisma.permission.upsert({
      where: { key: permissionKey },
      update: {},
      create: {
        key: permissionKey,
        description: getPermissionDescription(permissionKey),
      },
    });
  }

  console.log(`✅ Created ${permissions.length} permissions`);

  // Create roles and assign permissions
  for (const [roleName, rolePermissions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName as any },
      update: {},
      create: {
        name: roleName as any,
        description: getRoleDescription(roleName as any),
      },
    });

    // Clear existing permissions for this role
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    // Assign permissions to role
    for (const permissionKey of rolePermissions) {
      const permission = await prisma.permission.findUnique({
        where: { key: permissionKey },
      });

      if (permission) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }

    console.log(`✅ Created role: ${roleName} with ${rolePermissions.length} permissions`);
  }
}

async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  if (!adminEmail) {
    console.log('⚠️  No ADMIN_EMAIL provided, skipping admin user creation');
    return;
  }

  console.log(`👤 Creating admin user: ${adminEmail}...`);

  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
    include: { userRoles: { include: { role: true } } },
  });

  if (existingUser) {
    console.log('✅ Admin user already exists');
    
    // Check if user has admin role
    const hasAdminRole = existingUser.userRoles.some(
      (userRole) => userRole.role.name === 'ADMIN'
    );

    if (!hasAdminRole) {
      console.log('🔧 Adding admin role to existing user...');
      const adminRole = await prisma.role.findUnique({
        where: { name: 'ADMIN' },
      });

      if (adminRole) {
        await prisma.userRole.create({
          data: {
            userId: existingUser.id,
            roleId: adminRole.id,
          },
        });
        console.log('✅ Admin role assigned to existing user');
      }
    }
    return;
  }

  // Create new admin user
  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      username: 'admin',
      status: 'ACTIVE',
    },
  });

  // Assign admin role
  const adminRole = await prisma.role.findUnique({
    where: { name: 'ADMIN' },
  });

  if (adminRole) {
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
  }

  console.log('✅ Admin user created and role assigned');

  // Log the admin user creation
  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'user.created',
      resource: 'User',
      resourceId: adminUser.id,
      metadata: {
        source: 'seed',
        role: 'ADMIN',
      },
    },
  });
}

function getPermissionDescription(permissionKey: string): string {
  const descriptions: Record<string, string> = {
    '*': 'Full access to all resources',
    'user:read': 'View user information',
    'user:write': 'Create and update users',
    'user:delete': 'Delete users',
    'tournament:create': 'Create tournaments',
    'tournament:join': 'Join tournaments',
    'tournament:manage': 'Manage tournaments',
    'video:upload': 'Upload videos',
    'video:manage': 'Manage videos',
    'shop:manage:self': 'Manage own shop items',
    'shop:manage:all': 'Manage all shop items',
    'order:create': 'Create orders',
    'order:manage': 'Manage orders',
    'comment:create': 'Create comments',
    'comment:moderate': 'Moderate comments',
    'donate:create': 'Make donations',
    'donate:manage': 'Manage donations',
    'giveaway:create': 'Create giveaways',
    'giveaway:manage': 'Manage giveaways',
    'admin:dashboard': 'Access admin dashboard',
    'admin:users': 'Manage users in admin panel',
    'admin:analytics': 'View analytics',
  };

  return descriptions[permissionKey] || `Permission: ${permissionKey}`;
}

function getRoleDescription(roleName: string): string {
  const descriptions: Record<string, string> = {
    ADMIN: 'Full administrative access to the platform',
    GAMER: 'Content creators and tournament organizers',
    FAN: 'Community members and tournament participants',
  };

  return descriptions[roleName] || `Role: ${roleName}`;
}

async function main() {
  try {
    console.log('🌱 Starting database seed...');

    await seedRolesAndPermissions();
    await seedAdminUser();

    console.log('✅ Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error during database seed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seed function
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main as seed };