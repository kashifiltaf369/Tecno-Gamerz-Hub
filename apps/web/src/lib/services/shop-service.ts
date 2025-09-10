// Product types and interfaces
export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  stock?: number | null;
  images?: string[];
  type: 'COSMETIC' | 'BADGE' | 'DISCOUNT' | 'PHYSICAL';
  metadata?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQuery {
  search?: string;
  type?: 'COSMETIC' | 'BADGE' | 'DISCOUNT' | 'PHYSICAL';
  isActive?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'title' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// Order types and interfaces
export interface OrderItem {
  productId: string;
  quantity: number;
  metadata?: any;
}

export interface CreateOrderData {
  items: OrderItem[];
  currency?: string;
  metadata?: any;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  sessionId: string;
  checkoutUrl: string;
  totalAmount: number;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  priceAtPurchase: number;
  quantity: number;
  metadata?: any;
  product?: {
    id: string;
    title: string;
    description?: string;
    type: string;
    images?: string[];
  };
}

export interface Order {
  id: string;
  userId?: string;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED';
  externalPaymentId?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  items: OrderItemResponse[];
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface OrderQuery {
  status?: 'PENDING' | 'PAID' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED';
  userId?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'totalAmount';
  sortOrder?: 'asc' | 'desc';
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

class ShopService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  }

  private async getAuthToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    
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

  // Product methods
  async getProducts(query: ProductQuery = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return this.apiRequest<ProductsResponse>(
      `/products${queryString ? `?${queryString}` : ''}`
    );
  }

  async getProduct(id: string): Promise<Product> {
    return this.apiRequest<Product>(`/products/${id}`);
  }

  // Admin product methods (for future admin panel)
  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return this.apiRequest<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.apiRequest<Product>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.apiRequest<void>(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async activateProduct(id: string): Promise<Product> {
    return this.apiRequest<Product>(`/products/${id}/activate`, {
      method: 'PATCH',
    });
  }

  async deactivateProduct(id: string): Promise<Product> {
    return this.apiRequest<Product>(`/products/${id}/deactivate`, {
      method: 'PATCH',
    });
  }

  // Order methods
  async createOrder(data: CreateOrderData): Promise<CreateOrderResponse> {
    return this.apiRequest<CreateOrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrder(id: string): Promise<Order> {
    return this.apiRequest<Order>(`/orders/${id}`);
  }

  async getUserOrders(query: Omit<OrderQuery, 'userId'> = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return this.apiRequest<OrdersResponse>(
      `/orders/my-orders${queryString ? `?${queryString}` : ''}`
    );
  }

  // Admin order methods
  async getAllOrders(query: OrderQuery = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    return this.apiRequest<OrdersResponse>(
      `/orders${queryString ? `?${queryString}` : ''}`
    );
  }

  async fulfillOrder(id: string): Promise<Order> {
    return this.apiRequest<Order>(`/orders/${id}/fulfill`, {
      method: 'PATCH',
    });
  }

  async cancelOrder(id: string): Promise<Order> {
    return this.apiRequest<Order>(`/orders/${id}/cancel`, {
      method: 'PATCH',
    });
  }

  // Utility methods
  formatPrice(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  getProductTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      COSMETIC: 'Cosmetic',
      BADGE: 'Badge',
      DISCOUNT: 'Discount',
      PHYSICAL: 'Physical Item',
    };
    return labels[type] || type;
  }

  getOrderStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pending Payment',
      PAID: 'Paid',
      FULFILLED: 'Fulfilled',
      CANCELLED: 'Cancelled',
      REFUNDED: 'Refunded',
    };
    return labels[status] || status;
  }

  getOrderStatusColor(status: string): string {
    const colors: Record<string, string> = {
      PENDING: 'text-yellow-600 bg-yellow-100',
      PAID: 'text-blue-600 bg-blue-100',
      FULFILLED: 'text-green-600 bg-green-100',
      CANCELLED: 'text-gray-600 bg-gray-100',
      REFUNDED: 'text-red-600 bg-red-100',
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }
}

export const shopService = new ShopService();