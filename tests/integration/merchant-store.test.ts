/**
 * Comprehensive Integration Tests for Merchant Store System
 * 
 * Tests the complete flow from product browsing to purchase completion
 * including payment processing, digital fulfillment, and inventory management.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from '../../apps/api/src/prisma/prisma.service';
import { ProductsService } from '../../apps/api/src/products/products.service';
import { OrdersService } from '../../apps/api/src/orders/orders.service';
import { PaymentsService } from '../../apps/api/src/payments/payments.service';
import { UsersService } from '../../apps/api/src/users/users.service';
import { ProductType, OrderStatus } from '@prisma/client';
import * as request from 'supertest';

describe('Merchant Store Integration Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let productsService: ProductsService;
  let ordersService: OrdersService;
  let paymentsService: PaymentsService;
  let usersService: UsersService;

  let testUser: any;
  let adminUser: any;
  let testProducts: any[] = [];
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      // Import your actual modules here
      // imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
    productsService = moduleFixture.get<ProductsService>(ProductsService);
    ordersService = moduleFixture.get<OrdersService>(OrdersService);
    paymentsService = moduleFixture.get<PaymentsService>(PaymentsService);
    usersService = moduleFixture.get<UsersService>(UsersService);

    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  describe('1. Product Browsing & Management', () => {
    it('should fetch all products with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('products');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('currentPage', 1);
      expect(Array.isArray(response.body.products)).toBe(true);
    });

    it('should filter products by type', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .query({ type: ProductType.DIGITAL_COSMETIC })
        .expect(200);

      expect(response.body.products.every((p: any) => 
        p.type === ProductType.DIGITAL_COSMETIC
      )).toBe(true);
    });

    it('should search products by name and description', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .query({ search: 'gaming' })
        .expect(200);

      const products = response.body.products;
      expect(products.some((p: any) => 
        p.name.toLowerCase().includes('gaming') || 
        p.description.toLowerCase().includes('gaming')
      )).toBe(true);
    });

    it('should get a single product by ID', async () => {
      const product = testProducts[0];
      
      const response = await request(app.getHttpServer())
        .get(`/api/products/${product.id}`)
        .expect(200);

      expect(response.body.id).toBe(product.id);
      expect(response.body.name).toBe(product.name);
      expect(response.body.price).toBe(product.price);
    });

    it('should return 404 for non-existent product', async () => {
      await request(app.getHttpServer())
        .get('/api/products/non-existent-id')
        .expect(404);
    });

    it('should allow admin to create a product', async () => {
      const newProduct = {
        name: 'Test Admin Product',
        description: 'Created by admin for testing',
        price: 29.99,
        type: ProductType.DIGITAL_COSMETIC,
        category: 'Test Items',
        metadata: { testItem: true }
      };

      const response = await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newProduct)
        .expect(201);

      expect(response.body.name).toBe(newProduct.name);
      expect(response.body.price).toBe(newProduct.price);
      expect(response.body.isActive).toBe(true);
    });

    it('should prevent non-admin from creating products', async () => {
      const newProduct = {
        name: 'Unauthorized Product',
        description: 'Should not be created',
        price: 19.99,
        type: ProductType.DIGITAL_COSMETIC,
        category: 'Test Items'
      };

      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newProduct)
        .expect(403);
    });

    it('should validate product creation data', async () => {
      const invalidProduct = {
        name: '', // Empty name
        price: -10, // Negative price
        type: 'INVALID_TYPE',
      };

      await request(app.getHttpServer())
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProduct)
        .expect(400);
    });
  });

  describe('2. Shopping Cart & Stock Validation', () => {
    it('should validate stock for physical products', async () => {
      const physicalProduct = testProducts.find(p => 
        p.type === ProductType.PHYSICAL_MERCHANDISE
      );

      if (physicalProduct) {
        const isValid = await productsService.validateStock(
          physicalProduct.id, 
          physicalProduct.stock + 1 // Try to order more than available
        );

        expect(isValid).toBe(false);
      }
    });

    it('should allow unlimited digital product orders', async () => {
      const digitalProduct = testProducts.find(p => 
        p.type === ProductType.DIGITAL_COSMETIC
      );

      if (digitalProduct) {
        const isValid = await productsService.validateStock(
          digitalProduct.id, 
          999999 // Large quantity
        );

        expect(isValid).toBe(true);
      }
    });
  });

  describe('3. Order Creation & Payment Flow', () => {
    it('should create order with valid products', async () => {
      const orderData = {
        items: [
          {
            productId: testProducts[0].id,
            quantity: 1
          },
          {
            productId: testProducts[1].id,
            quantity: 2
          }
        ]
      };

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('order');
      expect(response.body).toHaveProperty('checkoutUrl');
      expect(response.body.order.status).toBe(OrderStatus.PENDING);
      expect(response.body.order.items).toHaveLength(2);

      // Verify total amount calculation
      const expectedTotal = testProducts[0].price + (testProducts[1].price * 2);
      expect(response.body.order.totalAmount).toBeCloseTo(expectedTotal, 2);
    });

    it('should prevent ordering out-of-stock products', async () => {
      // Create a product with no stock
      const outOfStockProduct = await prisma.product.create({
        data: {
          name: 'Out of Stock Test Product',
          description: 'This product has no stock',
          price: 19.99,
          type: ProductType.PHYSICAL_MERCHANDISE,
          category: 'Test Items',
          stock: 0,
          isActive: true
        }
      });

      const orderData = {
        items: [{
          productId: outOfStockProduct.id,
          quantity: 1
        }]
      };

      await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(400);

      // Cleanup
      await prisma.product.delete({ where: { id: outOfStockProduct.id } });
    });

    it('should prevent ordering inactive products', async () => {
      // Create an inactive product
      const inactiveProduct = await prisma.product.create({
        data: {
          name: 'Inactive Test Product',
          description: 'This product is inactive',
          price: 19.99,
          type: ProductType.DIGITAL_COSMETIC,
          category: 'Test Items',
          stock: null,
          isActive: false
        }
      });

      const orderData = {
        items: [{
          productId: inactiveProduct.id,
          quantity: 1
        }]
      };

      await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(400);

      // Cleanup
      await prisma.product.delete({ where: { id: inactiveProduct.id } });
    });

    it('should require authentication for order creation', async () => {
      const orderData = {
        items: [{
          productId: testProducts[0].id,
          quantity: 1
        }]
      };

      await request(app.getHttpServer())
        .post('/api/orders')
        .send(orderData)
        .expect(401);
    });

    it('should validate order items structure', async () => {
      const invalidOrderData = {
        items: [] // Empty items array
      };

      await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidOrderData)
        .expect(400);
    });
  });

  describe('4. Order Management', () => {
    let testOrder: any;

    beforeEach(async () => {
      // Create a test order
      const orderData = {
        items: [{
          productId: testProducts[0].id,
          quantity: 1
        }]
      };

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData);

      testOrder = response.body.order;
    });

    it('should fetch user orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.orders)).toBe(true);
      
      // Should include our test order
      const orderIds = response.body.orders.map((o: any) => o.id);
      expect(orderIds).toContain(testOrder.id);
    });

    it('should fetch single order by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/orders/${testOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testOrder.id);
      expect(response.body.items).toHaveLength(1);
      expect(response.body.items[0]).toHaveProperty('product');
    });

    it('should prevent users from viewing others orders', async () => {
      // Create another user and their order
      const otherUser = await prisma.user.create({
        data: {
          name: 'Other User',
          email: 'other@example.com',
          username: 'otheruser',
          role: 'GAMER',
          status: 'ACTIVE'
        }
      });

      const otherOrder = await prisma.order.create({
        data: {
          userId: otherUser.id,
          status: OrderStatus.PENDING,
          totalAmount: 29.99,
          items: {
            create: {
              productId: testProducts[0].id,
              quantity: 1,
              price: testProducts[0].price
            }
          }
        }
      });

      // Try to access other user's order
      await request(app.getHttpServer())
        .get(`/api/orders/${otherOrder.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404); // Should not find order for different user

      // Cleanup
      await prisma.orderItem.deleteMany({ where: { orderId: otherOrder.id } });
      await prisma.order.delete({ where: { id: otherOrder.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    });

    it('should allow order cancellation', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/orders/${testOrder.id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.status).toBe(OrderStatus.CANCELLED);
    });
  });

  describe('5. Digital Fulfillment', () => {
    it('should fulfill digital goods on order completion', async () => {
      // Create order with digital product
      const digitalProduct = testProducts.find(p => 
        p.type === ProductType.DIGITAL_COSMETIC && 
        p.metadata?.badgeId
      );

      if (!digitalProduct) {
        console.log('No digital product with badgeId found, skipping test');
        return;
      }

      const order = await ordersService.create(testUser.id, {
        items: [{
          productId: digitalProduct.id,
          quantity: 1
        }]
      });

      // Complete the order
      const completedOrder = await ordersService.completeOrder(order.order.id);

      expect(completedOrder.status).toBe(OrderStatus.COMPLETED);

      // Verify purchase record was created
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: testUser.id,
          orderId: order.order.id,
          productId: digitalProduct.id
        }
      });

      expect(purchase).toBeTruthy();
      expect(purchase?.fulfilledAt).toBeTruthy();
    });

    it('should not fulfill digital goods for cancelled orders', async () => {
      const digitalProduct = testProducts.find(p => 
        p.type === ProductType.DIGITAL_COSMETIC
      );

      if (!digitalProduct) return;

      const order = await ordersService.create(testUser.id, {
        items: [{
          productId: digitalProduct.id,
          quantity: 1
        }]
      });

      // Cancel the order
      await ordersService.cancelOrder(order.order.id);

      // Verify no purchase record was created
      const purchase = await prisma.purchase.findFirst({
        where: {
          userId: testUser.id,
          orderId: order.order.id,
          productId: digitalProduct.id
        }
      });

      expect(purchase).toBeFalsy();
    });
  });

  describe('6. Stock Management', () => {
    it('should reserve stock on order creation', async () => {
      const physicalProduct = testProducts.find(p => 
        p.type === ProductType.PHYSICAL_MERCHANDISE && p.stock > 0
      );

      if (!physicalProduct) return;

      const initialStock = physicalProduct.stock;
      const orderQuantity = 2;

      // Create order
      await ordersService.create(testUser.id, {
        items: [{
          productId: physicalProduct.id,
          quantity: orderQuantity
        }]
      });

      // Check stock was reserved
      const updatedProduct = await prisma.product.findUnique({
        where: { id: physicalProduct.id }
      });

      expect(updatedProduct?.stock).toBe(initialStock - orderQuantity);
    });

    it('should restore stock on order cancellation', async () => {
      const physicalProduct = testProducts.find(p => 
        p.type === ProductType.PHYSICAL_MERCHANDISE && p.stock > 2
      );

      if (!physicalProduct) return;

      const initialStock = physicalProduct.stock;
      const orderQuantity = 2;

      // Create order
      const order = await ordersService.create(testUser.id, {
        items: [{
          productId: physicalProduct.id,
          quantity: orderQuantity
        }]
      });

      // Cancel order
      await ordersService.cancelOrder(order.order.id);

      // Check stock was restored
      const updatedProduct = await prisma.product.findUnique({
        where: { id: physicalProduct.id }
      });

      expect(updatedProduct?.stock).toBe(initialStock);
    });

    it('should handle bulk stock operations', async () => {
      const physicalProducts = testProducts.filter(p => 
        p.type === ProductType.PHYSICAL_MERCHANDISE && p.stock > 0
      ).slice(0, 2);

      if (physicalProducts.length < 2) return;

      const items = physicalProducts.map(p => ({
        productId: p.id,
        quantity: 1
      }));

      // Test bulk reserve
      await productsService.bulkReserveStock(items);

      // Verify stock was reduced
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        expect(product?.stock).toBeLessThan(
          physicalProducts.find(p => p.id === item.productId)?.stock || 0
        );
      }

      // Test bulk restore
      await productsService.bulkRestoreStock(items);

      // Verify stock was restored
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        expect(product?.stock).toBe(
          physicalProducts.find(p => p.id === item.productId)?.stock
        );
      }
    });
  });

  describe('7. Error Handling & Edge Cases', () => {
    it('should handle database connection errors gracefully', async () => {
      // This would require mocking the database connection
      // Implementation depends on your specific setup
    });

    it('should handle payment provider errors', async () => {
      // Mock Stripe failure
      jest.spyOn(paymentsService, 'createCheckoutSession')
        .mockRejectedValueOnce(new Error('Stripe API Error'));

      const orderData = {
        items: [{
          productId: testProducts[0].id,
          quantity: 1
        }]
      };

      await request(app.getHttpServer())
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send(orderData)
        .expect(500);
    });

    it('should handle concurrent stock operations', async () => {
      const physicalProduct = testProducts.find(p => 
        p.type === ProductType.PHYSICAL_MERCHANDISE && p.stock > 0
      );

      if (!physicalProduct) return;

      // Simulate concurrent orders
      const concurrentOrders = Array.from({ length: 5 }, () =>
        ordersService.create(testUser.id, {
          items: [{
            productId: physicalProduct.id,
            quantity: 1
          }]
        })
      );

      const results = await Promise.allSettled(concurrentOrders);
      
      // Some should succeed, some might fail due to insufficient stock
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      expect(successful + failed).toBe(5);
      expect(successful).toBeGreaterThan(0);
    });
  });

  describe('8. Admin Operations', () => {
    it('should allow admin to view all orders', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('orders');
      expect(response.body).toHaveProperty('total');
    });

    it('should provide order statistics for admin', async () => {
      const stats = await ordersService.getOrderStats();

      expect(stats).toHaveProperty('totalOrders');
      expect(stats).toHaveProperty('completedOrders');
      expect(stats).toHaveProperty('pendingOrders');
      expect(stats).toHaveProperty('cancelledOrders');
      expect(stats).toHaveProperty('totalRevenue');
    });

    it('should prevent non-admin from accessing admin endpoints', async () => {
      await request(app.getHttpServer())
        .get('/api/orders/admin/all')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);
    });
  });

  // Helper functions
  async function setupTestData() {
    // Create test users
    testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        username: 'testuser',
        role: 'GAMER',
        status: 'ACTIVE'
      }
    });

    adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@example.com',
        username: 'adminuser',
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    });

    // Generate auth tokens (implement according to your auth system)
    authToken = 'mock-user-token';
    adminToken = 'mock-admin-token';

    // Create test products
    const productData = [
      {
        name: 'Test Digital Skin',
        description: 'A test digital cosmetic skin',
        price: 29.99,
        type: ProductType.DIGITAL_COSMETIC,
        category: 'Skins',
        stock: null,
        isActive: true,
        metadata: {
          badgeId: 'test_badge',
          cosmeticId: 'test_cosmetic',
          rarity: 'epic'
        }
      },
      {
        name: 'Test Gaming Headset',
        description: 'A test gaming headset',
        price: 199.99,
        type: ProductType.PHYSICAL_MERCHANDISE,
        category: 'Hardware',
        stock: 50,
        isActive: true,
        metadata: {
          brand: 'Test Brand',
          warranty: '2 years'
        }
      },
      {
        name: 'Test Tournament Pass',
        description: 'A test tournament entry pass',
        price: 99.99,
        type: ProductType.TOURNAMENT_ITEM,
        category: 'Tournament Passes',
        stock: null,
        isActive: true,
        metadata: {
          tournament: 'Test Tournament 2024',
          badgeId: 'test_tournament_badge'
        }
      }
    ];

    for (const product of productData) {
      const createdProduct = await prisma.product.create({ data: product });
      testProducts.push(createdProduct);
    }
  }

  async function cleanupTestData() {
    // Clean up in reverse order of creation to handle foreign key constraints
    
    // Delete purchases
    await prisma.purchase.deleteMany({
      where: {
        userId: { in: [testUser?.id, adminUser?.id] }
      }
    });

    // Delete order items and orders
    const orders = await prisma.order.findMany({
      where: {
        userId: { in: [testUser?.id, adminUser?.id] }
      }
    });

    for (const order of orders) {
      await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
      await prisma.order.delete({ where: { id: order.id } });
    }

    // Delete test products
    for (const product of testProducts) {
      await prisma.product.delete({ where: { id: product.id } });
    }

    // Delete test users
    if (testUser?.id) {
      await prisma.user.delete({ where: { id: testUser.id } });
    }
    if (adminUser?.id) {
      await prisma.user.delete({ where: { id: adminUser.id } });
    }
  }
});

/**
 * Performance Tests
 */
