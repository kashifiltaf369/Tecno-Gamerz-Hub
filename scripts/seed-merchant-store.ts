#!/usr/bin/env tsx

/**
 * Comprehensive Merchant Store Seeding Script
 * 
 * This script provides various seeding options for the merchant store system.
 * It can be run independently or as part of the main database seeding process.
 * 
 * Usage:
 *   npm run seed-store              # Seed products only
 *   npm run seed-store -- --all     # Seed everything (products + test data)
 *   npm run seed-store -- --reset   # Reset and re-seed
 *   npm run seed-store -- --test    # Test the merchant store flow
 *   npm run seed-store -- --stats   # Show current product statistics
 */

import { PrismaClient } from '@prisma/client';
import { 
  seedProducts, 
  getProductsByCategory, 
  getFeaturedProducts,
  getProductsByType 
} from '../prisma/seeds/products';
import { 
  getProductStats,
  cleanupProducts,
  resetProducts,
  seedTestData,
  seedTestScenarios,
  seedTransactionHistory,
  seedAll,
  testMerchantStoreFlow,
  restockPhysicalProducts
} from '../prisma/seeds/seed-utils';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  console.log('🏪 Tecno Gamerz Hub - Merchant Store Seeding Tool');
  console.log('================================================\n');

  try {
    if (args.includes('--help') || args.includes('-h')) {
      showHelp();
      return;
    }

    if (args.includes('--stats')) {
      await showStats();
      return;
    }

    if (args.includes('--test')) {
      const success = await testMerchantStoreFlow();
      process.exit(success ? 0 : 1);
      return;
    }

    if (args.includes('--reset')) {
      await resetProducts();
      return;
    }

    if (args.includes('--cleanup')) {
      await cleanupProducts();
      return;
    }

    if (args.includes('--restock')) {
      const stock = parseInt(args.find(arg => arg.startsWith('--stock='))?.split('=')[1] || '100');
      await restockPhysicalProducts(stock);
      return;
    }

    if (args.includes('--history')) {
      const days = parseInt(args.find(arg => arg.startsWith('--days='))?.split('=')[1] || '30');
      await seedTransactionHistory(days);
      return;
    }

    if (args.includes('--all')) {
      await seedAll();
      return;
    }

    if (args.includes('--test-data')) {
      await seedTestData();
      await seedTestScenarios();
      return;
    }

    // Default: seed products only
    console.log('🌱 Seeding merchant store products...');
    await seedProducts();
    
    console.log('\n📊 Seeding Summary:');
    await showStats();
    
    console.log('\n💡 Pro Tips:');
    console.log('  - Run with --all to include test data and scenarios');
    console.log('  - Use --test to verify the complete merchant store flow');
    console.log('  - Run --stats anytime to see current product statistics');
    console.log('  - Use --help to see all available options');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function showStats() {
  console.log('📊 Current Product Statistics');
  console.log('============================\n');

  const stats = await getProductStats();
  
  console.log('Product Breakdown:');
  console.log(`  📱 Digital Items: ${stats.products.digital}`);
  console.log(`  📦 Physical Items: ${stats.products.physical}`);
  console.log(`  🏆 Tournament Items: ${stats.products.tournament}`);
  console.log(`  📊 Total Products: ${stats.products.total}\n`);

  console.log('Categories:');
  for (const category of stats.categories) {
    const count = await prisma.product.count({
      where: { category, isActive: true }
    });
    console.log(`  📂 ${category}: ${count} items`);
  }

  console.log(`\nPrice Analysis:`);
  console.log(`  💰 Lowest Price: $${stats.priceRange.min}`);
  console.log(`  💎 Highest Price: $${stats.priceRange.max}`);
  console.log(`  📈 Average Price: $${stats.priceRange.average.toFixed(2)}`);

  // Show stock status for physical items
  const physicalProducts = await prisma.product.findMany({
    where: {
      type: 'PHYSICAL_MERCHANDISE',
      isActive: true,
    },
    select: {
      name: true,
      stock: true,
    },
  });

  if (physicalProducts.length > 0) {
    console.log(`\nStock Status:`);
    const outOfStock = physicalProducts.filter(p => p.stock === 0).length;
    const lowStock = physicalProducts.filter(p => p.stock && p.stock > 0 && p.stock < 10).length;
    const inStock = physicalProducts.filter(p => p.stock && p.stock >= 10).length;

    console.log(`  ❌ Out of Stock: ${outOfStock} items`);
    console.log(`  ⚠️  Low Stock (< 10): ${lowStock} items`);
    console.log(`  ✅ In Stock (≥ 10): ${inStock} items`);
  }

  // Show recent orders
  const recentOrders = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
  });

  console.log(`\nRecent Activity:`);
  console.log(`  📝 Orders (24h): ${recentOrders}`);

  const totalRevenue = await prisma.order.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { totalAmount: true },
  });

  console.log(`  💵 Total Revenue: $${(totalRevenue._sum.totalAmount || 0).toFixed(2)}`);
}

function showHelp() {
  console.log('Available Commands:');
  console.log('==================\n');
  
  console.log('Basic Operations:');
  console.log('  npm run seed-store                    # Seed products only');
  console.log('  npm run seed-store -- --all          # Comprehensive seeding (recommended)');
  console.log('  npm run seed-store -- --test-data    # Add test data and scenarios only');
  console.log('');
  
  console.log('Maintenance:');
  console.log('  npm run seed-store -- --reset        # Reset and re-seed everything');
  console.log('  npm run seed-store -- --cleanup      # Remove all products');
  console.log('  npm run seed-store -- --restock      # Restock physical items (default: 100)');
  console.log('  npm run seed-store -- --restock --stock=50  # Restock with custom amount');
  console.log('');
  
  console.log('Analytics & Testing:');
  console.log('  npm run seed-store -- --stats        # Show current statistics');
  console.log('  npm run seed-store -- --test         # Test merchant store flow');
  console.log('  npm run seed-store -- --history      # Generate transaction history (default: 30 days)');
  console.log('  npm run seed-store -- --history --days=7    # Custom history period');
  console.log('');
  
  console.log('What Gets Seeded:');
  console.log('  📱 Digital Cosmetics (skins, badges, weapon skins)');
  console.log('  📦 Physical Merchandise (hardware, apparel, accessories)');
  console.log('  🏆 Tournament Items (passes, VIP access)');
  console.log('  🎁 Bundle Deals and Free Items');
  console.log('  🧪 Test Scenarios (out of stock, premium items, etc.)');
  console.log('  📊 Sample Transaction History');
  console.log('');
  
  console.log('Product Categories:');
  console.log('  • Character Skins        • Gaming Hardware');
  console.log('  • Weapon Skins          • Apparel');
  console.log('  • Badges & Achievements  • Gaming Accessories');
  console.log('  • Tournament Passes      • Bundle Packs');
  console.log('');
  
  console.log('Examples:');
  console.log('  # Fresh start - recommended for new installations');
  console.log('  npm run seed-store -- --all');
  console.log('');
  console.log('  # Add test scenarios for development');
  console.log('  npm run seed-store -- --test-data');
  console.log('');
  console.log('  # Check what you have');
  console.log('  npm run seed-store -- --stats');
  console.log('');
  console.log('  # Verify everything works');
  console.log('  npm run seed-store -- --test');
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };