import { IsString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookEventDto {
  @ApiProperty({
    description: 'Stripe event ID',
    example: 'evt_1234567890',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Event type from Stripe',
    example: 'checkout.session.completed',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Event data from Stripe',
    example: {},
  })
  @IsObject()
  data: any;

  @ApiProperty({
    description: 'Event API version',
    example: '2020-08-27',
  })
  @IsString()
  api_version: string;

  @ApiProperty({
    description: 'Event created timestamp',
    example: 1609459200,
  })
  created: number;

  @ApiProperty({
    description: 'Livemode flag',
    example: false,
  })
  livemode: boolean;

  @ApiProperty({
    description: 'Object type',
    example: 'event',
  })
  @IsString()
  object: string;

  @ApiProperty({
    description: 'Pending webhooks count',
    example: 1,
  })
  pending_webhooks: number;

  @ApiProperty({
    description: 'Request object',
    example: {},
    required: false,
  })
  request?: any;
}