/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductCard } from '../ProductCard';
import { useCart } from '../../../lib/cart';
import { ProductType } from '@prisma/client';
import '@testing-library/jest-dom';

// Mock the cart hook
jest.mock('../../../lib/cart');
const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

describe('ProductCard', () => {
  const mockAddItem = jest.fn();
  const mockCartHook = {
    addItem: mockAddItem,
    items: [],
    totalItems: 0,
    totalPrice: 0,
    updateQuantity: jest.fn(),
    removeItem: jest.fn(),
    clearCart: jest.fn(),
  };

  const mockDigitalProduct = {
    id: 'product_1',
    name: 'Epic Gaming Skin',
    description: 'Transform your character with this legendary skin',
    price: 29.99,
    type: ProductType.DIGITAL_COSMETIC,
    category: 'Skins',
    imageUrl: 'https://example.com/skin.jpg',
    stock: null,
    isActive: true,
    metadata: { rarity: 'legendary', badgeId: 'epic_skin_badge' },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockPhysicalProduct = {
    id: 'product_2',
    name: 'Gaming Headset Pro',
    description: 'Professional gaming headset with surround sound',
    price: 199.99,
    type: ProductType.PHYSICAL_MERCHANDISE,
    category: 'Hardware',
    imageUrl: 'https://example.com/headset.jpg',
    stock: 15,
    isActive: true,
    metadata: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    mockUseCart.mockReturnValue(mockCartHook);
    jest.clearAllMocks();
  });

  it('renders digital product correctly', () => {
    render(<ProductCard product={mockDigitalProduct} />);

    expect(screen.getByText('Epic Gaming Skin')).toBeInTheDocument();
    expect(screen.getByText('Transform your character with this legendary skin')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('Digital')).toBeInTheDocument();
    expect(screen.getByText('Skins')).toBeInTheDocument();
  });

  it('renders physical product correctly', () => {
    render(<ProductCard product={mockPhysicalProduct} />);

    expect(screen.getByText('Gaming Headset Pro')).toBeInTheDocument();
    expect(screen.getByText('Professional gaming headset with surround sound')).toBeInTheDocument();
    expect(screen.getByText('$199.99')).toBeInTheDocument();
    expect(screen.getByText('Physical')).toBeInTheDocument();
    expect(screen.getByText('Hardware')).toBeInTheDocument();
    expect(screen.getByText('Stock: 15')).toBeInTheDocument();
  });

  it('shows "In Stock" for digital products', () => {
    render(<ProductCard product={mockDigitalProduct} />);

    expect(screen.getByText('In Stock')).toBeInTheDocument();
  });

  it('shows "Out of Stock" for physical products with zero stock', () => {
    const outOfStockProduct = { ...mockPhysicalProduct, stock: 0 };
    render(<ProductCard product={outOfStockProduct} />);

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('displays rarity badge for products with rarity metadata', () => {
    render(<ProductCard product={mockDigitalProduct} />);

    expect(screen.getByText('legendary')).toBeInTheDocument();
  });

  it('adds product to cart when "Add to Cart" is clicked', async () => {
    render(<ProductCard product={mockDigitalProduct} />);

    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith(mockDigitalProduct, 1);
    });
  });

  it('disables "Add to Cart" button for out of stock physical products', () => {
    const outOfStockProduct = { ...mockPhysicalProduct, stock: 0 };
    render(<ProductCard product={outOfStockProduct} />);

    const addToCartButton = screen.getByText('Out of Stock');
    expect(addToCartButton).toBeDisabled();
  });

  it('disables "Add to Cart" button for inactive products', () => {
    const inactiveProduct = { ...mockDigitalProduct, isActive: false };
    render(<ProductCard product={inactiveProduct} />);

    const addToCartButton = screen.getByText('Unavailable');
    expect(addToCartButton).toBeDisabled();
  });

  it('shows loading state when adding to cart', async () => {
    // Mock a delayed add to cart
    mockAddItem.mockImplementation(() => {
      return new Promise(resolve => setTimeout(resolve, 100));
    });

    render(<ProductCard product={mockDigitalProduct} />);

    const addToCartButton = screen.getByText('Add to Cart');
    fireEvent.click(addToCartButton);

    // Should show loading state
    expect(screen.getByText('Adding...')).toBeInTheDocument();

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('Add to Cart')).toBeInTheDocument();
    }, { timeout: 200 });
  });

  it('handles product image error gracefully', () => {
    render(<ProductCard product={mockDigitalProduct} />);

    const image = screen.getByAltText('Epic Gaming Skin');
    
    // Simulate image load error
    fireEvent.error(image);

    // Should still render the card without crashing
    expect(screen.getByText('Epic Gaming Skin')).toBeInTheDocument();
  });

  it('truncates long product descriptions', () => {
    const longDescriptionProduct = {
      ...mockDigitalProduct,
      description: 'This is a very long description that should be truncated when it exceeds the maximum character limit for display in the product card component to maintain good UI design and readability.',
    };

    render(<ProductCard product={longDescriptionProduct} />);

    const description = screen.getByText(/This is a very long description/);
    expect(description).toBeInTheDocument();
  });

  it('formats price correctly for different currencies', () => {
    const expensiveProduct = { ...mockDigitalProduct, price: 1299.99 };
    render(<ProductCard product={expensiveProduct} />);

    expect(screen.getByText('$1299.99')).toBeInTheDocument();
  });

  it('handles free products (price = 0)', () => {
    const freeProduct = { ...mockDigitalProduct, price: 0 };
    render(<ProductCard product={freeProduct} />);

    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  describe('accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<ProductCard product={mockDigitalProduct} />);

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', expect.stringContaining('Epic Gaming Skin'));
    });

    it('has keyboard navigation support', () => {
      render(<ProductCard product={mockDigitalProduct} />);

      const addToCartButton = screen.getByText('Add to Cart');
      expect(addToCartButton).toHaveAttribute('tabIndex', '0');
    });

    it('has proper alt text for images', () => {
      render(<ProductCard product={mockDigitalProduct} />);

      const image = screen.getByAltText('Epic Gaming Skin');
      expect(image).toBeInTheDocument();
    });
  });

  describe('responsive design', () => {
    it('applies correct CSS classes for mobile layout', () => {
      render(<ProductCard product={mockDigitalProduct} />);

      const card = screen.getByRole('article');
      expect(card).toHaveClass('rounded-lg', 'shadow-md', 'hover:shadow-lg');
    });
  });

  describe('edge cases', () => {
    it('handles products with missing image URLs', () => {
      const noImageProduct = { ...mockDigitalProduct, imageUrl: null };
      render(<ProductCard product={noImageProduct} />);

      expect(screen.getByText('Epic Gaming Skin')).toBeInTheDocument();
    });

    it('handles products with very long names', () => {
      const longNameProduct = {
        ...mockDigitalProduct,
        name: 'Super Ultra Mega Epic Legendary Mythical Gaming Skin with Extended Features and Bonus Content',
      };

      render(<ProductCard product={longNameProduct} />);

      expect(screen.getByText(/Super Ultra Mega Epic Legendary/)).toBeInTheDocument();
    });

    it('handles products with null metadata gracefully', () => {
      const noMetadataProduct = { ...mockDigitalProduct, metadata: null };
      render(<ProductCard product={noMetadataProduct} />);

      expect(screen.getByText('Epic Gaming Skin')).toBeInTheDocument();
      expect(screen.queryByText('legendary')).not.toBeInTheDocument();
    });
  });
});