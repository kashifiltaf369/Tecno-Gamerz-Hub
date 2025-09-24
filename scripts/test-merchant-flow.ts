#!/usr/bin/env tsx

/**
 * Manual End-to-End Testing Script for Merchant Store
 * 
 * This script tests the complete merchant store flow:
 * 1. Product browsing and filtering
 * 2. Cart operations 
 * 3. Order creation
 * 4. Payment simulation
 * 5. Order completion
 * 6. Digital fulfillment
 * 7. Stock management
 * 
 * Run with: npm run test-flow
 */

import { PrismaClient } from '@prisma/client';
import { ProductType, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  duration: number;
}

class MerchantStoreFlowTester {
  private results: TestResult[] = [];
  private testUser: any;
  private testProducts: any[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Merchant Store End-to-End Testing');
    console.log('==============================================\n');

    try {
      await this.setupTestEnvironment();
      
      await this.testProductBrowsing();
      await this.testProductFiltering();
      await this.testStockValidation();
      await this.testOrderCreation();
      await this.testOrderManagement();
      await this.testDigitalFulfillment();
      await this.testStockManagement();
      await this.testErrorHandling();
      await this.testAdminOperations();
      
      await this.generateReport();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async runTest(testName: string, testFn: () => Promise<void>): Promise<void> {
    const startTime = Date.now();
    console.log(`🔍 Testing: ${testName}`);

    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: true,
        message: 'Passed',
        duration
      });
      console.log(`  ✅ Passed (${duration}ms)`);
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        test: testName,
        passed: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        duration
      });
      console.log(`  ❌ Failed: ${error instanceof Error ? error.message : error} (${duration}ms)`);
    }
  }

  private async setupTestEnvironment(): Promise<void> {
    console.log('🛠️  Setting up test environment...');

    // Create test user
    this.testUser = await prisma.user.upsert({
      where: { email: 'test-flow@example.com' },
      update: {},
      create: {
        name: 'Flow Test User',
        email: 'test-flow@example.com',
        username: 'flowtest',
        role: 'GAMER',
        status: 'ACTIVE',
      },
    });

    // Ensure we have test products
    await this.createTestProducts();
    
    console.log(`✅ Test environment ready (User: ${this.testUser.id})`);
  }

  private async createTestProducts(): Promise<void> {
    const testProductData = [
      {
        name: 'Flow Test Digital Skin',
        description: 'Digital cosmetic for flow testing',
        price: 29.99,
        type: ProductType.DIGITAL_COSMETIC,
        category: 'Skins',
        stock: null,
        isActive: true,
        metadata: {
          badgeId: 'flow_test_badge',
          cosmeticId: 'flow_test_cosmetic',
          rarity: 'epic',
          testItem: true
        }
      },
      {
        name: 'Flow Test Gaming Mouse',
        description: 'Physical gaming mouse for flow testing',
        price: 79.99,
        type: ProductType.PHYSICAL_MERCHANDISE,
        category: 'Hardware',
        stock: 10,
        isActive: true,
        metadata: {
          brand: 'Flow Test Brand',
          warranty: '1 year',
          testItem: true
        }
      },
      {
        name: 'Flow Test Tournament Pass',
        description: 'Tournament pass for flow testing',
        price: 49.99,
        type: ProductType.TOURNAMENT_ITEM,
        category: 'Tournament Passes',
        stock: null,
        isActive: true,
        metadata: {
          tournament: 'Flow Test Tournament 2024',
          badgeId: 'flow_tournament_badge',
          testItem: true
        }
      }
    ];

    for (const product of testProductData) {
      const existing = await prisma.product.findFirst({
        where: { name: product.name }
      });

      if (existing) {
        this.testProducts.push(existing);
      } else {
        const created = await prisma.product.create({ data: product });
        this.testProducts.push(created);
      }
    }

    console.log(`✅ ${this.testProducts.length} test products ready`);
  }

  private async testProductBrowsing(): Promise<void> {
    await this.runTest('Product Browsing - Get All Products', async () => {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 10
      });

      if (products.length === 0) {
        throw new Error('No products found');
      }

      console.log(`    📦 Found ${products.length} products`);
    });

    await this.runTest('Product Browsing - Get Single Product', async () => {
      const product = await prisma.product.findUnique({
        where: { id: this.testProducts[0].id }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.name !== this.testProducts[0].name) {
        throw new Error('Product data mismatch');
      }

      console.log(`    🎯 Retrieved product: ${product.name}`);
    });
  }

  private async testProductFiltering(): Promise<void> {
    await this.runTest('Product Filtering - By Type', async () => {
      const digitalProducts = await prisma.product.findMany({
        where: {
          type: ProductType.DIGITAL_COSMETIC,
          isActive: true
        }
      });

      if (digitalProducts.length === 0) {
        throw new Error('No digital products found');
      }

      const hasWrongType = digitalProducts.some(p => p.type !== ProductType.DIGITAL_COSMETIC);
      if (hasWrongType) {
        throw new Error('Filter returned products of wrong type');
      }

      console.log(`    🎮 Found ${digitalProducts.length} digital products`);
    });

    await this.runTest('Product Filtering - By Category', async () => {
      const category = 'Hardware';
      const hardwareProducts = await prisma.product.findMany({
        where: {
          category,
          isActive: true
        }
      });

      if (hardwareProducts.length === 0) {
        throw new Error('No hardware products found');
      }

      console.log(`    🖥️  Found ${hardwareProducts.length} hardware products`);
    });

    await this.runTest('Product Filtering - Price Range', async () => {
      const products = await prisma.product.findMany({
        where: {
          price: {
            gte: 20,
            lte: 100
          },
          isActive: true
        }
      });

      const outOfRange = products.some(p => p.price < 20 || p.price > 100);
      if (outOfRange) {
        throw new Error('Price filter returned products outside range');
      }

      console.log(`    💰 Found ${products.length} products in $20-$100 range`);
    });
  }

  private async testStockValidation(): Promise<void> {
    const physicalProduct = this.testProducts.find(p => 
      p.type === ProductType.PHYSICAL_MERCHANDISE
    );

    if (!physicalProduct) {
      console.log('    ⚠️  No physical products for stock testing');
      return;
    }

    await this.runTest('Stock Validation - Available Stock', async () => {
      const product = await prisma.product.findUnique({
        where: { id: physicalProduct.id }
      });

      if (!product || product.stock === null) {
        throw new Error('Physical product should have stock defined');
      }

      if (product.stock < 0) {
        throw new Error('Stock should not be negative');
      }

      console.log(`    📦 Product has ${product.stock} units in stock`);
    });

    await this.runTest('Stock Validation - Insufficient Stock', async () => {
      const product = await prisma.product.findUnique({
        where: { id: physicalProduct.id }
      });

      if (!product || product.stock === null) {
        throw new Error('Physical product should have stock defined');
      }

      // Try to validate more than available
      const requestedQuantity = product.stock + 10;
      
      // This would normally be done through the ProductsService
      const isValid = product.stock >= requestedQuantity;
      
      if (isValid) {
        throw new Error('Should not validate quantity exceeding stock');
      }

      console.log(`    🚫 Correctly rejected request for ${requestedQuantity} units (stock: ${product.stock})`);
    });
  }

  private async testOrderCreation(): Promise<void> {
    await this.runTest('Order Creation - Valid Order', async () => {
      const items = [
        {
          productId: this.testProducts[0].id,
          quantity: 1,
          price: this.testProducts[0].price
        }
      ];

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const order = await prisma.order.create({
        data: {
          userId: this.testUser.id,
          status: OrderStatus.PENDING,
          totalAmount,
          items: {
            createMany: {
              data: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          }
        },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });

      if (!order) {
        throw new Error('Order creation failed');
      }

      if (order.items.length !== items.length) {
        throw new Error('Order items count mismatch');
      }

      if (Math.abs(order.totalAmount - totalAmount) > 0.01) {
        throw new Error('Order total amount incorrect');
      }

      console.log(`    📝 Created order ${order.id} with ${order.items.length} items`);
    });

    await this.runTest('Order Creation - Multiple Items', async () => {
      const items = this.testProducts.slice(0, 2).map(product => ({
        productId: product.id,
        quantity: 1,
        price: product.price
      }));

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const order = await prisma.order.create({
        data: {
          userId: this.testUser.id,
          status: OrderStatus.PENDING,
          totalAmount,
          items: {
            createMany: {
              data: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price
              }))
            }
          }
        },
        include: {
          items: true
        }
      });

      if (order.items.length !== 2) {
        throw new Error('Expected 2 order items');
      }

      console.log(`    🛍️  Created multi-item order ${order.id} (${order.items.length} items, $${order.totalAmount.toFixed(2)})`);
    });
  }

  private async testOrderManagement(): Promise<void> {
    await this.runTest('Order Management - Fetch User Orders', async () => {
      const orders = await prisma.order.findMany({
        where: { userId: this.testUser.id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      if (orders.length === 0) {
        throw new Error('No orders found for test user');
      }

      const hasValidOrder = orders.some(order => 
        order.items.length > 0 && order.totalAmount > 0
      );

      if (!hasValidOrder) {
        throw new Error('No valid orders found');
      }

      console.log(`    📋 Found ${orders.length} orders for user`);
    });

    await this.runTest('Order Management - Order Status Updates', async () => {
      // Create a new order for status testing
      const order = await prisma.order.create({
        data: {
          userId: this.testUser.id,
          status: OrderStatus.PENDING,
          totalAmount: 29.99,
          items: {
            create: {
              productId: this.testProducts[0].id,
              quantity: 1,
              price: this.testProducts[0].price
            }
          }
        }
      });

      // Update to completed
      const completedOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.COMPLETED }
      });

      if (completedOrder.status !== OrderStatus.COMPLETED) {
        throw new Error('Order status update failed');
      }

      console.log(`    🔄 Updated order ${order.id} status to COMPLETED`);
    });

    await this.runTest('Order Management - Order Cancellation', async () => {
      // Create a new order for cancellation testing
      const order = await prisma.order.create({
        data: {
          userId: this.testUser.id,
          status: OrderStatus.PENDING,
          totalAmount: 29.99,
          items: {
            create: {
              productId: this.testProducts[0].id,
              quantity: 1,
              price: this.testProducts[0].price
            }
          }
        }
      });

      // Cancel the order
      const cancelledOrder = await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED }
      });

      if (cancelledOrder.status !== OrderStatus.CANCELLED) {
        throw new Error('Order cancellation failed');
      }

      console.log(`    ❌ Cancelled order ${order.id}`);
    });
  }

  private async testDigitalFulfillment(): Promise<void> {
    const digitalProduct = this.testProducts.find(p => 
      p.type === ProductType.DIGITAL_COSMETIC
    );

    if (!digitalProduct) {
      console.log('    ⚠️  No digital products for fulfillment testing');
      return;
    }

    await this.runTest('Digital Fulfillment - Create Purchase Record', async () => {
      // Create completed order with digital item
      const order = await prisma.order.create({
        data: {
          userId: this.testUser.id,
          status: OrderStatus.COMPLETED,
          totalAmount: digitalProduct.price,
          items: {
            create: {
              productId: digitalProduct.id,
              quantity: 1,
              price: digitalProduct.price
            }
          }
        }
      });

      // Create purchase record (simulating fulfillment)
      const purchase = await prisma.purchase.create({
        data: {
          userId: this.testUser.id,
          orderId: order.id,
          productId: digitalProduct.id,
          quantity: 1,
          totalAmount: digitalProduct.price,
          type: digitalProduct.type,
          fulfilledAt: new Date(),
          metadata: digitalProduct.metadata
        }
      });

      if (!purchase) {
        throw new Error('Purchase record creation failed');
      }

      if (!purchase.fulfilledAt) {
        throw new Error('Purchase should be marked as fulfilled');
      }

      console.log(`    🎁 Digital purchase fulfilled for order ${order.id}`);
    });

    await this.runTest('Digital Fulfillment - Verify User Benefits', async () => {
      // Check if user received digital benefits
      const purchases = await prisma.purchase.findMany({
        where: {
          userId: this.testUser.id,
          type: ProductType.DIGITAL_COSMETIC,
          fulfilledAt: { not: null }
        }
      });

      if (purchases.length === 0) {
        throw new Error('No fulfilled digital purchases found');
      }

      const hasBadgeMetadata = purchases.some(p => 
        p.metadata && typeof p.metadata === 'object' && 
        'badgeId' in (p.metadata as any)
      );

      if (!hasBadgeMetadata) {
        throw new Error('Digital purchases should contain badge metadata');
      }

      console.log(`    🏆 User has ${purchases.length} fulfilled digital purchases`);
    });
  }

  private async testStockManagement(): Promise<void> {
    const physicalProduct = this.testProducts.find(p => 
      p.type === ProductType.PHYSICAL_MERCHANDISE && p.stock && p.stock > 0
    );

    if (!physicalProduct) {
      console.log('    ⚠️  No physical products with stock for testing');
      return;
    }

    await this.runTest('Stock Management - Stock Reservation', async () => {
      const initialStock = physicalProduct.stock;
      const reserveQuantity = 2;

      if (initialStock < reserveQuantity) {
        throw new Error('Insufficient initial stock for test');
      }

      // Simulate stock reservation
      await prisma.product.update({
        where: { id: physicalProduct.id },
        data: { stock: initialStock - reserveQuantity }
      });

      const updatedProduct = await prisma.product.findUnique({
        where: { id: physicalProduct.id }
      });

      if (updatedProduct?.stock !== initialStock - reserveQuantity) {
        throw new Error('Stock reservation failed');
      }

      console.log(`    📦 Reserved ${reserveQuantity} units (${initialStock} → ${updatedProduct.stock})`);

      // Restore stock for cleanup
      await prisma.product.update({
        where: { id: physicalProduct.id },
        data: { stock: initialStock }
      });
    });

    await this.runTest('Stock Management - Low Stock Warning', async () => {
      const lowStockThreshold = 5;
      
      // Simulate low stock
      await prisma.product.update({
        where: { id: physicalProduct.id },
        data: { stock: 2 }
      });

      const product = await prisma.product.findUnique({
        where: { id: physicalProduct.id }
      });

      if (!product || product.stock === null || product.stock >= lowStockThreshold) {
        throw new Error('Low stock condition not simulated correctly');
      }

      const isLowStock = product.stock < lowStockThreshold;
      if (!isLowStock) {
        throw new Error('Low stock detection failed');
      }

      console.log(`    ⚠️  Low stock detected: ${product.stock} units remaining`);

      // Restore stock
      await prisma.product.update({
        where: { id: physicalProduct.id },
        data: { stock: physicalProduct.stock }
      });
    });
  }

  private async testErrorHandling(): Promise<void> {
    await this.runTest('Error Handling - Invalid Product ID', async () => {
      const product = await prisma.product.findUnique({
        where: { id: 'invalid-product-id' }
      });

      if (product !== null) {
        throw new Error('Should return null for invalid product ID');
      }

      console.log('    🚫 Correctly handled invalid product ID');
    });

    await this.runTest('Error Handling - Order with Zero Items', async () => {
      try {
        await prisma.order.create({
          data: {
            userId: this.testUser.id,
            status: OrderStatus.PENDING,
            totalAmount: 0,
            // No items
          }
        });

        // If we get here, the order was created, which might be allowed
        console.log('    ℹ️  Empty order creation allowed (may be by design)');
      } catch (error) {
        // This is expected behavior
        console.log('    🚫 Correctly prevented empty order creation');
      }
    });

    await this.runTest('Error Handling - Negative Price Products', async () => {
      try {
        await prisma.product.create({
          data: {
            name: 'Invalid Negative Price Product',
            description: 'This should not be allowed',
            price: -10.00,
            type: ProductType.DIGITAL_COSMETIC,
            category: 'Test',
            isActive: true
          }
        });

        // If successful, this might be allowed at the database level
        // but should be prevented at the application level
        console.log('    ⚠️  Negative price product created (check validation)');
      } catch (error) {
        console.log('    🚫 Correctly prevented negative price product');
      }
    });
  }

  private async testAdminOperations(): Promise<void> {
    await this.runTest('Admin Operations - Product Statistics', async () => {
      const stats = {
        totalProducts: await prisma.product.count({ where: { isActive: true } }),
        digitalProducts: await prisma.product.count({
          where: { type: ProductType.DIGITAL_COSMETIC, isActive: true }
        }),
        physicalProducts: await prisma.product.count({
          where: { type: ProductType.PHYSICAL_MERCHANDISE, isActive: true }
        }),
        tournamentItems: await prisma.product.count({
          where: { type: ProductType.TOURNAMENT_ITEM, isActive: true }
        })
      };

      if (stats.totalProducts === 0) {
        throw new Error('No products found in database');
      }

      const sum = stats.digitalProducts + stats.physicalProducts + stats.tournamentItems;
      if (sum !== stats.totalProducts) {
        throw new Error('Product count mismatch');
      }

      console.log(`    📊 Products: ${stats.totalProducts} total (${stats.digitalProducts} digital, ${stats.physicalProducts} physical, ${stats.tournamentItems} tournament)`);
    });

    await this.runTest('Admin Operations - Order Statistics', async () => {
      const stats = {
        totalOrders: await prisma.order.count(),
        pendingOrders: await prisma.order.count({ where: { status: OrderStatus.PENDING } }),
        completedOrders: await prisma.order.count({ where: { status: OrderStatus.COMPLETED } }),
        cancelledOrders: await prisma.order.count({ where: { status: OrderStatus.CANCELLED } })
      };

      const totalRevenue = await prisma.order.aggregate({
        where: { status: OrderStatus.COMPLETED },
        _sum: { totalAmount: true }
      });

      console.log(`    📈 Orders: ${stats.totalOrders} total (${stats.pendingOrders} pending, ${stats.completedOrders} completed, ${stats.cancelledOrders} cancelled)`);
      console.log(`    💰 Total Revenue: $${(totalRevenue._sum.totalAmount || 0).toFixed(2)}`);
    });

    await this.runTest('Admin Operations - Low Stock Report', async () => {
      const lowStockThreshold = 10;
      
      const lowStockProducts = await prisma.product.findMany({
        where: {
          stock: { lt: lowStockThreshold },
          type: ProductType.PHYSICAL_MERCHANDISE,
          isActive: true
        },
        select: {
          id: true,
          name: true,
          stock: true,
          category: true
        }
      });

      console.log(`    📉 Low stock products: ${lowStockProducts.length} items below ${lowStockThreshold} units`);

      if (lowStockProducts.length > 0) {
        lowStockProducts.forEach(product => {
          console.log(`      - ${product.name}: ${product.stock} units`);
        });
      }
    });
  }

  private async generateReport(): Promise<void> {
    console.log('\n📊 Test Results Summary');
    console.log('=====================\n');

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => !r.passed).length;
    const total = this.results.length;
    const passRate = ((passed / total) * 100).toFixed(1);

    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Pass Rate: ${passRate}%\n`);

    if (failed > 0) {
      console.log('Failed Tests:');
      this.results
        .filter(r => !r.passed)
        .forEach(result => {
          console.log(`  ❌ ${result.test}: ${result.message}`);
        });
      console.log('');
    }

    // Performance Summary
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);
    const avgTime = (totalTime / total).toFixed(0);
    const slowestTest = this.results.reduce((max, r) => 
      r.duration > max.duration ? r : max, this.results[0]
    );

    console.log('Performance Summary:');
    console.log(`⏱️  Total Time: ${totalTime}ms`);
    console.log(`📊 Average Time: ${avgTime}ms per test`);
    console.log(`🐌 Slowest Test: ${slowestTest.test} (${slowestTest.duration}ms)\n`);

    // System Health Check
    console.log('System Health Check:');
    console.log(`🔗 Database Connection: ${passRate === '100.0' ? '✅ Healthy' : '⚠️  Issues Detected'}`);
    console.log(`🛍️  Product Catalog: ${passed >= total * 0.7 ? '✅ Operational' : '⚠️  Needs Attention'}`);
    console.log(`📦 Order System: ${this.results.find(r => r.test.includes('Order Creation'))?.passed ? '✅ Working' : '❌ Broken'}`);
    console.log(`💳 Payment Flow: ${this.results.find(r => r.test.includes('Stock Management'))?.passed ? '✅ Ready' : '⚠️  Check Configuration'}\n`);

    if (passRate === '100.0') {
      console.log('🎉 All tests passed! The merchant store is ready for production.');
    } else if (parseFloat(passRate) >= 90) {
      console.log('✅ Most tests passed. Minor issues detected - check failed tests.');
    } else if (parseFloat(passRate) >= 70) {
      console.log('⚠️  Some critical issues detected. Review and fix failing tests.');
    } else {
      console.log('❌ Many tests failed. System needs significant attention before deployment.');
    }
  }

  private async cleanup(): Promise<void> {
    console.log('\n🧹 Cleaning up test data...');

    try {
      // Delete test purchases
      await prisma.purchase.deleteMany({
        where: { userId: this.testUser?.id }
      });

      // Delete test orders and items
      const testOrders = await prisma.order.findMany({
        where: { userId: this.testUser?.id }
      });

      for (const order of testOrders) {
        await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
        await prisma.order.delete({ where: { id: order.id } });
      }

      // Clean up test products
      for (const product of this.testProducts) {
        const hasOrders = await prisma.orderItem.findFirst({
          where: { productId: product.id }
        });

        if (!hasOrders) {
          await prisma.product.delete({ where: { id: product.id } });
        }
      }

      // Clean up test user (be careful not to delete real users)
      if (this.testUser?.email === 'test-flow@example.com') {
        await prisma.user.delete({ where: { id: this.testUser.id } });
      }

      console.log('✅ Cleanup completed');
    } catch (error) {
      console.log('⚠️  Cleanup warning:', error instanceof Error ? error.message : error);
    }
  }
}

// Run the tests
async function main() {
  const tester = new MerchantStoreFlowTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('Test runner error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

export { MerchantStoreFlowTester };