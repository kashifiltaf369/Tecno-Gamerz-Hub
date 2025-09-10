import { IsArray, IsOptional, IsString, ValidateNested, ArrayMinSize, IsInt, Min, IsJSON } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  quantity: number;

  @ApiPropertyOptional({
    description: 'Item-specific metadata (JSON)',
    example: { customization: 'red color' },
  })
  @IsOptional()
  @IsJSON()
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  metadata?: any;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Array of order items',
    type: [OrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @ApiPropertyOptional({
    description: 'Additional order metadata (JSON)',
    example: { giftMessage: 'Happy Birthday!' },
  })
  @IsOptional()
  @IsJSON()
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  metadata?: any;

  @ApiPropertyOptional({
    description: 'Success URL for payment redirect',
    example: 'https://example.com/success',
  })
  @IsOptional()
  @IsString()
  successUrl?: string;

  @ApiPropertyOptional({
    description: 'Cancel URL for payment redirect',
    example: 'https://example.com/cancel',
  })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}