describe('Merchant Store Performance Tests', () => {
  it('should handle high concurrent product requests', async () => {
    const startTime = Date.now();
    
    const promises = Array.from({ length: 100 }, () =>
      request(app.getHttpServer()).get('/api/products')
    );

    const results = await Promise.all(promises);
    const endTime = Date.now();

    // All requests should succeed
    results.forEach(result => {
      expect(result.status).toBe(200);
    });

    // Should complete within reasonable time (adjust as needed)
    expect(endTime - startTime).toBeLessThan(10000); // 10 seconds
  });

  it('should handle large product catalogs efficiently', async () => {
    // This test would require a large dataset
    // Implementation depends on your performance requirements
  });
});

/**
 * Security Tests
 */
describe('Merchant Store Security Tests', () => {
  it('should prevent SQL injection in search queries', async () => {
    const maliciousQuery = "'; DROP TABLE products; --";
    
    const response = await request(app.getHttpServer())
      .get('/api/products')
      .query({ search: maliciousQuery })
      .expect(200); // Should not crash, should return safe results

    expect(response.body.products).toBeDefined();
  });

  it('should sanitize product creation inputs', async () => {
    const maliciousProduct = {
      name: '<script>alert("xss")</script>',
      description: 'javascript:alert("xss")',
      price: 29.99,
      type: ProductType.DIGITAL_COSMETIC,
      category: 'Test'
    };

    const response = await request(app.getHttpServer())
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(maliciousProduct)
      .expect(201);

    // Should not contain script tags
    expect(response.body.name).not.toContain('<script>');
    expect(response.body.description).not.toContain('javascript:');
  });

  it('should prevent unauthorized price modifications', async () => {
    // Implementation would depend on your specific authorization logic
  });
});