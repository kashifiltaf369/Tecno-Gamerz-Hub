import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefundPaymentDto {
  @ApiProperty({
    description: 'Amount to refund in cents (optional, full refund if not provided)',
    example: 1000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @ApiProperty({
    description: 'Reason for the refund',
    example: 'Tournament cancelled',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({
    description: 'Additional metadata for the refund',
    example: { adminId: 'admin-uuid', notes: 'Customer request' },
    required: false,
  })
  @IsOptional()
  metadata?: Record<string, any>;
}