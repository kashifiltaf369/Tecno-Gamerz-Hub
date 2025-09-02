import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Headers,
  RawBodyRequest,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import {
  PaymentResponseDto,
  CheckoutSessionResponseDto,
  RefundResponseDto,
} from './dto/payment-response.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  private stripe: Stripe;

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    this.stripe = new Stripe(stripeSecretKey!, {
      apiVersion: '2024-06-20',
    });
  }

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  @ApiResponse({
    status: 201,
    description: 'Checkout session created successfully',
    type: CheckoutSessionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Conflict (e.g., already registered)' })
  @Throttle(5, 60) // 5 requests per minute
  async createCheckoutSession(
    @Request() req: any,
    @Body() createCheckoutSessionDto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    return this.paymentsService.createCheckoutSession(
      req.user.sub,
      createCheckoutSessionDto,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid webhook signature' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ): Promise<{ received: boolean }> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new UnauthorizedException('Webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody!,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new UnauthorizedException(`Webhook signature verification failed: ${err.message}`);
    }

    await this.paymentsService.handleWebhookEvent(event);

    return { received: true };
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment status by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment status retrieved successfully',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentStatus(@Param('id') id: string): Promise<PaymentResponseDto> {
    return this.paymentsService.getPayment(id);
  }

  @Get('my-payments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user payments' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of payments to return (default: 10)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of payments to skip (default: 0)' })
  @ApiResponse({
    status: 200,
    description: 'User payments retrieved successfully',
    type: [PaymentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getUserPayments(
    @Request() req: any,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<PaymentResponseDto[]> {
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const offsetNum = offset ? parseInt(offset, 10) : 0;
    
    return this.paymentsService.getUserPayments(req.user.sub, limitNum, offsetNum);
  }

  @Post(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund a payment (Admin only)' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: 200,
    description: 'Payment refunded successfully',
    type: RefundResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @Throttle(10, 60) // 10 refunds per minute
  async refundPayment(
    @Param('id') id: string,
    @Body() refundPaymentDto: RefundPaymentDto,
  ): Promise<RefundResponseDto> {
    return this.paymentsService.refundPayment(id, refundPaymentDto);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all payments (Admin only)' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of payments to return (default: 50)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Number of payments to skip (default: 0)' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by payment status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by payment type' })
  @ApiResponse({
    status: 200,
    description: 'All payments retrieved successfully',
    type: [PaymentResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async getAllPayments(
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ): Promise<PaymentResponseDto[]> {
    // TODO: Implement admin payment retrieval with filters
    // This would be implemented in the PaymentsService
    throw new Error('Admin payment retrieval not yet implemented');
  }
}