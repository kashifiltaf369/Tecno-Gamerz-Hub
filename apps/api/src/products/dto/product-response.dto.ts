import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductType } from './create-product.dto';

export class ProductResponseDto {
  @ApiProperty({
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Product title',
    example: 'Rookie Badge',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Exclusive badge for new players',
  })
  description?: string;

  @ApiProperty({
    description: 'Product price in cents',
    example: 500,
  })
  price: number;

  @ApiProperty({
    description: 'Currency code',
    example: 'USD',
  })
  currency: string;

  @ApiPropertyOptional({
    description: 'Stock quantity (null for unlimited digital items)',
    example: 100,
  })
  stock?: number | null;

  @ApiPropertyOptional({
    description: 'Array of image URLs',
    example: ['https://example.com/image1.jpg'],
  })
  images?: string[];

  @ApiProperty({
    description: 'Product type',
    enum: ProductType,
    example: ProductType.BADGE,
  })
  type: ProductType;

  @ApiPropertyOptional({
    description: 'Additional product metadata',
    example: { badgeId: 'rookie', css: 'badge-rookie' },
  })
  metadata?: any;

  @ApiProperty({
    description: 'Whether the product is active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Product creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Product last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: string;
}