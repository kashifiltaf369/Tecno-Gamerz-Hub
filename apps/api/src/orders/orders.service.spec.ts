import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { PaymentsService } from '../payments/payments.service';
import { UsersService } from '../users/users.service';
import { OrderStatus, ProductType, PaymentType, PaymentStatus } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: PrismaService;
  let productsService: ProductsService;
  let paymentsService: PaymentsService;
  let usersService: UsersService;

  const mockUser = {
    id: 'user_1',
    email: 'test@example.com',
    username: 'testuser',
    role: 'GAMER',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDigitalProduct = {
    id: 'product_1',
    name: 'Gaming Skin',
    description: 'Epic gaming skin',
    price: 29.99,
    type: ProductType.DIGITAL_COSMETIC,
    category: 'Skins',
    imageUrl: 'https://example.com/skin.jpg',
    stock: null,
    isActive: true,
    metadata: { badgeId: 'epic_skin_badge', cosmeticId: 'epic_skin_cosmetic' },
    createdAt: new Date(),
    updatedAt: new Date(),
    OrderItem: []
  };

  const mockPhysicalProduct = {
    id: 'product_2',
    name: 'Gaming Headset',
    description: 'High-quality gaming headset',
    price: 199.99,
    type: ProductType.PHYSICAL_MERCHANDISE,
    category: 'Hardware',
    imageUrl: 'https://example.com/headset.jpg',
    stock: 50,
    isActive: true,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    OrderItem: []
  };

  const mockOrder = {
    id: 'order_1',
    userId: 'user_1',
    status: OrderStatus.PENDING,
    totalAmount: 229.98,
    stripeSessionId: 'cs_session_123',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    items: [
      {
        id: 'item_1',
        orderId: 'order_1',
        productId: 'product_1',
        quantity: 1,
        price: 29.99,
        product: mockDigitalProduct,
        order: null as any,
      },
      {
        id: 'item_2',
        orderId: 'order_1',
        productId: 'product_2',
        quantity: 1,
        price: 199.99,
        product: mockPhysicalProduct,
        order: null as any,
      }
    ]
  };

  const mockStripeSession = {
    id: 'cs_session_123',
    url: 'https://checkout.stripe.com/session_123',
    payment_status: 'unpaid',
    metadata: {
      orderId: 'order_1',
      userId: 'user_1',
    },
  };

  const mockPrismaService = {
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    orderItem: {
      create: jest.fn(),
      createMany: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    purchase: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockProductsService = {
    findOne: jest.fn(),
    bulkReserveStock: jest.fn(),
    bulkRestoreStock: jest.fn(),
    validateStock: jest.fn(),
  };

  const mockPaymentsService = {
    createCheckoutSession: jest.fn(),
    findBySessionId: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
    addBadge: jest.fn(),
    addCosmetic: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
    productsService = module.get<ProductsService>(ProductsService);
    paymentsService = module.get<PaymentsService>(PaymentsService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createOrderDto: CreateOrderDto = {
      items: [
        { productId: 'product_1', quantity: 1 },
        { productId: 'product_2', quantity: 1 },
      ],
    };

    it('should create an order and return Stripe checkout session', async () => {
      mockProductsService.findOne
        .mockResolvedValueOnce(mockDigitalProduct)
        .mockResolvedValueOnce(mockPhysicalProduct);
      mockProductsService.bulkReserveStock.mockResolvedValue(undefined);
      
      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          order: {
            create: jest.fn().mockResolvedValue(mockOrder),
          },
          orderItem: {
            createMany: jest.fn().mockResolvedValue({ count: 2 }),
          },
        });
      });

      mockPaymentsService.createCheckoutSession.mockResolvedValue(mockStripeSession);

      const result = await service.create('user_1', createOrderDto);

      expect(mockProductsService.bulkReserveStock).toHaveBeenCalledWith([
        { productId: 'product_1', quantity: 1 },
        { productId: 'product_2', quantity: 1 },
      ]);

      expect(mockPaymentsService.createCheckoutSession).toHaveBeenCalledWith({
        amount: 22998, // 229.98 * 100
        currency: 'usd',
        type: PaymentType.SHOP_PURCHASE,
        description: 'Order for 2 items',
        metadata: {
          orderId: mockOrder.id,
          userId: 'user_1',
        },
      });

      expect(result).toEqual({
        order: mockOrder,
        checkoutUrl: mockStripeSession.url,
      });
    });

    it('should throw BadRequestException if product not found', async () => {
      mockProductsService.findOne.mockRejectedValue(new NotFoundException());

      await expect(
        service.create('user_1', createOrderDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if product is inactive', async () => {
      const inactiveProduct = { ...mockDigitalProduct, isActive: false };
      mockProductsService.findOne.mockResolvedValue(inactiveProduct);

      await expect(
        service.create('user_1', createOrderDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should restore stock if order creation fails', async () => {
      mockProductsService.findOne
        .mockResolvedValueOnce(mockDigitalProduct)
        .mockResolvedValueOnce(mockPhysicalProduct);
      mockProductsService.bulkReserveStock.mockResolvedValue(undefined);
      mockProductsService.bulkRestoreStock.mockResolvedValue(undefined);

      mockPrismaService.$transaction.mockRejectedValue(new Error('Transaction failed'));

      await expect(
        service.create('user_1', createOrderDto)
      ).rejects.toThrow();

      expect(mockProductsService.bulkRestoreStock).toHaveBeenCalledWith([
        { productId: 'product_1', quantity: 1 },
        { productId: 'product_2', quantity: 1 },
      ]);
    });
  });

  describe('findAll', () => {
    const queryDto: OrderQueryDto = {
      page: 1,
      limit: 10,
      status: OrderStatus.COMPLETED,
    };

    it('should return paginated orders for a user', async () => {
      const mockResults = {
        orders: [mockOrder],
        total: 1,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

      mockPrismaService.order.findMany.mockResolvedValue([mockOrder]);
      mockPrismaService.order.count.mockResolvedValue(1);

      const result = await service.findAll('user_1', queryDto);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user_1',
          status: OrderStatus.COMPLETED,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(result).toEqual(mockResults);
    });

    it('should return all orders when no filters applied', async () => {
      const emptyQuery: OrderQueryDto = { page: 1, limit: 10 };

      mockPrismaService.order.findMany.mockResolvedValue([mockOrder]);
      mockPrismaService.order.count.mockResolvedValue(1);

      const result = await service.findAll('user_1', emptyQuery);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: 'user_1' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(result.orders).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return an order by id for the correct user', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findOne('user_1', 'order_1');

      expect(mockPrismaService.order.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'order_1',
          userId: 'user_1',
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      expect(result).toEqual(mockOrder);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('user_1', 'nonexistent')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('completeOrder', () => {
    it('should complete order and fulfill digital goods', async () => {
      const orderWithDigitalItems = {
        ...mockOrder,
        items: [
          {
            ...mockOrder.items[0],
            product: mockDigitalProduct,
          },
        ],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(orderWithDigitalItems);
      mockUsersService.findById.mockResolvedValue(mockUser);
      mockUsersService.addBadge.mockResolvedValue(undefined);
      mockUsersService.addCosmetic.mockResolvedValue(undefined);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          order: {
            update: jest.fn().mockResolvedValue({
              ...orderWithDigitalItems,
              status: OrderStatus.COMPLETED,
            }),
          },
          purchase: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await service.completeOrder('order_1');

      expect(mockUsersService.addBadge).toHaveBeenCalledWith(
        'user_1',
        'epic_skin_badge'
      );
      expect(mockUsersService.addCosmetic).toHaveBeenCalledWith(
        'user_1',
        'epic_skin_cosmetic'
      );

      expect(result.status).toBe(OrderStatus.COMPLETED);
    });

    it('should complete order without digital fulfillment for physical items', async () => {
      const orderWithPhysicalItems = {
        ...mockOrder,
        items: [
          {
            ...mockOrder.items[1],
            product: mockPhysicalProduct,
          },
        ],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(orderWithPhysicalItems);
      mockUsersService.findById.mockResolvedValue(mockUser);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          order: {
            update: jest.fn().mockResolvedValue({
              ...orderWithPhysicalItems,
              status: OrderStatus.COMPLETED,
            }),
          },
          purchase: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const result = await service.completeOrder('order_1');

      expect(mockUsersService.addBadge).not.toHaveBeenCalled();
      expect(mockUsersService.addCosmetic).not.toHaveBeenCalled();
      expect(result.status).toBe(OrderStatus.COMPLETED);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.completeOrder('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException if order is already completed', async () => {
      const completedOrder = { ...mockOrder, status: OrderStatus.COMPLETED };
      mockPrismaService.order.findUnique.mockResolvedValue(completedOrder);

      await expect(service.completeOrder('order_1')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order and restore stock', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockProductsService.bulkRestoreStock.mockResolvedValue(undefined);

      const cancelledOrder = { ...mockOrder, status: OrderStatus.CANCELLED };
      mockPrismaService.order.update.mockResolvedValue(cancelledOrder);

      const result = await service.cancelOrder('order_1');

      expect(mockProductsService.bulkRestoreStock).toHaveBeenCalledWith([
        { productId: 'product_1', quantity: 1 },
        { productId: 'product_2', quantity: 1 },
      ]);

      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: 'order_1' },
        data: { status: OrderStatus.CANCELLED },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      expect(result.status).toBe(OrderStatus.CANCELLED);
    });

    it('should throw NotFoundException if order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(service.cancelOrder('nonexistent')).rejects.toThrow(
        NotFoundException
      );
    });

    it('should throw BadRequestException if order cannot be cancelled', async () => {
      const completedOrder = { ...mockOrder, status: OrderStatus.COMPLETED };
      mockPrismaService.order.findUnique.mockResolvedValue(completedOrder);

      await expect(service.cancelOrder('order_1')).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('handlePaymentSuccess', () => {
    it('should complete order when payment is successful', async () => {
      const mockPayment = {
        id: 'payment_1',
        stripeSessionId: 'cs_session_123',
        status: PaymentStatus.COMPLETED,
        metadata: { orderId: 'order_1' },
      };

      mockPaymentsService.findBySessionId.mockResolvedValue(mockPayment);
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockUsersService.findById.mockResolvedValue(mockUser);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback({
          order: {
            update: jest.fn().mockResolvedValue({
              ...mockOrder,
              status: OrderStatus.COMPLETED,
            }),
          },
          purchase: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      await service.handlePaymentSuccess('cs_session_123');

      expect(mockPaymentsService.findBySessionId).toHaveBeenCalledWith(
        'cs_session_123'
      );
    });

    it('should throw NotFoundException if payment not found', async () => {
      mockPaymentsService.findBySessionId.mockRejectedValue(
        new NotFoundException()
      );

      await expect(
        service.handlePaymentSuccess('nonexistent')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllOrders', () => {
    it('should return all orders for admin with pagination', async () => {
      const queryDto: OrderQueryDto = {
        page: 1,
        limit: 10,
        status: OrderStatus.PENDING,
      };

      mockPrismaService.order.findMany.mockResolvedValue([mockOrder]);
      mockPrismaService.order.count.mockResolvedValue(1);

      const result = await service.getAllOrders(queryDto);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith({
        where: { status: OrderStatus.PENDING },
        include: {
          user: true,
          items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });

      expect(result.orders).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });

  describe('getOrderStats', () => {
    it('should return order statistics', async () => {
      const mockStats = {
        totalOrders: 100,
        completedOrders: 80,
        pendingOrders: 15,
        cancelledOrders: 5,
        totalRevenue: 25000.0,
        averageOrderValue: 312.5,
      };

      mockPrismaService.order.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80) // completed
        .mockResolvedValueOnce(15) // pending
        .mockResolvedValueOnce(5); // cancelled

      mockPrismaService.order.findMany.mockResolvedValue([
        { totalAmount: 100 },
        { totalAmount: 200 },
        { totalAmount: 150 },
      ]);

      const result = await service.getOrderStats();

      expect(result.totalOrders).toBe(100);
      expect(result.completedOrders).toBe(80);
      expect(result.pendingOrders).toBe(15);
      expect(result.cancelledOrders).toBe(5);
    });
  });
});