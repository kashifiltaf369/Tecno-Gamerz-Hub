import { PrismaClient, ProductType } from '@prisma/client';
import { seedProducts } from './products';

const prisma = new PrismaClient();

export interface SeedStats {
  products: {
    digital: number;
    physical: number;
    tournament: number;
    total: number;
  };
  categories: string[];
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
}

/**
 * Get comprehensive statistics about seeded products
 */
export async function getProductStats(): Promise<SeedStats> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
  });

  const digital = products.filter(p => p.type === ProductType.DIGITAL_COSMETIC).length;
  const physical = products.filter(p => p.type === ProductType.PHYSICAL_MERCHANDISE).length;
  const tournament = products.filter(p => p.type === ProductType.TOURNAMENT_ITEM).length;

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
  
  const prices = products.map(p => p.price).filter(p => p > 0);
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices),
    average: prices.reduce((sum, price) => sum + price, 0) / prices.length,
  };

  return {
    products: {
      digital,
      physical,
      tournament,
      total: products.length,
    },
    categories,
    priceRange,
  };
}

/**
 * Clean up all products (for re-seeding)
 */
export async function cleanupProducts() {
  console.log('🧹 Cleaning up existing products...');
  
  const deleteResult = await prisma.product.deleteMany({});
  console.log(`✅ Deleted ${deleteResult.count} products`);
}

/**
 * Reset and re-seed products
 */
export async function resetProducts() {
  await cleanupProducts();
  await seedProducts();
  
  const stats = await getProductStats();
  console.log('📊 Product seeding completed with stats:', stats);
}

/**
 * Seed additional test data for development
 */
export async function seedTestData() {
  console.log('🧪 Seeding additional test data...');

  // Create test user if needed
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@example.com',
      username: 'testuser',
      role: 'GAMER',
      status: 'ACTIVE',
    },
  });

  // Create sample orders for testing
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 5,
  });

  if (products.length > 0) {
    // Create a completed order
    const completedOrder = await prisma.order.create({
      data: {
        userId: testUser.id,
        status: 'COMPLETED',
        totalAmount: products.slice(0, 2).reduce((sum, p) => sum + p.price, 0),
        items: {
          createMany: {
            data: products.slice(0, 2).map(p => ({
              productId: p.id,
              quantity: 1,
              price: p.price,
            })),
          },
        },
      },
    });

    // Create a pending order
    const pendingOrder = await prisma.order.create({
      data: {
        userId: testUser.id,
        status: 'PENDING',
        totalAmount: products.slice(2, 4).reduce((sum, p) => sum + p.price, 0),
        stripeSessionId: 'cs_test_' + Date.now(),
        items: {
          createMany: {
            data: products.slice(2, 4).map(p => ({
              productId: p.id,
              quantity: 1,
              price: p.price,
            })),
          },
        },
      },
    });

    console.log(`✅ Created test orders: ${completedOrder.id} (completed), ${pendingOrder.id} (pending)`);
  }

  // Create purchases for digital items
  const digitalProducts = await prisma.product.findMany({
    where: {
      type: ProductType.DIGITAL_COSMETIC,
      isActive: true,
    },
    take: 3,
  });

  for (const product of digitalProducts) {
    await prisma.purchase.create({
      data: {
        userId: testUser.id,
        orderId: 'sample_order_' + product.id,
        productId: product.id,
        quantity: 1,
        totalAmount: product.price,
        type: product.type,
        fulfilledAt: new Date(),
        metadata: product.metadata,
      },
    });
  }

  console.log(`✅ Created ${digitalProducts.length} sample purchases for digital items`);
}

/**
 * Add stock to physical products (useful for testing stock management)
 */
