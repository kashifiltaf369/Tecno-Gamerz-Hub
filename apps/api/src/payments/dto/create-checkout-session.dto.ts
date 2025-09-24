import { IsString, IsOptional, IsNumber, IsEnum, IsUUID, Min, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentType {
  TOURNAMENT_FEE = 'TOURNAMENT_FEE',
  PURCHASE = 'PURCHASE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  AD = 'AD',
  SHOP_PURCHASE = 'SHOP_PURCHASE',
}

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'Type of payment',
    enum: PaymentType,
    example: PaymentType.TOURNAMENT_FEE,
  })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({
    description: 'Amount in cents (e.g., 2000 for $20.00)',
    example: 2000,
  })
  @IsNumber()
  @Min(50) // Minimum $0.50
  amount: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @ApiProperty({
    description: 'Tournament ID for tournament fees',
    example: 'uuid-string',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  tournamentId?: string;

  @ApiProperty({
    description: 'Product ID for purchases',
    example: 'product-uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiProperty({
    description: 'Order ID for shop purchases',
    example: 'order-uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiProperty({
    description: 'Subscription plan for subscriptions',
    example: 'PREMIUM',
    required: false,
  })
  @IsOptional()
  @IsString()
  subscriptionPlan?: string;

  @ApiProperty({
    description: 'Additional metadata for the payment',
    example: { description: 'Tournament Entry Fee' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Success URL to redirect after successful payment',
    example: 'https://app.com/success',
    required: false,
  })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiProperty({
    description: 'Cancel URL to redirect after cancelled payment',
    example: 'https://app.com/cancel',
    required: false,
  })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}