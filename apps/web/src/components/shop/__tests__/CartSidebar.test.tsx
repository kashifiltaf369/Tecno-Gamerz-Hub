import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CartSidebar } from '../CartSidebar';
import { useCart } from '../../../lib/cart';
import * as shopService from '../../../lib/services/shop-service';

// Mock the cart hook
jest.mock('../../../lib/cart');

// Mock the shop service
jest.mock('../../../lib/services/shop-service');

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock Stripe elements
jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => Promise.resolve({
    confirmPayment: jest.fn(),
  })),
}));

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;
const mockShopService = shopService as jest.Mocked<typeof shopService>;

describe('CartSidebar', () => {
  const mockRemoveItem = jest.fn();
  const mockUpdateQuantity = jest.fn();
  const mockClearCart = jest.fn();
  const mockOnClose = jest.fn();

  const mockCartItems = [
    {
      productId: '1',
      quantity: 2,
      price: 9999, // $99.99
      name: 'Gaming Headset',
      imageUrl: 'https://example.com/headset.jpg',
    },
    {
      productId: '2',
      quantity: 1,
      price: 4999, // $49.99
      name: 'Gaming Mouse',
      imageUrl: 'https://example.com/mouse.jpg',
    },
  ];

  beforeEach(() => {
    mockUseCart.mockReturnValue({
      items: mockCartItems,
      totalItems: 3,
      totalAmount: 24997, // (99.99 * 2) + 49.99 = 249.97
      addItem: jest.fn(),
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      clearCart: mockClearCart,
    });

    mockShopService.createOrder = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders cart items correctly', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument();
    expect(screen.getByText('Gaming Headset')).toBeInTheDocument();
    expect(screen.getByText('Gaming Mouse')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('displays correct total amount', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('$249.97')).toBeInTheDocument();
  });

  it('shows empty cart message when cart is empty', () => {
    mockUseCart.mockReturnValue({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    });

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Add some awesome gaming gear to get started!')).toBeInTheDocument();
  });

  it('calls updateQuantity when quantity is changed', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const quantityInputs = screen.getAllByDisplayValue('2');
    const firstQuantityInput = quantityInputs[0];

    fireEvent.change(firstQuantityInput, { target: { value: '3' } });

    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 3);
  });

  it('calls removeItem when remove button is clicked', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    expect(mockRemoveItem).toHaveBeenCalledWith('1');
  });

  it('prevents quantity from being set to negative values', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const quantityInputs = screen.getAllByDisplayValue('2');
    const firstQuantityInput = quantityInputs[0];

    fireEvent.change(firstQuantityInput, { target: { value: '-1' } });

    // Should not call updateQuantity with negative value
    expect(mockUpdateQuantity).not.toHaveBeenCalledWith('1', -1);
  });

  it('handles quantity input of 0 by removing item', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const quantityInputs = screen.getAllByDisplayValue('2');
    const firstQuantityInput = quantityInputs[0];

    fireEvent.change(firstQuantityInput, { target: { value: '0' } });

    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 0);
  });

  it('shows checkout button when cart has items', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
  });

  it('hides checkout button when cart is empty', () => {
    mockUseCart.mockReturnValue({
      items: [],
      totalItems: 0,
      totalAmount: 0,
      addItem: jest.fn(),
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    });

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.queryByText('Proceed to Checkout')).not.toBeInTheDocument();
  });

  it('closes sidebar when close button is clicked', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const closeButton = screen.getByLabelText('Close cart');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('closes sidebar when overlay is clicked', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const overlay = screen.getByTestId('cart-overlay');
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('does not close sidebar when clicking inside the sidebar content', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const sidebarContent = screen.getByText('Shopping Cart').closest('div');
    if (sidebarContent) {
      fireEvent.click(sidebarContent);
    }

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('initiates checkout process when checkout button is clicked', async () => {
    const mockOrder = {
      id: 'order-1',
      clientSecret: 'pi_test_secret',
    };

    mockShopService.createOrder.mockResolvedValue(mockOrder);

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const checkoutButton = screen.getByText('Proceed to Checkout');
    fireEvent.click(checkoutButton);

    await waitFor(() => {
      expect(mockShopService.createOrder).toHaveBeenCalledWith({
        items: mockCartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
    });
  });

  it('shows loading state during checkout', async () => {
    mockShopService.createOrder.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const checkoutButton = screen.getByText('Proceed to Checkout');
    fireEvent.click(checkoutButton);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
  });

  it('handles checkout errors gracefully', async () => {
    mockShopService.createOrder.mockRejectedValue(new Error('Payment failed'));

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    const checkoutButton = screen.getByText('Proceed to Checkout');
    fireEvent.click(checkoutButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to process checkout. Please try again.')).toBeInTheDocument();
    });
  });

  it('formats item prices correctly', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    // Check individual item prices
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('calculates line totals correctly', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    // For Gaming Headset: 2 × $99.99 = $199.98
    expect(screen.getByText('$199.98')).toBeInTheDocument();
    // For Gaming Mouse: 1 × $49.99 = $49.99
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('shows correct item count in header', () => {
    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Shopping Cart (3)')).toBeInTheDocument();
  });

  it('handles very large quantities correctly', () => {
    const largeQuantityItems = [{
      ...mockCartItems[0],
      quantity: 999,
    }];

    mockUseCart.mockReturnValue({
      items: largeQuantityItems,
      totalItems: 999,
      totalAmount: 9989001, // 999 × 9999
      addItem: jest.fn(),
      removeItem: mockRemoveItem,
      updateQuantity: mockUpdateQuantity,
      clearCart: mockClearCart,
    });

    render(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByDisplayValue('999')).toBeInTheDocument();
    expect(screen.getByText('$99,890.01')).toBeInTheDocument(); // Formatted with commas
  });

  it('is not visible when isOpen is false', () => {
    render(<CartSidebar isOpen={false} onClose={mockOnClose} />);

    expect(screen.queryByText('Shopping Cart')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes for open/closed states', () => {
    const { rerender } = render(<CartSidebar isOpen={false} onClose={mockOnClose} />);

    let sidebar = screen.queryByRole('dialog');
    expect(sidebar).toHaveClass('translate-x-full');

    rerender(<CartSidebar isOpen={true} onClose={mockOnClose} />);

    sidebar = screen.getByRole('dialog');
    expect(sidebar).toHaveClass('translate-x-0');
  });
});