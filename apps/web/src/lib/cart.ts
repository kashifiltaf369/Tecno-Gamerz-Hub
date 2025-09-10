import { Product } from './services/shop-service';

export interface CartItem {
  product: Product;
  quantity: number;
  metadata?: any;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

const CART_STORAGE_KEY = 'tecno-gamerz-cart';

class CartManager {
  private listeners: Set<() => void> = new Set();

  // Get cart from localStorage
  getCart(): Cart {
    if (typeof window === 'undefined') {
      return { items: [], total: 0, itemCount: 0 };
    }

    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const items: CartItem[] = JSON.parse(stored);
        return this.calculateCart(items);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      this.clearCart();
    }

    return { items: [], total: 0, itemCount: 0 };
  }

  // Save cart to localStorage
  private saveCart(items: CartItem[]): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  }

  // Calculate cart totals
  private calculateCart(items: CartItem[]): Cart {
    const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return { items, total, itemCount };
  }

  // Add item to cart
  addItem(product: Product, quantity: number = 1, metadata?: any): Cart {
    const cart = this.getCart();
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.id === product.id
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      if (metadata) {
        cart.items[existingItemIndex].metadata = { 
          ...cart.items[existingItemIndex].metadata, 
          ...metadata 
        };
      }
    } else {
      // Add new item
      cart.items.push({ product, quantity, metadata });
    }

    this.saveCart(cart.items);
    return this.calculateCart(cart.items);
  }

  // Remove item from cart
  removeItem(productId: string): Cart {
    const cart = this.getCart();
    const filteredItems = cart.items.filter(item => item.product.id !== productId);
    
    this.saveCart(filteredItems);
    return this.calculateCart(filteredItems);
  }

  // Update item quantity
  updateQuantity(productId: string, quantity: number): Cart {
    const cart = this.getCart();
    const itemIndex = cart.items.findIndex(item => item.product.id === productId);

    if (itemIndex >= 0) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }
    }

    this.saveCart(cart.items);
    return this.calculateCart(cart.items);
  }

  // Clear entire cart
  clearCart(): Cart {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
    this.notifyListeners();
    return { items: [], total: 0, itemCount: 0 };
  }

  // Check if product is in cart
  isInCart(productId: string): boolean {
    const cart = this.getCart();
    return cart.items.some(item => item.product.id === productId);
  }

  // Get item quantity for a specific product
  getItemQuantity(productId: string): number {
    const cart = this.getCart();
    const item = cart.items.find(item => item.product.id === productId);
    return item?.quantity || 0;
  }

  // Subscribe to cart changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify all listeners of cart changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('Error in cart listener:', error);
      }
    });
  }

  // Convert cart to order items format
  toOrderItems(): Array<{
    productId: string;
    quantity: number;
    metadata?: any;
  }> {
    const cart = this.getCart();
    return cart.items.map(item => ({
      productId: item.product.id,
      quantity: item.quantity,
      metadata: item.metadata,
    }));
  }

  // Check stock availability for cart items
  checkStockAvailability(): { isValid: boolean; issues: string[] } {
    const cart = this.getCart();
    const issues: string[] = [];

    for (const item of cart.items) {
      // Check if product is still active
      if (!item.product.isActive) {
        issues.push(`${item.product.title} is no longer available`);
        continue;
      }

      // Check stock for physical products
      if (item.product.stock !== null && item.product.stock < item.quantity) {
        issues.push(`Only ${item.product.stock} ${item.product.title} available (you have ${item.quantity} in cart)`);
      }
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  }

  // Format price helper
  formatPrice(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  }

  // Get cart summary for display
  getCartSummary(): {
    itemCount: number;
    total: string;
    isEmpty: boolean;
  } {
    const cart = this.getCart();
    
    return {
      itemCount: cart.itemCount,
      total: this.formatPrice(cart.total),
      isEmpty: cart.items.length === 0,
    };
  }
}

// Export singleton instance
export const cartManager = new CartManager();

// React hook for using cart state
export function useCart() {
  const [cart, setCart] = React.useState(() => cartManager.getCart());

  React.useEffect(() => {
    const unsubscribe = cartManager.subscribe(() => {
      setCart(cartManager.getCart());
    });

    return unsubscribe;
  }, []);

  return {
    cart,
    addItem: cartManager.addItem.bind(cartManager),
    removeItem: cartManager.removeItem.bind(cartManager),
    updateQuantity: cartManager.updateQuantity.bind(cartManager),
    clearCart: cartManager.clearCart.bind(cartManager),
    isInCart: cartManager.isInCart.bind(cartManager),
    getItemQuantity: cartManager.getItemQuantity.bind(cartManager),
    toOrderItems: cartManager.toOrderItems.bind(cartManager),
    checkStockAvailability: cartManager.checkStockAvailability.bind(cartManager),
    formatPrice: cartManager.formatPrice.bind(cartManager),
    getCartSummary: cartManager.getCartSummary.bind(cartManager),
  };
}

// Import React for the hook
import React from 'react';