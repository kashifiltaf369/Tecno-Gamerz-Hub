import { ApiProperty } from '@nestjs/swagger';

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  REFUNDED = 'REFUNDED',
}

export class PaymentResponseDto {
  @ApiProperty({
    description: 'Payment ID',
    example: 'uuid-string',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: 'user-uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'Payment amount in cents',
    example: 2000,
  })
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiProperty({
    description: 'Payment type',
    example: 'TOURNAMENT_FEE',
  })
  type: string;

  @ApiProperty({
    description: 'Payment status',
    enum: PaymentStatus,
    example: PaymentStatus.SUCCEEDED,
  })
  status: PaymentStatus;

  @ApiProperty({
    description: 'Stripe payment ID',
    example: 'pi_1234567890',
    required: false,
  })
  externalPaymentId?: string;

  @ApiProperty({
    description: 'Payment metadata',
    example: { tournamentId: 'tournament-uuid' },
    required: false,
  })
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Refunded amount in cents',
    example: 1000,
    required: false,
  })
  refundedAmount?: number;

  @ApiProperty({
    description: 'Refund date',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  refundedAt?: string;

  @ApiProperty({
    description: 'Payment creation date',
    example: '2024-01-15T10:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Payment last update date',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: string;
}

export class CheckoutSessionResponseDto {
  @ApiProperty({
    description: 'Stripe checkout session ID',
    example: 'cs_test_1234567890',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Payment ID in our system',
    example: 'payment-uuid',
  })
  paymentId: string;

  @ApiProperty({
    description: 'Checkout session URL',
    example: 'https://checkout.stripe.com/pay/cs_test_1234567890',
  })
  url: string;
}

export class RefundResponseDto {
  @ApiProperty({
    description: 'Refund ID',
    example: 're_1234567890',
  })
  refundId: string;

  @ApiProperty({
    description: 'Payment ID',
    example: 'payment-uuid',
  })
  paymentId: string;

  @ApiProperty({
    description: 'Refunded amount in cents',
    example: 2000,
  })
  amount: number;

  @ApiProperty({
    description: 'Refund status',
    example: 'succeeded',
  })
  status: string;
}