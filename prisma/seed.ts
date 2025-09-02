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
  const hashedPassword = await hashPassword('AdminPassword123!');
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: adminEmail,
      passwordHash: hashedPassword,
      role: 'ADMIN',
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

async function seedTecnoGamerzChannel() {
  console.log('📺 Seeding TecnoGamerz channel and sample videos...');

  // Create TecnoGamerz channel
  const channel = await prisma.channel.upsert({
    where: { externalId: 'UCnuGhurhojQ8w6ksRZGcGOg' }, // Sample TecnoGamerz channel ID
    update: {},
    create: {
      name: 'Techno Gamerz',
      source: 'youtube',
      externalId: 'UCnuGhurhojQ8w6ksRZGcGOg',
    },
  });

  console.log(`✅ Created/updated channel: ${channel.name}`);

  // Sample videos data (in real scenario, these would be fetched from YouTube API)
  const sampleVideos = [
    {
      title: 'GTA 5 - Epic Gaming Session with New Mods!',
      description: 'Join me in this amazing GTA 5 gameplay with the latest mods. Non-stop action and fun!',
      youtubeId: 'dQw4w9WgXcQ', // Sample video ID
      duration: 1245, // 20 minutes 45 seconds
      publishedAt: new Date('2024-01-15'),
      tags: ['GTA V', 'Gaming', 'Mods', 'Action'],
      thumbnails: {
        medium: {
          url: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
          width: 320,
          height: 180
        }
      },
      transcript: 'Welcome to another epic gaming session! Today we are exploring the amazing world of GTA 5 with some incredible new mods. Let\'s dive right into the action and see what adventures await us in Los Santos!'
    },
    {
      title: 'PUBG Mobile - Victory Royale with Squad!',
      description: 'Incredible PUBG Mobile gameplay where we achieve victory with amazing teamwork and strategy.',
      youtubeId: 'dQw4w9WgXcR', // Sample video ID
      duration: 891, // 14 minutes 51 seconds
      publishedAt: new Date('2024-01-20'),
      tags: ['PUBG Mobile', 'Battle Royale', 'Squad', 'Victory'],
      thumbnails: {
        medium: {
          url: 'https://img.youtube.com/vi/dQw4w9WgXcR/mqdefault.jpg',
          width: 320,
          height: 180
        }
      },
      transcript: 'Hey gamers! Today we\'re dropping into the battleground with my squad for some intense PUBG Mobile action. Watch as we strategize, fight, and work together to achieve that sweet victory royale!'
    },
    {
      title: 'Minecraft - Building the Ultimate Gaming Setup!',
      description: 'Creating an amazing gaming setup in Minecraft with redstone contraptions and epic designs.',
      youtubeId: 'dQw4w9WgXcS', // Sample video ID
      duration: 1567, // 26 minutes 7 seconds
      publishedAt: new Date('2024-01-25'),
      tags: ['Minecraft', 'Building', 'Redstone', 'Tutorial'],
      thumbnails: {
        medium: {
          url: 'https://img.youtube.com/vi/dQw4w9WgXcS/mqdefault.jpg',
          width: 320,
          height: 180
        }
      },
      transcript: 'Welcome back to Minecraft! In this episode, we\'re building the ultimate gaming setup with some crazy redstone contraptions. I\'ll show you step by step how to create these amazing builds!'
    },
    {
      title: 'Free Fire - Pro Tips and Tricks for Beginners',
      description: 'Learn the best strategies and tips to dominate in Free Fire. Perfect guide for new players!',
      youtubeId: 'dQw4w9WgXcT', // Sample video ID
      duration: 723, // 12 minutes 3 seconds
      publishedAt: new Date('2024-02-01'),
      tags: ['Free Fire', 'Tips', 'Tutorial', 'Beginner Guide'],
      thumbnails: {
        medium: {
          url: 'https://img.youtube.com/vi/dQw4w9WgXcT/mqdefault.jpg',
          width: 320,
          height: 180
        }
      },
      transcript: 'What\'s up Free Fire players! Today I\'m sharing some pro tips and tricks that will help beginners dominate the battlefield. These strategies have helped me win countless matches!'
    },
    {
      title: 'Among Us - Hilarious Moments with Friends!',
      description: 'The funniest Among Us gameplay with my friends. You won\'t believe these epic impostor plays!',
      youtubeId: 'dQw4w9WgXcU', // Sample video ID
      duration: 934, // 15 minutes 34 seconds
      publishedAt: new Date('2024-02-05'),
      tags: ['Among Us', 'Funny Moments', 'Friends', 'Multiplayer'],
      thumbnails: {
        medium: {
          url: 'https://img.youtube.com/vi/dQw4w9WgXcU/mqdefault.jpg',
          width: 320,
          height: 180
        }
      },
      transcript: 'Get ready to laugh! This Among Us session with my friends was absolutely hilarious. From epic impostor plays to sus moments, this video has it all!'
    }
  ];

  // Create sample videos
  let createdCount = 0;
  for (const videoData of sampleVideos) {
    const existingVideo = await prisma.video.findUnique({
      where: { youtubeId: videoData.youtubeId },
    });

    if (!existingVideo) {
      await prisma.video.create({
        data: {
          ...videoData,
          channelId: channel.id,
          views: Math.floor(Math.random() * 100000) + 1000, // Random view count between 1k-100k
        },
      });
      createdCount++;
    }
  }

  console.log(`✅ Created ${createdCount} sample videos`);
}