export async function restockPhysicalProducts(defaultStock: number = 100) {
  console.log('📦 Restocking physical products...');

  const physicalProducts = await prisma.product.findMany({
    where: {
      type: ProductType.PHYSICAL_MERCHANDISE,
      isActive: true,
    },
  });

  for (const product of physicalProducts) {
    await prisma.product.update({
      where: { id: product.id },
      data: { stock: defaultStock },
    });
  }

  console.log(`✅ Restocked ${physicalProducts.length} physical products with ${defaultStock} units each`);
}

/**
 * Create products with specific test scenarios
 */
export async function seedTestScenarios() {
  console.log('🎭 Creating test scenario products...');

  const scenarios = [
    {
      name: 'Out of Stock Test Item',
      description: 'This item is specifically for testing out-of-stock scenarios.',
      price: 9.99,
      type: ProductType.PHYSICAL_MERCHANDISE,
      category: 'Test Items',
      imageUrl: 'https://via.placeholder.com/400x300?text=Out+of+Stock',
      stock: 0,
      metadata: { testScenario: 'out_of_stock' },
    },
    {
      name: 'Low Stock Warning Item',
      description: 'This item has low stock to test warning systems.',
      price: 19.99,
      type: ProductType.PHYSICAL_MERCHANDISE,
      category: 'Test Items',
      imageUrl: 'https://via.placeholder.com/400x300?text=Low+Stock',
      stock: 2,
      metadata: { testScenario: 'low_stock' },
    },
    {
      name: 'High Demand Digital Item',
      description: 'Popular digital item for testing high volume purchases.',
      price: 4.99,
      type: ProductType.DIGITAL_COSMETIC,
      category: 'Test Items',
      imageUrl: 'https://via.placeholder.com/400x300?text=High+Demand',
      stock: null,
      metadata: {
        testScenario: 'high_demand',
        badgeId: 'test_popular_badge',
        rarity: 'common',
      },
    },
    {
      name: 'Premium Test Bundle',
      description: 'Expensive bundle for testing high-value transactions.',
      price: 299.99,
      type: ProductType.DIGITAL_COSMETIC,
      category: 'Test Items',
      imageUrl: 'https://via.placeholder.com/400x300?text=Premium+Bundle',
      stock: null,
      metadata: {
        testScenario: 'premium_bundle',
        bundle: true,
        badgeId: 'test_premium_badge',
        cosmeticId: 'test_premium_cosmetics',
        rarity: 'legendary',
      },
    },
    {
      name: 'Free Test Sample',
      description: 'Free item for testing zero-price transactions.',
      price: 0,
      type: ProductType.DIGITAL_COSMETIC,
      category: 'Test Items',
      imageUrl: 'https://via.placeholder.com/400x300?text=Free+Sample',
      stock: null,
      metadata: {
        testScenario: 'free_item',
        badgeId: 'test_free_badge',
        rarity: 'common',
        free_item: true,
      },
    },
  ];

  let createdCount = 0;
  for (const scenario of scenarios) {
    const existingProduct = await prisma.product.findFirst({
      where: { name: scenario.name },
    });

    if (!existingProduct) {
      await prisma.product.create({ data: scenario });
      createdCount++;
    }
  }

  console.log(`✅ Created ${createdCount} test scenario products`);
}

/**
 * Generate realistic transaction history for testing analytics
 */
