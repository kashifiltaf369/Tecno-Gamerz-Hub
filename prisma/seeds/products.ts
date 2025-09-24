import { PrismaClient, ProductType } from '@prisma/client';

const prisma = new PrismaClient();

interface ProductSeedData {
  id?: string;
  name: string;
  description: string;
  price: number;
  type: ProductType;
  category: string;
  imageUrl: string;
  stock?: number | null;
  metadata?: any;
}

const sampleProducts: ProductSeedData[] = [
  // Digital Cosmetics - Skins
  {
    name: 'Dragon Warrior Legendary Skin',
    description: 'Transform your character into a legendary dragon warrior with this epic skin. Features unique animations, fire effects, and exclusive voice lines. Perfect for dominating the battlefield with style.',
    price: 49.99,
    type: ProductType.DIGITAL_COSMETIC,
    category: 'Character Skins',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    stock: null,
    metadata: {
      rarity: 'legendary',
      badgeId: 'dragon_warrior_badge',
      cosmeticId: 'dragon_warrior_skin',
      effects: ['fire_aura', 'wing_animation', 'roar_sound'],
      compatibility: ['PUBG Mobile', 'Free Fire', 'Call of Duty Mobile'],
      previewUrl: 'https://example.com/previews/dragon-warrior.mp4',
      releaseDate: '2024-01-15'
    }
  },
  {
    name: 'Cyber Ninja Elite Outfit',
    description: 'Step into the future with this high-tech cyber ninja outfit. Includes glowing neon accents, stealth effects, and futuristic weapon skins. Exclusive to Tecno Gamerz Hub members.',
    price: 39.99,
    type: ProductType.DIGITAL_COSMETIC,
    category: 'Character Skins',
    imageUrl: 'https://images.unsplash.com/photo-1614849963640-9cc74b2a826f?w=400&h=300&fit=crop',
    stock: null,
    metadata: {
      rarity: 'epic',
      badgeId: 'cyber_ninja_badge',
      cosmeticId: 'cyber_ninja_outfit',
      effects: ['neon_glow', 'stealth_shimmer', 'tech_sounds'],
      compatibility: ['Valorant', 'Apex Legends', 'Overwatch'],
      previewUrl: 'https://example.com/previews/cyber-ninja.mp4',
      releaseDate: '2024-01-20'
    }
  },
  {
    name: 'Royal Knight Armor Set',
    description: 'Command respect on the battlefield with this majestic royal knight armor. Features golden accents, cape animation, and regal sound effects. A true symbol of honor and valor.',
    price: 34.99,
    type: ProductType.DIGITAL_COSMETIC,
    category: 'Character Skins',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
    stock: null,
    metadata: {
      rarity: 'epic',
      badgeId: 'royal_knight_badge',
      cosmeticId: 'royal_knight_armor',
      effects: ['golden_shimmer', 'cape_flow', 'horn_fanfare'],
      compatibility: ['World of Warcraft', 'Guild Wars 2', 'Elder Scrolls Online'],
      previewUrl: 'https://example.com/previews/royal-knight.mp4',
      releaseDate: '2024-01-25'
    }
  },
  {
    name: 'Space Explorer Suit',
    description: 'Explore the cosmos in style with this futuristic space explorer suit. Complete with helmet effects, jetpack animations, and cosmic particle trails.',
    price: 24.99,
    type: ProductType.DIGITAL_COSMETIC,
    category: 'Character Skins',
    imageUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop',
    stock: null,
    metadata: {
      rarity: 'rare',
      badgeId: 'space_explorer_badge',
      cosmeticId: 'space_explorer_suit',
      effects: ['helmet_glow', 'jetpack_thrust', 'star_particles'],
      compatibility: ['No Man\'s Sky', 'Elite Dangerous', 'Star Citizen'],
      previewUrl: 'https://example.com/previews/space-explorer.mp4',
      releaseDate: '2024-02-01'
    }
  },

  // Digital Cosmetics - Weapon Skins
  {
    name: 'Phoenix Rising AK-47 Skin',
    description: 'Unleash the power of the phoenix with this stunning AK-47 skin. Features animated fire effects, phoenix feathers, and exclusive reload animations.',
    price: 29.99,
    type: ProductType.DIGITAL_COSMETIC,
    category: 'Weapon Skins',
    imageUrl: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?w=400&h=300&fit=crop',
    stock: null,
    metadata: {
      rarity: 'legendary',
      badgeId: 'phoenix_marksman_badge',
      cosmeticId: 'phoenix_ak47_skin',
      effects: ['fire_trail', 'phoenix_particles', 'mythic_glow'],
      compatibility: ['CS:GO', 'Valorant', 'Call of Duty'],
      weaponType: 'assault_rifle',
      previewUrl: 'https://example.com/previews/phoenix-ak47.mp4',
      releaseDate: '2024-01-10'
    }
  },
  {
    name: 'Neon Pulse Sniper Rifle',
    description: 'Dominate long-range encounters with this electrifying neon pulse sniper rifle skin. Features electric animations and futuristic scope effects.',
    price: 27.99,
    type: ProductType.DIGITAL_COSMETIC,
    category: 'Weapon Skins',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop',
    stock: null,
    metadata: {
      rarity: 'epic',
      badgeId: 'neon_sniper_badge',
      cosmeticId: 'neon_pulse_sniper',
      effects: ['electric_pulse', 'neon_trail', 'scope_glow'],
      compatibility: ['PUBG', 'Apex Legends', 'Call of Duty'],
      weaponType: 'sniper_rifle',
      previewUrl: 'https://example.com/previews/neon-sniper.mp4',
      releaseDate: '2024-01-18'
    }
  },

  // Digital Cosmetics - Badges & Achievements
  {
    name: 'Tournament Champion Badge 2024',
    description: 'Exclusive badge for tournament champions. Show off your competitive prowess with this prestigious golden badge. Limited edition for 2024 champions only.',
    price: 19.99,
    type: ProductType.DIGITAL_COSMETIC,
    category: 'Badges & Achievements',
    imageUrl: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=300&fit=crop',
    stock: null,
    metadata: {
      rarity: 'legendary',
      badgeId: 'tournament_champion_2024',
      effects: ['golden_glow', 'champion_aura'],
      requirements: {
        tournamentWins: 1,
        season: '2024'
      },
      displayName: 'Champion \'24',
      description: 'Tournament Champion 2024',
      previewUrl: 'https://example.com/previews/champion-badge.png',
      releaseDate: '2024-01-01'
    }
  },
  {
    name: 'Gamer Elite Status Badge',
    description: 'Join the elite ranks of gamers with this exclusive status badge. Unlocks special privileges and shows your dedication to the gaming community.',
    price: 14.99,
    type: ProductType.DIGITAL_COSMETIC,
    category: 'Badges & Achievements',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=300&fit=crop',
    stock: null,
    metadata: {
      rarity: 'epic',
      badgeId: 'gamer_elite_status',
      effects: ['elite_glow', 'prestige_aura'],
      benefits: ['priority_matchmaking', 'exclusive_chat_color', 'special_emotes'],
      displayName: 'Elite Gamer',
      description: 'Elite Gaming Status',
      previewUrl: 'https://example.com/previews/elite-badge.png',
      releaseDate: '2024-01-05'
    }
  },

  // Physical Merchandise - Gaming Hardware
  {
    name: 'Tecno Gamerz Pro Gaming Headset',
    description: 'Experience crystal-clear audio with our professional gaming headset. Features 7.1 surround sound, noise cancellation, and ergonomic design for marathon gaming sessions.',
    price: 199.99,
    type: ProductType.PHYSICAL_MERCHANDISE,
    category: 'Gaming Hardware',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop',
    stock: 75,
    metadata: {
      brand: 'Tecno Gamerz',
      model: 'TG-Pro-001',
      features: [
        '7.1 Surround Sound',
        'Noise Cancellation',
        'Retractable Microphone',
        'RGB Lighting',
        'Memory Foam Cushions'
      ],
      compatibility: ['PC', 'PS5', 'Xbox Series X', 'Nintendo Switch'],
      warranty: '2 years',
      weight: '350g',
      cableLength: '2m',
      colorOptions: ['Black/Red', 'White/Blue', 'RGB'],
      inBox: ['Headset', 'USB Cable', 'Audio Splitter', 'User Manual', 'Carrying Case']
    }
  },
  {
    name: 'Elite Gaming Mechanical Keyboard',
    description: 'Dominate your games with precision using our elite mechanical keyboard. Cherry MX switches, customizable RGB backlighting, and programmable macro keys.',
    price: 159.99,
    type: ProductType.PHYSICAL_MERCHANDISE,
    category: 'Gaming Hardware',
    imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=300&fit=crop',
    stock: 50,
    metadata: {
      brand: 'Tecno Gamerz',
      model: 'TG-Elite-KB-002',
      keySwitch: 'Cherry MX Red',
      layout: 'Full-size (104 keys)',
      features: [
        'Mechanical Cherry MX Red Switches',
        'Per-key RGB Lighting',
        'Programmable Macro Keys',
        'USB Pass-through',
        'Detachable Wrist Rest',
        'Anti-ghosting'
      ],
      software: 'Tecno Gamerz Control Center',
      connectivity: 'USB-C',
      dimensions: '440 × 135 × 35mm',
      weight: '1.2kg',
      warranty: '2 years'
    }
  },
  {
    name: 'Precision Gaming Mouse',
    description: 'Achieve pixel-perfect accuracy with our high-precision gaming mouse. 16,000 DPI sensor, customizable weights, and ergonomic grip for competitive gaming.',
    price: 89.99,
    type: ProductType.PHYSICAL_MERCHANDISE,
    category: 'Gaming Hardware',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop',
    stock: 120,
    metadata: {
      brand: 'Tecno Gamerz',
      model: 'TG-Precision-M-003',
      sensor: 'Pixart PMW3360',
      dpi: '100-16000 DPI',
      features: [
        '16,000 DPI Sensor',
        '8 Programmable Buttons',
        'Adjustable Weight System',
        'RGB Lighting',
        'Braided Cable',
        'PTFE Feet'
      ],
      connectivity: 'USB',
      polling_rate: '1000Hz',
      dimensions: '128 × 68 × 42mm',
      weight: '95g (without weights)',
      warranty: '2 years'
    }
  },
  {
    name: 'Gaming Monitor Stand with RGB',
    description: 'Elevate your gaming setup with our adjustable monitor stand featuring built-in RGB lighting and cable management. Compatible with monitors up to 32 inches.',
    price: 79.99,
    type: ProductType.PHYSICAL_MERCHANDISE,
    category: 'Gaming Hardware',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop',
    stock: 60,
    metadata: {
      brand: 'Tecno Gamerz',
      model: 'TG-Stand-RGB-004',
      maxMonitorSize: '32 inches',
      weightCapacity: '10kg',
      features: [
        'Height Adjustable (10-20cm)',
        'Built-in RGB Lighting',
        'Cable Management System',
        'Non-slip Base',
        'Tilt Adjustment',
        'USB Hub (4 ports)'
      ],
      dimensions: '60 × 25 × 15cm',
      material: 'Aluminum Alloy',
      compatibility: ['VESA 75x75', 'VESA 100x100'],
      warranty: '1 year'
    }
  },

  // Physical Merchandise - Apparel
  {
    name: 'Tecno Gamerz Official T-Shirt',
    description: 'Rep your favorite gaming channel with our official Tecno Gamerz t-shirt. Premium cotton blend, comfortable fit, and iconic logo design.',
    price: 24.99,
    type: ProductType.PHYSICAL_MERCHANDISE,
    category: 'Apparel',
    imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop',
    stock: 200,
    metadata: {
      brand: 'Tecno Gamerz',
      material: '100% Premium Cotton',
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Navy Blue', 'Gaming Green'],
      design: 'Tecno Gamerz Logo',
      printType: 'High-quality Screen Print',
      care: 'Machine washable, tumble dry low',
      origin: 'Made in India',
      sizeChart: {
        'XS': 'Chest: 34", Length: 26"',
        'S': 'Chest: 36", Length: 27"',
        'M': 'Chest: 38", Length: 28"',
        'L': 'Chest: 40", Length: 29"',
        'XL': 'Chest: 42", Length: 30"',
        'XXL': 'Chest: 44", Length: 31"'
      }
    }
  },
  {
    name: 'Gaming Hoodie - Level Up Edition',
    description: 'Stay warm and stylish with our limited edition "Level Up" gaming hoodie. Features unique gamer-themed graphics and ultra-soft fleece lining.',
    price: 49.99,
    type: ProductType.PHYSICAL_MERCHANDISE,
    category: 'Apparel',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=300&fit=crop',
    stock: 85,
    metadata: {
      brand: 'Tecno Gamerz',
      material: '80% Cotton, 20% Polyester',
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Charcoal Gray', 'Navy Blue', 'Forest Green'],
      design: 'Level Up Gaming Graphics',
      features: [
        'Kangaroo Pocket',
        'Drawstring Hood',
        'Ribbed Cuffs and Hem',
        'Soft Fleece Lining'
      ],
      printType: 'Embroidered Logo + Screen Print',
      care: 'Machine wash cold, hang dry recommended',
      limited_edition: true,
      edition_size: 1000
    }
  },
  {
    name: 'Gamer Cap - Victory Edition',
    description: 'Complete your gaming look with our Victory Edition cap. Adjustable fit, embroidered logo, and moisture-wicking fabric perfect for gaming marathons.',
    price: 19.99,
    type: ProductType.PHYSICAL_MERCHANDISE,
    category: 'Apparel',
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&h=300&fit=crop',
    stock: 150,
    metadata: {
      brand: 'Tecno Gamerz',
      style: 'Snapback',
      material: '100% Cotton Twill',
      colors: ['Black/Gold', 'Navy/White', 'Red/Black'],
      features: [
        'Adjustable Snapback',
        'Embroidered 3D Logo',
        'Moisture-wicking Sweatband',
        'Curved Brim',
        'Flat Brim Option Available'
      ],
      oneSize: 'Fits most (56-60cm)',
      care: 'Hand wash recommended, air dry',
      logo: '3D Embroidered Tecno Gamerz'
    }
  },

  // Physical Merchandise - Accessories
  {
    name: 'Gaming Desk Pad XXL',
    description: 'Transform your gaming setup with our extra-large gaming desk pad. Water-resistant surface, anti-slip base, and stunning Tecno Gamerz artwork.',
    price: 34.99,
    type: ProductType.PHYSICAL_MERCHANDISE,
    category: 'Gaming Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1587829443288-30c85b83d5c8?w=400&h=300&fit=crop',
    stock: 90,
    metadata: {
      brand: 'Tecno Gamerz',
      dimensions: '900 × 400 × 3mm',
      material: 'High-quality Fabric Surface + Natural Rubber Base',
      features: [
        'XXL Size (90cm × 40cm)',
        'Water-resistant Surface',
        'Anti-slip Rubber Base',
        'Stitched Edges',
        'Smooth Mouse Tracking',
        'Easy to Clean'
      ],
      design: 'Tecno Gamerz Artwork',
      thickness: '3mm',
      care: 'Wipe clean with damp cloth',
      warranty: '1 year'
    }
  },
  {
    name: 'RGB Gaming Mousepad',
    description: 'Light up your gaming with our RGB gaming mousepad. Multiple lighting effects, software control, and optimized surface for all mouse types.',
    price: 44.99,
    type: ProductType.PHYSICAL_MERCHANDISE,
    category: 'Gaming Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1564473085938-83c50c62544a?w=400&h=300&fit=crop',
    stock: 70,
    metadata: {
      brand: 'Tecno Gamerz',
      dimensions: '350 × 250 × 4mm',
      features: [
        'RGB LED Lighting',
        'Software Customization',
        'Multiple Light Effects',
        'Micro-textured Surface',
        'Anti-slip Base',
        'USB-C Connection'
      ],
      lighting_zones: 12,
      power_consumption: '5W',
      cable_length: '1.8m',
      software: 'Tecno Gamerz RGB Control',
      warranty: '2 years'
    }
  },

  // Tournament Items
  {
    name: 'Tournament Entry Pass - Pro League',
    description: 'Gain exclusive access to the Tecno Gamerz Pro League tournament. Compete against the best players and win amazing prizes. Limited slots available!',
    price: 99.99,
    type: ProductType.TOURNAMENT_ITEM,
    category: 'Tournament Passes',
    imageUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop',
    stock: null,
    metadata: {
      tournament: 'Tecno Gamerz Pro League 2024',
      type: 'entry_pass',
      season: '2024-Q1',
      benefits: [
        'Tournament Entry',
        'Exclusive Badge',
        'Prize Pool Participation',
        'VIP Discord Access',
        'Live Stream Priority',
        'Tournament Merchandise Discount'
      ],
      prizePool: '$50,000',
      maxParticipants: 256,
      gameTitle: 'Multiple Games',
      duration: '4 weeks',
      startDate: '2024-03-01',
      badgeId: 'pro_league_participant_2024',
      requirements: {
        minLevel: 25,
        minGamesPlayed: 100
      }
    }
  },
  {
    name: 'VIP Spectator Pass - Championship Finals',
    description: 'Watch the championship finals in style with our VIP spectator pass. Includes exclusive viewing area, behind-the-scenes access, and championship merchandise.',
    price: 49.99,
    type: ProductType.TOURNAMENT_ITEM,
    category: 'Tournament Passes',
    imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    stock: null,
    metadata: {
      event: 'Tecno Gamerz Championship Finals 2024',
      type: 'vip_spectator_pass',
      benefits: [
        'VIP Viewing Area',
        'Behind-the-scenes Access',
        'Player Meet & Greet',
        'Exclusive Merchandise',
        'Premium Refreshments',
        'Certificate of Attendance',
        'Photo Opportunities'
      ],
      venue: 'Virtual Event + Select Cities',
      duration: '3 days',
      eventDate: '2024-04-15 to 2024-04-17',
      badgeId: 'vip_spectator_2024',
      includes_physical_items: true,
      merchandise_bundle: [
        'Championship T-shirt',
        'Commemorative Pin',
        'Event Poster',
        'Sticker Pack'
      ]
    }
  },

  // Bundle Deals
  {
    name: 'Ultimate Gamer Starter Pack',
    description: 'Everything you need to start your gaming journey! Includes digital cosmetics, physical merchandise, and exclusive tournament access. Perfect for new gamers.',
    price: 149.99,
    type: ProductType.DIGITAL_COSMETIC,
    category: 'Bundle Packs',
    imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=300&fit=crop',
    stock: null,
    metadata: {
      bundle: true,
      originalValue: 249.96,
      discount: '40% OFF',
      includes: [
        {
          type: 'digital',
          item: 'Space Explorer Suit',
          value: 24.99
        },
        {
          type: 'digital',
          item: 'Neon Pulse Sniper Rifle',
          value: 27.99
        },
        {
          type: 'digital',
          item: 'Gamer Elite Status Badge',
          value: 14.99
        },
        {
          type: 'physical',
          item: 'Tecno Gamerz Official T-Shirt',
          value: 24.99
        },
        {
          type: 'physical',
          item: 'Gaming Desk Pad XXL',
          value: 34.99
        },
        {
          type: 'tournament',
          item: 'Tournament Entry Credits',
          value: 50.00
        }
      ],
      badgeId: 'starter_pack_owner',
      cosmeticId: 'starter_pack_cosmetics',
      exclusive_benefits: [
        'Starter Pack Exclusive Badge',
        'Priority Customer Support',
        'Early Access to New Items',
        'Monthly Bonus Coins'
      ],
      valid_until: '2024-12-31'
    }
  },

  // Free Items (Price = 0)
  {
    name: 'Welcome Badge - New Member',
    description: 'Welcome to the Tecno Gamerz community! This free badge is our gift to all new members. Show your pride in being part of our gaming family.',
    price: 0,
    type: ProductType.DIGITAL_COSMETIC,
    category: 'Badges & Achievements',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=300&fit=crop',
    stock: null,
    metadata: {
      rarity: 'common',
      badgeId: 'welcome_new_member',
      free_item: true,
      auto_grant: true,
      effects: ['welcome_glow'],
      displayName: 'New Member',
      description: 'Welcome to Tecno Gamerz!',
      requirements: {
        accountAge: 0
      },
      previewUrl: 'https://example.com/previews/welcome-badge.png',
      releaseDate: '2024-01-01'
    }
  }
];

