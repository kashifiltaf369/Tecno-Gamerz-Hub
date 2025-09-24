import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../common/services/prisma.service';
import { CreateCheckoutSessionDto, PaymentType } from './dto/create-checkout-session.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { PaymentResponseDto, CheckoutSessionResponseDto, RefundResponseDto } from './dto/payment-response.dto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    
    this.stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-06-20',
    });
  }

  async createCheckoutSession(
    userId: string,
    dto: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    try {
      // Validate tournament if it's a tournament fee
      if (dto.type === PaymentType.TOURNAMENT_FEE && dto.tournamentId) {
        await this.validateTournamentPayment(userId, dto.tournamentId);
      }

      // Create payment record in our database
      const payment = await this.prisma.payment.create({
        data: {
          userId,
          amount: dto.amount,
          currency: dto.currency || 'USD',
          type: dto.type,
          status: 'PENDING',
          metadata: dto.metadata || {},
        },
      });

      // Prepare line items for Stripe
      const lineItems = this.prepareLineItems(dto);

      // Create Stripe checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: dto.type === PaymentType.SUBSCRIPTION ? 'subscription' : 'payment',
        success_url: dto.successUrl || `${this.configService.get('WEB_URL')}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: dto.cancelUrl || `${this.configService.get('WEB_URL')}/payments/cancel`,
        metadata: {
          paymentId: payment.id,
          userId,
          type: dto.type,
          ...(dto.tournamentId && { tournamentId: dto.tournamentId }),
          ...(dto.productId && { productId: dto.productId }),
          ...(dto.orderId && { orderId: dto.orderId }),
        },
        customer_email: undefined, // Will be fetched from user
      });

      // Update payment with Stripe session ID
      await this.prisma.payment.update({
        where: { id: payment.id },
        data: { stripeCheckoutSessionId: session.id },
      });

      this.logger.log(`Created checkout session ${session.id} for payment ${payment.id}`);

      return {
        sessionId: session.id,
        paymentId: payment.id,
        url: session.url!,
      };
    } catch (error) {
      this.logger.error(`Failed to create checkout session: ${error.message}`, error.stack);
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to create checkout session');
    }
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type}`);

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
          break;
        case 'invoice.paid':
          await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
          break;
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          await this.handleSubscriptionEvent(event);
          break;
        default:
          this.logger.log(`Unhandled webhook event type: ${event.type}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process webhook event ${event.type}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getPayment(id: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.mapPaymentToDto(payment);
  }

  async getUserPayments(userId: string, limit = 10, offset = 0): Promise<PaymentResponseDto[]> {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return payments.map(this.mapPaymentToDto);
  }

  async refundPayment(paymentId: string, dto: RefundPaymentDto): Promise<RefundResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'SUCCEEDED') {
      throw new BadRequestException('Can only refund succeeded payments');
    }

    if (!payment.externalPaymentId) {
      throw new BadRequestException('No external payment ID found');
    }

    try {
      // Create refund in Stripe
      const refund = await this.stripe.refunds.create({
        payment_intent: payment.externalPaymentId,
        amount: dto.amount, // If not provided, Stripe refunds full amount
        reason: dto.reason ? 'requested_by_customer' : undefined,
        metadata: dto.metadata || {},
      });

      // Update payment record
      await this.prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'REFUNDED',
          refundedAmount: refund.amount,
          refundedAt: new Date(),
        },
      });

      this.logger.log(`Refunded payment ${paymentId}: ${refund.amount} cents`);

      return {
        refundId: refund.id,
        paymentId,
        amount: refund.amount,
        status: refund.status,
      };
    } catch (error) {
      this.logger.error(`Failed to refund payment ${paymentId}: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to process refund');
    }
  }

  private async validateTournamentPayment(userId: string, tournamentId: string): Promise<void> {
    const tournament = await this.prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (!tournament.entryFee || tournament.entryFee <= 0) {
      throw new BadRequestException('Tournament does not require payment');
    }

    // Check if user is already a participant
    const existingParticipant = await this.prisma.tournamentParticipant.findUnique({
      where: {
        tournamentId_userId: {
          tournamentId,
          userId,
        },
      },
    });

    if (existingParticipant) {
      throw new ConflictException('User is already registered for this tournament');
    }

    // Check if tournament has reached max participants
    if (tournament.maxParticipants) {
      const participantCount = await this.prisma.tournamentParticipant.count({
        where: { tournamentId, isPaid: true },
      });

      if (participantCount >= tournament.maxParticipants) {
        throw new ConflictException('Tournament is full');
      }
    }

    // Check if tournament has started
    if (tournament.startDate <= new Date()) {
      throw new BadRequestException('Cannot join tournament after it has started');
    }
  }

  private prepareLineItems(dto: CreateCheckoutSessionDto): Stripe.Checkout.SessionCreateParams.LineItem[] {
    return [
      {
        price_data: {
          currency: dto.currency || 'USD',
          unit_amount: dto.amount,
          product_data: {
            name: this.getPaymentDescription(dto),
            description: this.getPaymentDescription(dto),
          },
        },
        quantity: 1,
      },
    ];
  }

  private getPaymentDescription(dto: CreateCheckoutSessionDto): string {
    switch (dto.type) {
      case PaymentType.TOURNAMENT_FEE:
        return 'Tournament Entry Fee';
      case PaymentType.PURCHASE:
        return 'Product Purchase';
      case PaymentType.SHOP_PURCHASE:
        return 'Shop Purchase';
      case PaymentType.SUBSCRIPTION:
        return `Subscription - ${dto.subscriptionPlan || 'Premium'}`;
      case PaymentType.AD:
        return 'Advertisement';
      default:
        return 'Payment';
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const paymentId = session.metadata?.paymentId;
    if (!paymentId) {
      this.logger.warn(`No paymentId in session metadata: ${session.id}`);
      return;
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'SUCCEEDED',
        externalPaymentId: session.payment_intent as string,
      },
    });

    // Handle tournament registration if it's a tournament fee
    if (session.metadata?.type === PaymentType.TOURNAMENT_FEE && session.metadata?.tournamentId) {
      await this.handleTournamentPaymentSuccess(
        session.metadata.userId,
        session.metadata.tournamentId,
        paymentId,
      );
    }

    // Handle shop purchase if it's a shop purchase
    if (session.metadata?.type === PaymentType.SHOP_PURCHASE && session.metadata?.orderId) {
      await this.handleShopPurchaseSuccess(
        session.metadata.orderId,
        session.payment_intent as string,
      );
    }

    this.logger.log(`Processed successful checkout session: ${session.id}`);
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    // Handle subscription payments
    this.logger.log(`Invoice paid: ${invoice.id}`);
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    this.logger.log(`Payment intent succeeded: ${paymentIntent.id}`);
  }

  private async handleSubscriptionEvent(event: Stripe.Event): Promise<void> {
    const subscription = event.data.object as Stripe.Subscription;
    this.logger.log(`Subscription event ${event.type}: ${subscription.id}`);
  }

  private async handleTournamentPaymentSuccess(
    userId: string,
    tournamentId: string,
    paymentId: string,
  ): Promise<void> {
    try {
      // Add user as paid participant
      await this.prisma.tournamentParticipant.create({
        data: {
          userId,
          tournamentId,
          paymentId,
          isPaid: true,
        },
      });

      this.logger.log(`Added paid participant ${userId} to tournament ${tournamentId}`);
    } catch (error) {
      this.logger.error(`Failed to add tournament participant: ${error.message}`, error.stack);
    }
  }

  private async handleShopPurchaseSuccess(
    orderId: string,
    externalPaymentId: string,
  ): Promise<void> {
    try {
      // Update order status to PAID and handle fulfillment
      // Note: We'll call the OrdersService method via event/injection later
      // For now, we'll just update the order status
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'PAID',
          externalPaymentId,
        },
      });

      this.logger.log(`Shop order ${orderId} marked as paid`);

      // TODO: Trigger fulfillment process
      // This should call OrdersService.markAsPaid but we'll handle this
      // via events or dependency injection to avoid circular dependencies
    } catch (error) {
      this.logger.error(`Failed to handle shop purchase success: ${error.message}`, error.stack);
    }
  }

  private mapPaymentToDto(payment: any): PaymentResponseDto {
    return {
      id: payment.id,
      userId: payment.userId,
      amount: parseInt(payment.amount.toString()),
      currency: payment.currency,
      type: payment.type,
      status: payment.status,
      externalPaymentId: payment.externalPaymentId,
      metadata: payment.metadata,
      refundedAmount: payment.refundedAmount ? parseInt(payment.refundedAmount.toString()) : undefined,
      refundedAt: payment.refundedAt?.toISOString(),
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
    };
  }
}