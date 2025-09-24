import { renderHook, act } from '@testing-library/react';
import { useCart } from '../cart';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock window.localStorage
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.dispatchEvent
Object.defineProperty(window, 'dispatchEvent', {
  value: jest.fn(),
});

describe('useCart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should initialize with empty cart', () => {
    const { result } = renderHook(() => useCart());
    
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it('should load cart from localStorage on init', () => {
    const savedCart = [
      { productId: '1', quantity: 2, price: 100, name: 'Test Product', imageUrl: 'test.jpg' }
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(savedCart));

    const { result } = renderHook(() => useCart());
    
    expect(result.current.items).toEqual(savedCart);
    expect(result.current.totalItems).toBe(2);
    expect(result.current.totalAmount).toBe(200);
  });

  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart());
    
    const newItem = {
      productId: '1',
      quantity: 1,
      price: 100,
      name: 'Test Product',
      imageUrl: 'test.jpg'
    };

    act(() => {
      result.current.addItem(newItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(newItem);
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalAmount).toBe(100);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('should update quantity when adding existing item', () => {
    const existingItem = {
      productId: '1',
      quantity: 1,
      price: 100,
      name: 'Test Product',
      imageUrl: 'test.jpg'
    };

    localStorageMock.getItem.mockReturnValue(JSON.stringify([existingItem]));
    
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.addItem({
        ...existingItem,
        quantity: 2
      });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3);
    expect(result.current.totalItems).toBe(3);
    expect(result.current.totalAmount).toBe(300);
  });

  it('should remove item from cart', () => {
    const existingItems = [
      { productId: '1', quantity: 2, price: 100, name: 'Product 1', imageUrl: 'test1.jpg' },
      { productId: '2', quantity: 1, price: 50, name: 'Product 2', imageUrl: 'test2.jpg' }
    ];
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingItems));
    
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.removeItem('1');
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].productId).toBe('2');
    expect(result.current.totalItems).toBe(1);
    expect(result.current.totalAmount).toBe(50);
  });

  it('should update item quantity', () => {
    const existingItems = [
      { productId: '1', quantity: 2, price: 100, name: 'Product 1', imageUrl: 'test1.jpg' }
    ];
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingItems));
    
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.updateQuantity('1', 5);
    });

    expect(result.current.items[0].quantity).toBe(5);
    expect(result.current.totalItems).toBe(5);
    expect(result.current.totalAmount).toBe(500);
  });

  it('should remove item when quantity is set to 0', () => {
    const existingItems = [
      { productId: '1', quantity: 2, price: 100, name: 'Product 1', imageUrl: 'test1.jpg' }
    ];
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingItems));
    
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.updateQuantity('1', 0);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it('should clear cart', () => {
    const existingItems = [
      { productId: '1', quantity: 2, price: 100, name: 'Product 1', imageUrl: 'test1.jpg' },
      { productId: '2', quantity: 1, price: 50, name: 'Product 2', imageUrl: 'test2.jpg' }
    ];
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingItems));
    
    const { result } = renderHook(() => useCart());

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalAmount).toBe(0);
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('tecno-gamerz-cart');
  });

  it('should calculate correct totals with multiple items', () => {
    const existingItems = [
      { productId: '1', quantity: 3, price: 100, name: 'Product 1', imageUrl: 'test1.jpg' },
      { productId: '2', quantity: 2, price: 75, name: 'Product 2', imageUrl: 'test2.jpg' },
      { productId: '3', quantity: 1, price: 200, name: 'Product 3', imageUrl: 'test3.jpg' }
    ];
    
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingItems));
    
    const { result } = renderHook(() => useCart());

    expect(result.current.totalItems).toBe(6); // 3 + 2 + 1
    expect(result.current.totalAmount).toBe(650); // (3*100) + (2*75) + (1*200)
  });

  it('should handle invalid localStorage data gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid json');
    
    const { result } = renderHook(() => useCart());
    
    expect(result.current.items).toEqual([]);
    expect(result.current.totalItems).toBe(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it('should persist cart changes to localStorage', () => {
    const { result } = renderHook(() => useCart());
    
    const newItem = {
      productId: '1',
      quantity: 1,
      price: 100,
      name: 'Test Product',
      imageUrl: 'test.jpg'
    };

    act(() => {
      result.current.addItem(newItem);
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'tecno-gamerz-cart',
      JSON.stringify([newItem])
    );
  });

  it('should dispatch storage event on cart changes', () => {
    const { result } = renderHook(() => useCart());
    
    const newItem = {
      productId: '1',
      quantity: 1,
      price: 100,
      name: 'Test Product',
      imageUrl: 'test.jpg'
    };

    act(() => {
      result.current.addItem(newItem);
    });

    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'storage'
      })
    );
  });

  it('should not add item with quantity 0 or negative', () => {
    const { result } = renderHook(() => useCart());
    
    const invalidItem = {
      productId: '1',
      quantity: 0,
      price: 100,
      name: 'Test Product',
      imageUrl: 'test.jpg'
    };

    act(() => {
      result.current.addItem(invalidItem);
    });

    expect(result.current.items).toHaveLength(0);
    
    act(() => {
      result.current.addItem({ ...invalidItem, quantity: -1 });
    });

    expect(result.current.items).toHaveLength(0);
  });
});