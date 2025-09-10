import { IsString, IsInt, IsOptional, IsBoolean, IsEnum, IsArray, Min, IsJSON } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum ProductType {
  COSMETIC = 'COSMETIC',
  BADGE = 'BADGE',
  DISCOUNT = 'DISCOUNT',
  PHYSICAL = 'PHYSICAL',
}

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title',
    example: 'Rookie Badge',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Exclusive badge for new players',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Product price in cents',
    example: 500,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value))
  price: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsString()
  currency?: string = 'USD';

  @ApiPropertyOptional({
    description: 'Stock quantity (null for unlimited digital items)',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => value === null ? null : parseInt(value))
  stock?: number | null;

  @ApiPropertyOptional({
    description: 'Array of image URLs',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiProperty({
    description: 'Product type',
    enum: ProductType,
    example: ProductType.BADGE,
  })
  @IsEnum(ProductType)
  type: ProductType;

  @ApiPropertyOptional({
    description: 'Additional product metadata (JSON)',
    example: { badgeId: 'rookie', css: 'badge-rookie' },
  })
  @IsOptional()
  @IsJSON()
  @Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
  metadata?: any;

  @ApiPropertyOptional({
    description: 'Whether the product is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean = true;
}