async function seedVideoQuizzes() {
  console.log('🎯 Seeding sample video quizzes...');

  // Find some videos to attach quizzes to
  const videos = await prisma.video.findMany({
    take: 2,
  });

  if (videos.length === 0) {
    console.log('⚠️  No videos found, skipping quiz seeding');
    return;
  }

  const sampleQuizzes = [
    {
      videoId: videos[0].id,
      title: 'Gaming Knowledge Quiz',
      description: 'Test your gaming knowledge with this fun quiz!',
      questions: [
        {
          question: 'What is the maximum number of players in a PUBG Mobile classic match?',
          options: ['50', '80', '100', '120'],
          correctAnswer: 2,
          explanation: 'PUBG Mobile classic matches support up to 100 players.'
        },
        {
          question: 'Which game is known for its "Victory Royale"?',
          options: ['PUBG', 'Fortnite', 'Call of Duty', 'Apex Legends'],
          correctAnswer: 1,
          explanation: 'Fortnite is famous for its "Victory Royale" when you win a match.'
        }
      ],
      xpReward: 75,
      coinsReward: 15,
    }
  ];

  if (videos.length > 1) {
    sampleQuizzes.push({
      videoId: videos[1].id,
      title: 'Minecraft Basics Quiz',
      description: 'How well do you know Minecraft? Take this quiz to find out!',
      questions: [
        {
          question: 'What material do you need to craft a diamond sword?',
          options: ['Iron ingots', 'Gold ingots', 'Diamonds', 'Emeralds'],
          correctAnswer: 2,
          explanation: 'You need diamonds and sticks to craft a diamond sword.'
        },
        {
          question: 'What happens when you sleep in the Nether?',
          options: ['Nothing special', 'You wake up in the overworld', 'The bed explodes', 'You get teleported'],
          correctAnswer: 2,
          explanation: 'Beds explode when you try to sleep in the Nether!'
        }
      ],
      xpReward: 50,
      coinsReward: 10,
    });
  }

  let createdCount = 0;
  for (const quizData of sampleQuizzes) {
    const existingQuiz = await prisma.videoQuiz.findFirst({
      where: { 
        videoId: quizData.videoId,
        title: quizData.title,
      },
    });

    if (!existingQuiz) {
      await prisma.videoQuiz.create({
        data: quizData,
      });
      createdCount++;
    }
  }

  console.log(`✅ Created ${createdCount} sample quizzes`);
}

async function main() {
  try {
    console.log('🌱 Starting database seed...');

    await seedRolesAndPermissions();
    await seedAdminUser();
    await seedTecnoGamerzChannel();
    await seedVideoQuizzes();

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