export async function seedProducts() {
  console.log('🛍️ Seeding merchant store products...');

  let createdCount = 0;
  let updatedCount = 0;

  for (const productData of sampleProducts) {
    try {
      // Check if product already exists by name
      const existingProduct = await prisma.product.findFirst({
        where: { name: productData.name },
      });

      if (existingProduct) {
        // Update existing product with new data
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            description: productData.description,
            price: productData.price,
            imageUrl: productData.imageUrl,
            stock: productData.stock,
            metadata: productData.metadata,
          },
        });
        updatedCount++;
      } else {
        // Create new product
        await prisma.product.create({
          data: productData,
        });
        createdCount++;
      }
    } catch (error) {
      console.error(`❌ Error seeding product "${productData.name}":`, error);
    }
  }

  console.log(`✅ Products seeded: ${createdCount} created, ${updatedCount} updated`);

  // Create some sample categories if they don't exist
  await seedProductCategories();
}

async function seedProductCategories() {
  console.log('📂 Seeding product categories...');

  const categories = [
    'Character Skins',
    'Weapon Skins',
    'Badges & Achievements',
    'Gaming Hardware',
    'Apparel',
    'Gaming Accessories',
    'Tournament Passes',
    'Bundle Packs'
  ];

  // Note: Categories are stored as strings in products, not separate entities
  // This function is for future enhancement if we add a categories table
  console.log(`✅ Categories available: ${categories.join(', ')}`);
}

