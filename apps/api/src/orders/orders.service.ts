import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { ProductsService } from '../products/products.service';
import { PaymentsService } from '../payments/payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto, CreateOrderResponseDto, OrderItemResponseDto } from './dto/order-response.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { PaymentType } from '../payments/dto/create-checkout-session.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService,
    private paymentsService: PaymentsService,
  ) {}

  async create(
    userId: string | null,
    dto: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    try {
      // Start a transaction to ensure data consistency
      return await this.prisma.$transaction(async (tx) => {
        // Validate and get all products
        const productIds = dto.items.map(item => item.productId);
        const products = await tx.product.findMany({
          where: {
            id: { in: productIds },
            isActive: true,
          },
        });

        if (products.length !== productIds.length) {
          const foundIds = products.map(p => p.id);
          const missingIds = productIds.filter(id => !foundIds.includes(id));
          throw new BadRequestException(`Products not found or inactive: ${missingIds.join(', ')}`);
        }

        // Check stock availability and calculate total
        let totalAmount = 0;
        const orderItems = [];

        for (const item of dto.items) {
          const product = products.find(p => p.id === item.productId);
          
          // Check stock for physical products
          if (product.stock !== null && product.stock < item.quantity) {
            throw new BadRequestException(`Insufficient stock for product: ${product.title}`);
          }

          const itemTotal = product.price * item.quantity;
          totalAmount += itemTotal;

          orderItems.push({
            productId: item.productId,
            priceAtPurchase: product.price,
            quantity: item.quantity,
            metadata: item.metadata ? JSON.stringify(item.metadata) : null,
          });
        }

        // Create the order
        const order = await tx.order.create({
          data: {
            userId,
            totalAmount,
            currency: dto.currency || 'USD',
            status: 'PENDING',
            metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
            items: {
              create: orderItems,
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

        // Reserve stock for physical products
        for (const item of dto.items) {
          const product = products.find(p => p.id === item.productId);
          if (product.stock !== null) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: product.stock - item.quantity },
            });
          }
        }

        this.logger.log(`Created order: ${order.id} with total: ${totalAmount} cents`);

        // Create Stripe checkout session
        const checkoutSession = await this.paymentsService.createCheckoutSession(
          userId,
          {
            type: PaymentType.SHOP_PURCHASE,
            amount: totalAmount,
            currency: dto.currency || 'USD',
            successUrl: dto.successUrl,
            cancelUrl: dto.cancelUrl,
            metadata: {
              orderId: order.id,
              itemCount: dto.items.length,
            },
          },
        );

        // Update order with payment session info
        await tx.order.update({
          where: { id: order.id },
          data: { externalPaymentId: checkoutSession.sessionId },
        });

        return {
          orderId: order.id,
          sessionId: checkoutSession.sessionId,
          checkoutUrl: checkoutSession.url,
          totalAmount,
        };
      });
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create order');
    }
  }

  async findAll(query: OrderQueryDto): Promise<{
    orders: OrderResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const { status, userId, limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = query;

      // Build where clause
      const where: any = {};

      if (status) {
        where.status = status;
      }

      if (userId) {
        where.userId = userId;
      }

      // Build order by clause
      const orderBy: any = {};
      orderBy[sortBy] = sortOrder;

      // Get total count
      const total = await this.prisma.order.count({ where });

      // Get orders
      const orders = await this.prisma.order.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  type: true,
                  images: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      const totalPages = Math.ceil(total / limit);
      const page = Math.floor(offset / limit) + 1;

      return {
        orders: orders.map(this.mapToResponseDto),
        total,
        page,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch orders: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch orders');
    }
  }

  async findOne(id: string): Promise<OrderResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                description: true,
                type: true,
                images: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return this.mapToResponseDto(order);
  }

  async findByUser(userId: string, query: Omit<OrderQueryDto, 'userId'>): Promise<{
    orders: OrderResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    return this.findAll({ ...query, userId });
  }

  // Method called by payment webhook when order is paid
  async markAsPaid(orderId: string, externalPaymentId: string): Promise<void> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });

      if (!order) {
        this.logger.warn(`Order not found for payment: ${orderId}`);
        return;
      }

      if (order.status !== 'PENDING') {
        this.logger.warn(`Order ${orderId} is not in PENDING status: ${order.status}`);
        return;
      }

      // Update order status
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          externalPaymentId,
        },
      });

      this.logger.log(`Order ${orderId} marked as paid`);

      // Fulfill digital items immediately
      await this.fulfillDigitalItems(order);
    } catch (error) {
      this.logger.error(`Failed to mark order as paid: ${orderId}`, error.stack);
      throw error;
    }
  }

  // Method to fulfill digital items after payment
  private async fulfillDigitalItems(order: any): Promise<void> {
    try {
      const digitalItems = order.items.filter(
        (item) => item.product.type !== 'PHYSICAL'
      );

      if (digitalItems.length === 0) {
        return;
      }

      // Create purchases for digital items
      for (const item of digitalItems) {
        // Check if purchase already exists (prevent duplicates)
        const existingPurchase = await this.prisma.purchase.findUnique({
          where: {
            userId_productId: {
              userId: order.userId,
              productId: item.productId,
            },
          },
        });

        if (!existingPurchase && order.userId) {
          await this.prisma.purchase.create({
            data: {
              userId: order.userId,
              productId: item.productId,
              orderId: order.id,
              metadata: item.metadata ? JSON.parse(item.metadata) : null,
            },
          });

          this.logger.log(
            `Granted digital product ${item.product.title} to user ${order.userId}`
          );

          // Handle specific digital item types
          await this.grantDigitalItem(order.userId, item.product, item.quantity);
        }
      }

      // Check if all items are digital, if so mark order as fulfilled
      const hasPhysicalItems = order.items.some(
        (item) => item.product.type === 'PHYSICAL'
      );

      if (!hasPhysicalItems) {
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'FULFILLED' },
        });

        this.logger.log(`Order ${order.id} automatically fulfilled (all digital items)`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to fulfill digital items for order ${order.id}:`,
        error.stack
      );
    }
  }

  // Method to grant specific digital items based on type
  private async grantDigitalItem(userId: string, product: any, quantity: number): Promise<void> {
    const metadata = product.metadata ? JSON.parse(product.metadata) : {};

    switch (product.type) {
      case 'BADGE':
        // Grant badge to user
        if (metadata.badgeId) {
          await this.grantBadge(userId, metadata.badgeId);
        }
        break;

      case 'COSMETIC':
        // Grant cosmetic item (skin, theme, etc.)
        if (metadata.css || metadata.skinId) {
          await this.grantCosmetic(userId, metadata);
        }
        break;

      case 'DISCOUNT':
        // Grant discount coupon
        if (metadata.discountCode || metadata.discountAmount) {
          await this.grantDiscount(userId, metadata, quantity);
        }
        break;

      default:
        this.logger.log(`Unknown digital item type: ${product.type}`);
    }
  }

  private async grantBadge(userId: string, badgeId: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return;
      }

      const badges = user.badges ? JSON.parse(user.badges as string) : [];
      
      if (!badges.includes(badgeId)) {
        badges.push(badgeId);
        
        await this.prisma.user.update({
          where: { id: userId },
          data: { badges: JSON.stringify(badges) },
        });

        this.logger.log(`Granted badge ${badgeId} to user ${userId}`);
      }
    } catch (error) {
      this.logger.error(`Failed to grant badge ${badgeId} to user ${userId}:`, error.stack);
    }
  }

  private async grantCosmetic(userId: string, metadata: any): Promise<void> {
    try {
      // This would typically update user's cosmetic items
      // For now, we'll just log it
      this.logger.log(`Granted cosmetic item to user ${userId}:`, metadata);
      
      // In a real implementation, you might have a UserCosmetics table:
      // await this.prisma.userCosmetic.create({
      //   data: { userId, cosmeticId: metadata.skinId || metadata.css }
      // });
    } catch (error) {
      this.logger.error(`Failed to grant cosmetic to user ${userId}:`, error.stack);
    }
  }

  private async grantDiscount(userId: string, metadata: any, quantity: number): Promise<void> {
    try {
      // This would typically create discount coupons for the user
      this.logger.log(`Granted ${quantity} discount(s) to user ${userId}:`, metadata);
      
      // In a real implementation, you might have a UserCoupons table:
      // for (let i = 0; i < quantity; i++) {
      //   await this.prisma.userCoupon.create({
      //     data: {
      //       userId,
      //       code: generateUniqueCode(),
      //       discountAmount: metadata.discountAmount,
      //       expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      //     }
      //   });
      // }
    } catch (error) {
      this.logger.error(`Failed to grant discount to user ${userId}:`, error.stack);
    }
  }

  // Method to manually fulfill physical orders (admin only)
  async fulfillOrder(orderId: string): Promise<OrderResponseDto> {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { items: { include: { product: true } } },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.status !== 'PAID') {
        throw new BadRequestException('Order must be paid before fulfillment');
      }

      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'FULFILLED' },
      });

      this.logger.log(`Order ${orderId} manually marked as fulfilled`);

      return this.findOne(orderId);
    } catch (error) {
      this.logger.error(`Failed to fulfill order ${orderId}:`, error.stack);
      throw error;
    }
  }

  // Method to cancel order and restore stock
  async cancelOrder(orderId: string): Promise<OrderResponseDto> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: { include: { product: true } } },
        });

        if (!order) {
          throw new NotFoundException('Order not found');
        }

        if (order.status !== 'PENDING') {
          throw new BadRequestException('Only pending orders can be cancelled');
        }

        // Restore stock for physical products
        for (const item of order.items) {
          if (item.product.stock !== null) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: item.product.stock + item.quantity },
            });
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' },
        });

        this.logger.log(`Order ${orderId} cancelled and stock restored`);

        return this.findOne(orderId);
      });
    } catch (error) {
      this.logger.error(`Failed to cancel order ${orderId}:`, error.stack);
      throw error;
    }
  }

  private mapToResponseDto(order: any): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      totalAmount: order.totalAmount,
      currency: order.currency,
      status: order.status,
      externalPaymentId: order.externalPaymentId,
      metadata: order.metadata ? JSON.parse(order.metadata) : null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      items: order.items.map((item: any): OrderItemResponseDto => ({
        id: item.id,
        productId: item.productId,
        priceAtPurchase: item.priceAtPurchase,
        quantity: item.quantity,
        metadata: item.metadata ? JSON.parse(item.metadata) : null,
        product: item.product ? {
          id: item.product.id,
          title: item.product.title,
          description: item.product.description,
          type: item.product.type,
          images: item.product.images ? JSON.parse(item.product.images) : null,
        } : undefined,
      })),
      user: order.user,
    };
  }
}