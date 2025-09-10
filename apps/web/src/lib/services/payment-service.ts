interface CreateCheckoutSessionData {
  type: 'TOURNAMENT_FEE' | 'PURCHASE' | 'SUBSCRIPTION' | 'AD' | 'SHOP_PURCHASE';
  amount: number;
  currency?: string;
  tournamentId?: string;
  productId?: string;
  orderId?: string;
  subscriptionPlan?: string;
  metadata?: Record<string, any>;
  successUrl?: string;
  cancelUrl?: string;
}

interface CheckoutSessionResponse {
  sessionId: string;
  paymentId: string;
  url: string;
}

interface PaymentResponse {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: string;
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED' | 'REFUNDED';
  externalPaymentId?: string;
  metadata?: Record<string, any>;
  refundedAmount?: number;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

class PaymentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    
    // Get token from localStorage (you might want to use a more secure method)
    return localStorage.getItem('accessToken');
  }

  private async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async createCheckoutSession(data: CreateCheckoutSessionData): Promise<CheckoutSessionResponse> {
    return this.apiRequest<CheckoutSessionResponse>('/payments/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    return this.apiRequest<PaymentResponse>(`/payments/${paymentId}/status`);
  }

  async getUserPayments(limit = 10, offset = 0): Promise<PaymentResponse[]> {
    return this.apiRequest<PaymentResponse[]>(
      `/payments/my-payments?limit=${limit}&offset=${offset}`
    );
  }

  async redirectToCheckout(sessionId: string): Promise<void> {
    const { getStripe } = await import('../stripe/stripe');
    const stripe = await getStripe();
    
    if (!stripe) {
      throw new Error('Stripe not loaded');
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      throw new Error(error.message);
    }
  }

  // Tournament-specific helper
  async createTournamentPayment(
    tournamentId: string,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<CheckoutSessionResponse> {
    return this.createCheckoutSession({
      type: 'TOURNAMENT_FEE',
      amount,
      tournamentId,
      metadata,
      successUrl: `${window.location.origin}/tournaments/${tournamentId}?payment=success`,
      cancelUrl: `${window.location.origin}/tournaments/${tournamentId}?payment=canceled`,
    });
  }

  // Subscription helper
  async createSubscriptionPayment(
    plan: string,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<CheckoutSessionResponse> {
    return this.createCheckoutSession({
      type: 'SUBSCRIPTION',
      amount,
      subscriptionPlan: plan,
      metadata,
      successUrl: `${window.location.origin}/dashboard?subscription=success`,
      cancelUrl: `${window.location.origin}/dashboard?subscription=canceled`,
    });
  }

  // Product purchase helper
  async createProductPayment(
    productId: string,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<CheckoutSessionResponse> {
    return this.createCheckoutSession({
      type: 'PURCHASE',
      amount,
      productId,
      metadata,
      successUrl: `${window.location.origin}/shop?purchase=success`,
      cancelUrl: `${window.location.origin}/shop?purchase=canceled`,
    });
  }
}

export const paymentService = new PaymentService();
export type { CreateCheckoutSessionData, CheckoutSessionResponse, PaymentResponse };