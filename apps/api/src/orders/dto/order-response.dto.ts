import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FULFILLED = 'FULFILLED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export class OrderItemResponseDto {
  @ApiProperty({
    description: 'Order item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  productId: string;

  @ApiProperty({
    description: 'Price at the time of purchase (in cents)',
    example: 500,
  })
  priceAtPurchase: number;

  @ApiProperty({
    description: 'Quantity purchased',
    example: 1,
  })
  quantity: number;

  @ApiPropertyOptional({
    description: 'Item-specific metadata',
    example: { customization: 'red color' },
  })
  metadata?: any;

  @ApiPropertyOptional({
    description: 'Product details (if included)',
  })
  product?: {
    id: string;
    title: string;
    description?: string;
    type: string;
    images?: string[];
  };
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'Order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'User ID (null for guest orders)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId?: string;

  @ApiProperty({
    description: 'Total amount in cents',
    example: 1500,
  })
  totalAmount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Order status',
    enum: OrderStatus,
    example: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @ApiPropertyOptional({
    description: 'External payment ID (Stripe payment intent ID)',
    example: 'pi_1234567890abcdef',
  })
  externalPaymentId?: string;

  @ApiPropertyOptional({
    description: 'Additional order metadata',
    example: { giftMessage: 'Happy Birthday!' },
  })
  metadata?: any;

  @ApiProperty({
    description: 'Order creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Order last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'Order items',
    type: [OrderItemResponseDto],
  })
  items: OrderItemResponseDto[];

  @ApiPropertyOptional({
    description: 'User details (if included)',
  })
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export class CreateOrderResponseDto {
  @ApiProperty({
    description: 'Order ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  orderId: string;

  @ApiProperty({
    description: 'Stripe checkout session ID',
    example: 'cs_test_1234567890abcdef',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Stripe checkout URL',
    example: 'https://checkout.stripe.com/pay/cs_test_1234567890abcdef',
  })
  checkoutUrl: string;

  @ApiProperty({
    description: 'Order total amount in cents',
    example: 1500,
  })
  totalAmount: number;
}