// Utility function to get products by category
export async function getProductsByCategory(category: string) {
  return await prisma.product.findMany({
    where: {
      category,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// Utility function to get featured products (can be used for homepage)
export async function getFeaturedProducts(limit: number = 6) {
  return await prisma.product.findMany({
    where: {
      isActive: true,
      // You could add a 'featured' field to mark products as featured
    },
    orderBy: [
      { price: 'desc' }, // Show expensive items first as "premium"
      { createdAt: 'desc' },
    ],
    take: limit,
  });
}

// Utility function to get products by type
export async function getProductsByType(type: ProductType) {
  return await prisma.product.findMany({
    where: {
      type,
      isActive: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

// Utility function to create a sample order (for testing)
export async function createSampleOrder(userId: string) {
  // Get some random products for the order
  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { stock: { gt: 0 } }, // Physical items with stock
        { stock: null }, // Digital items
      ],
    },
    take: 3,
  });

  if (products.length === 0) {
    console.log('⚠️ No products available for sample order');
    return;
  }

  const totalAmount = products.reduce((sum, product) => sum + product.price, 0);

  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      status: 'PENDING',
      items: {
        createMany: {
          data: products.map(product => ({
            productId: product.id,
            quantity: 1,
            price: product.price,
          })),
        },
      },
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  console.log(`✅ Created sample order ${order.id} for user ${userId}`);
  return order;
}