export async function seedTransactionHistory(days: number = 30) {
  console.log(`📈 Generating ${days} days of transaction history...`);

  const users = await prisma.user.findMany({ take: 10 });
  const products = await prisma.product.findMany({
    where: { isActive: true },
  });

  if (users.length === 0 || products.length === 0) {
    console.log('⚠️ Need users and products to generate transaction history');
    return;
  }

  let ordersCreated = 0;
  const now = new Date();

  for (let day = 0; day < days; day++) {
    const date = new Date(now.getTime() - day * 24 * 60 * 60 * 1000);
    
    // Generate 1-5 orders per day
    const ordersPerDay = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < ordersPerDay; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const numItems = Math.floor(Math.random() * 3) + 1; // 1-3 items per order
      const orderProducts = [];
      
      for (let j = 0; j < numItems; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        orderProducts.push(product);
      }
      
      const totalAmount = orderProducts.reduce((sum, p) => sum + p.price, 0);
      const status = Math.random() > 0.1 ? 'COMPLETED' : 'CANCELLED'; // 90% completion rate
      
      const order = await prisma.order.create({
        data: {
          userId: user.id,
          status,
          totalAmount,
          createdAt: date,
          updatedAt: date,
          items: {
            createMany: {
              data: orderProducts.map(p => ({
                productId: p.id,
                quantity: 1,
                price: p.price,
              })),
            },
          },
        },
      });

      // Create purchases for completed orders with digital items
      if (status === 'COMPLETED') {
        for (const product of orderProducts) {
          if (product.type === ProductType.DIGITAL_COSMETIC) {
            await prisma.purchase.create({
              data: {
                userId: user.id,
                orderId: order.id,
                productId: product.id,
                quantity: 1,
                totalAmount: product.price,
                type: product.type,
                fulfilledAt: date,
                metadata: product.metadata,
                createdAt: date,
              },
            });
          }
        }
      }

      ordersCreated++;
    }
  }

  console.log(`✅ Created ${ordersCreated} historical orders over ${days} days`);
}

/**
 * Main utility function to run all seeding operations
 */
export async function seedAll() {
  console.log('🌱 Running comprehensive merchant store seeding...');
  
  await seedProducts();
  await seedTestData();
  await seedTestScenarios();
  await seedTransactionHistory(7); // 1 week of history
  
  const stats = await getProductStats();
  
  console.log('\n📊 Final Seeding Statistics:');
  console.log(`  Products: ${stats.products.total} total`);
  console.log(`    - Digital: ${stats.products.digital}`);
  console.log(`    - Physical: ${stats.products.physical}`);
  console.log(`    - Tournament: ${stats.products.tournament}`);
  console.log(`  Categories: ${stats.categories.length} (${stats.categories.join(', ')})`);
  console.log(`  Price Range: $${stats.priceRange.min} - $${stats.priceRange.max}`);
  console.log(`  Average Price: $${stats.priceRange.average.toFixed(2)}`);
  console.log('\n✅ Comprehensive merchant store seeding completed!');
}

/**
 * Quick test to verify the merchant store works
 */
export async function testMerchantStoreFlow() {
  console.log('🧪 Testing merchant store flow...');

  try {
    // 1. Get products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      take: 3,
    });

    if (products.length === 0) {
      throw new Error('No products found');
    }

    console.log(`✅ Found ${products.length} products`);

    // 2. Create a test user
    const testUser = await prisma.user.upsert({
      where: { email: 'flow-test@example.com' },
      update: {},
      create: {
        name: 'Flow Test User',
        email: 'flow-test@example.com',
        username: 'flowtest',
        role: 'GAMER',
        status: 'ACTIVE',
      },
    });

    console.log(`✅ Test user created/found: ${testUser.id}`);

    // 3. Create an order
    const order = await prisma.order.create({
      data: {
        userId: testUser.id,
        status: 'PENDING',
        totalAmount: products[0].price,
        items: {
          create: {
            productId: products[0].id,
            quantity: 1,
            price: products[0].price,
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

    console.log(`✅ Order created: ${order.id}`);

    // 4. Complete the order
    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'COMPLETED' },
    });

    // 5. Create purchase for digital items
    if (products[0].type === ProductType.DIGITAL_COSMETIC) {
      await prisma.purchase.create({
        data: {
          userId: testUser.id,
          orderId: order.id,
          productId: products[0].id,
          quantity: 1,
          totalAmount: products[0].price,
          type: products[0].type,
          fulfilledAt: new Date(),
          metadata: products[0].metadata,
        },
      });

      console.log(`✅ Digital purchase fulfilled`);
    }

    console.log('✅ Merchant store flow test completed successfully!');
    return true;
  } catch (error) {
    console.error('❌ Merchant store flow test failed:', error);
    return false;
  }
}