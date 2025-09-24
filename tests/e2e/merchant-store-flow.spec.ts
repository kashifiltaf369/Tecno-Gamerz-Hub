/**
 * End-to-End Tests for Merchant Store User Flow
 * 
 * This test suite simulates real user interactions with the merchant store
 * from browsing products to completing purchases.
 */

import { test, expect } from '@playwright/test';
import { Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_URL = process.env.API_URL || 'http://localhost:4000';

// Test user credentials
const TEST_USER = {
  email: 'testuser@example.com',
  password: 'TestPassword123!',
  name: 'Test User'
};

test.describe('Merchant Store End-to-End Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL);
    
    // Login or create test user
    await loginTestUser(page);
  });

  test('Complete Purchase Flow - Digital Product', async ({ page }) => {
    // Step 1: Navigate to shop
    await test.step('Navigate to shop page', async () => {
      await page.click('nav a[href="/shop"]');
      await page.waitForSelector('[data-testid="product-grid"]');
      await expect(page).toHaveURL(/.*\/shop/);
    });

    // Step 2: Browse products and filter
    await test.step('Browse and filter products', async () => {
      // Check if products are loaded
      await expect(page.locator('[data-testid="product-card"]')).toHaveCount.greaterThan(0);
      
      // Filter by digital products
      await page.click('[data-testid="filter-digital"]');
      await page.waitForSelector('[data-testid="product-card"][data-type="DIGITAL"]');
      
      // Verify only digital products are shown
      const productCards = page.locator('[data-testid="product-card"]');
      const count = await productCards.count();
      
      for (let i = 0; i < count; i++) {
        await expect(productCards.nth(i)).toHaveAttribute('data-type', 'DIGITAL');
      }
    });

    // Step 3: Select a digital product
    let selectedProduct: any;
    await test.step('Select digital product', async () => {
      const firstDigitalProduct = page.locator('[data-testid="product-card"][data-type="DIGITAL"]').first();
      
      // Get product details
      selectedProduct = {
        name: await firstDigitalProduct.locator('[data-testid="product-name"]').textContent(),
        price: await firstDigitalProduct.locator('[data-testid="product-price"]').textContent(),
      };
      
      // Add to cart
      await firstDigitalProduct.locator('[data-testid="add-to-cart"]').click();
      
      // Wait for success feedback
      await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1');
    });

    // Step 4: Open cart and verify contents
    await test.step('Verify cart contents', async () => {
      await page.click('[data-testid="cart-button"]');
      await page.waitForSelector('[data-testid="cart-sidebar"]');
      
      // Check product in cart
      await expect(page.locator('[data-testid="cart-item-name"]')).toHaveText(selectedProduct.name);
      await expect(page.locator('[data-testid="cart-item-price"]')).toHaveText(selectedProduct.price);
      await expect(page.locator('[data-testid="cart-total"]')).toContainText(selectedProduct.price);
    });

    // Step 5: Proceed to checkout
    await test.step('Proceed to checkout', async () => {
      await page.click('[data-testid="checkout-button"]');
      await page.waitForSelector('[data-testid="payment-form"]');
    });

    // Step 6: Complete payment (using test card)
    await test.step('Complete payment', async () => {
      // Fill in test card details
      await page.fill('[data-testid="card-number"]', '4242424242424242');
      await page.fill('[data-testid="card-expiry"]', '12/25');
      await page.fill('[data-testid="card-cvc"]', '123');
      await page.fill('[data-testid="card-name"]', TEST_USER.name);
      
      // Submit payment
      await page.click('[data-testid="pay-button"]');
      
      // Wait for payment processing
      await page.waitForSelector('[data-testid="payment-success"]', { timeout: 30000 });
      await expect(page.locator('[data-testid="payment-success"]')).toBeVisible();
    });

    // Step 7: Verify order completion and digital fulfillment
    await test.step('Verify order completion', async () => {
      // Should redirect to order confirmation
      await expect(page).toHaveURL(/.*\/orders\/.*\/confirmation/);
      
      // Check order details
      await expect(page.locator('[data-testid="order-status"]')).toHaveText('Completed');
      await expect(page.locator('[data-testid="order-product-name"]')).toHaveText(selectedProduct.name);
      
      // For digital products, check if fulfillment message is shown
      await expect(page.locator('[data-testid="digital-fulfillment"]')).toBeVisible();
    });

    // Step 8: Verify cart is cleared
    await test.step('Verify cart is cleared', async () => {
      await expect(page.locator('[data-testid="cart-count"]')).toHaveText('0');
    });
  });

  test('Complete Purchase Flow - Physical Product', async ({ page }) => {
    // Step 1: Navigate to shop and select physical product
    await page.goto(`${BASE_URL}/shop`);
    await page.waitForSelector('[data-testid="product-grid"]');
    
    // Filter by physical products
    await page.click('[data-testid="filter-physical"]');
    await page.waitForSelector('[data-testid="product-card"][data-type="PHYSICAL"]');
    
    const firstPhysicalProduct = page.locator('[data-testid="product-card"][data-type="PHYSICAL"]').first();
    
    // Check stock availability
    const stockText = await firstPhysicalProduct.locator('[data-testid="product-stock"]').textContent();
    expect(stockText).toMatch(/Stock: \d+/);
    
    const selectedProduct = {
      name: await firstPhysicalProduct.locator('[data-testid="product-name"]').textContent(),
      price: await firstPhysicalProduct.locator('[data-testid="product-price"]').textContent(),
    };
    
    // Add to cart
    await firstPhysicalProduct.locator('[data-testid="add-to-cart"]').click();
    
    // Step 2: Modify quantity in cart
    await page.click('[data-testid="cart-button"]');
    await page.waitForSelector('[data-testid="cart-sidebar"]');
    
    // Increase quantity
    await page.click('[data-testid="quantity-increase"]');
    await expect(page.locator('[data-testid="quantity-input"]')).toHaveValue('2');
    
    // Verify total is updated
    const totalElement = page.locator('[data-testid="cart-total"]');
    const totalText = await totalElement.textContent();
    expect(totalText).toBeTruthy();
    
    // Step 3: Complete checkout with shipping address
    await page.click('[data-testid="checkout-button"]');
    await page.waitForSelector('[data-testid="payment-form"]');
    
    // Fill shipping address for physical product
    await page.fill('[data-testid="shipping-name"]', TEST_USER.name);
    await page.fill('[data-testid="shipping-address"]', '123 Test Street');
    await page.fill('[data-testid="shipping-city"]', 'Test City');
    await page.fill('[data-testid="shipping-zip"]', '12345');
    await page.fill('[data-testid="shipping-country"]', 'US');
    
    // Fill payment details and complete
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.fill('[data-testid="card-name"]', TEST_USER.name);
    
    await page.click('[data-testid="pay-button"]');
    
    // Wait for success
    await page.waitForSelector('[data-testid="payment-success"]', { timeout: 30000 });
    
    // Verify order shows physical fulfillment info
    await expect(page.locator('[data-testid="shipping-info"]')).toBeVisible();
    await expect(page.locator('[data-testid="tracking-info"]')).toBeVisible();
  });

  test('Shopping Cart Management', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`);
    await page.waitForSelector('[data-testid="product-grid"]');
    
    // Add multiple products to cart
    const productCards = page.locator('[data-testid="product-card"]');
    const productCount = Math.min(await productCards.count(), 3);
    
    for (let i = 0; i < productCount; i++) {
      await productCards.nth(i).locator('[data-testid="add-to-cart"]').click();
      await page.waitForTimeout(500); // Brief pause between additions
    }
    
    // Verify cart count
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText(productCount.toString());
    
    // Open cart
    await page.click('[data-testid="cart-button"]');
    await page.waitForSelector('[data-testid="cart-sidebar"]');
    
    // Verify all items in cart
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems).toHaveCount(productCount);
    
    // Remove an item
    await cartItems.first().locator('[data-testid="remove-item"]').click();
    await expect(cartItems).toHaveCount(productCount - 1);
    
    // Update quantity
    const quantityInput = cartItems.first().locator('[data-testid="quantity-input"]');
    await quantityInput.clear();
    await quantityInput.fill('3');
    await quantityInput.blur();
    
    // Verify total is recalculated
    await expect(page.locator('[data-testid="cart-total"]')).not.toHaveText('$0.00');
    
    // Clear entire cart
    await page.click('[data-testid="clear-cart"]');
    await expect(page.locator('[data-testid="empty-cart-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('0');
  });

  test('Product Search and Filtering', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`);
    await page.waitForSelector('[data-testid="product-grid"]');
    
    // Test search functionality
    await page.fill('[data-testid="search-input"]', 'gaming');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Verify search results contain the search term
    const searchResults = page.locator('[data-testid="product-card"]');
    const resultCount = await searchResults.count();
    
    if (resultCount > 0) {
      for (let i = 0; i < Math.min(resultCount, 3); i++) {
        const productName = await searchResults.nth(i).locator('[data-testid="product-name"]').textContent();
        const productDesc = await searchResults.nth(i).locator('[data-testid="product-description"]').textContent();
        
        expect(
          productName?.toLowerCase().includes('gaming') ||
          productDesc?.toLowerCase().includes('gaming')
        ).toBeTruthy();
      }
    }
    
    // Test category filtering
    await page.click('[data-testid="category-cosmetics"]');
    await page.waitForTimeout(1000);
    
    const cosmeticProducts = page.locator('[data-testid="product-card"][data-category="cosmetics"]');
    const cosmeticCount = await cosmeticProducts.count();
    
    if (cosmeticCount > 0) {
      await expect(cosmeticProducts.first()).toBeVisible();
    }
    
    // Test rarity filtering
    await page.click('[data-testid="rarity-epic"]');
    await page.waitForTimeout(1000);
    
    const epicProducts = page.locator('[data-testid="product-card"][data-rarity="epic"]');
    const epicCount = await epicProducts.count();
    
    if (epicCount > 0) {
      await expect(epicProducts.first()).toBeVisible();
    }
  });

  test('Order History and Management', async ({ page }) => {
    // First create an order (simplified)
    await page.goto(`${BASE_URL}/shop`);
    await page.waitForSelector('[data-testid="product-grid"]');
    
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('[data-testid="add-to-cart"]').click();
    
    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="checkout-button"]');
    
    // Complete quick checkout (minimal details for test)
    await page.fill('[data-testid="card-number"]', '4242424242424242');
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.fill('[data-testid="card-name"]', TEST_USER.name);
    
    await page.click('[data-testid="pay-button"]');
    await page.waitForSelector('[data-testid="payment-success"]');
    
    // Navigate to order history
    await page.goto(`${BASE_URL}/orders`);
    await page.waitForSelector('[data-testid="order-history"]');
    
    // Verify order appears in history
    const orderItems = page.locator('[data-testid="order-item"]');
    await expect(orderItems).toHaveCount.greaterThan(0);
    
    // Click on first order to view details
    await orderItems.first().click();
    await page.waitForSelector('[data-testid="order-details"]');
    
    // Verify order details are shown
    await expect(page.locator('[data-testid="order-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="order-items"]')).toBeVisible();
    
    // Test order filtering
    await page.goto(`${BASE_URL}/orders`);
    await page.selectOption('[data-testid="status-filter"]', 'COMPLETED');
    await page.waitForTimeout(1000);
    
    // Verify only completed orders are shown
    const completedOrders = page.locator('[data-testid="order-item"]');
    const completedCount = await completedOrders.count();
    
    for (let i = 0; i < completedCount; i++) {
      await expect(completedOrders.nth(i).locator('[data-testid="order-status"]')).toHaveText('Completed');
    }
  });

  test('Error Handling and Edge Cases', async ({ page }) => {
    await page.goto(`${BASE_URL}/shop`);
    await page.waitForSelector('[data-testid="product-grid"]');
    
    // Test adding out-of-stock item
    const outOfStockProduct = page.locator('[data-testid="product-card"][data-stock="0"]').first();
    
    if (await outOfStockProduct.count() > 0) {
      const addButton = outOfStockProduct.locator('[data-testid="add-to-cart"]');
      await expect(addButton).toBeDisabled();
      await expect(outOfStockProduct.locator('[data-testid="out-of-stock"]')).toBeVisible();
    }
    
    // Test payment with invalid card
    const availableProduct = page.locator('[data-testid="product-card"][data-stock!="0"]').first();
    await availableProduct.locator('[data-testid="add-to-cart"]').click();
    
    await page.click('[data-testid="cart-button"]');
    await page.click('[data-testid="checkout-button"]');
    
    // Use invalid card number
    await page.fill('[data-testid="card-number"]', '4000000000000002'); // Declined card
    await page.fill('[data-testid="card-expiry"]', '12/25');
    await page.fill('[data-testid="card-cvc"]', '123');
    await page.fill('[data-testid="card-name"]', TEST_USER.name);
    
    await page.click('[data-testid="pay-button"]');
    
    // Expect error message
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible();
    
    // Test network error handling (if applicable)
    // This would require intercepting network requests
  });

  test('Mobile Responsive Experience', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${BASE_URL}/shop`);
    await page.waitForSelector('[data-testid="product-grid"]');
    
    // Verify mobile layout
    const productGrid = page.locator('[data-testid="product-grid"]');
    await expect(productGrid).toHaveCSS('grid-template-columns', /.*1fr.*/); // Single column on mobile
    
    // Test mobile navigation
    await page.click('[data-testid="mobile-menu-button"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Test mobile cart
    const firstProduct = page.locator('[data-testid="product-card"]').first();
    await firstProduct.locator('[data-testid="add-to-cart"]').click();
    
    await page.click('[data-testid="cart-button"]');
    
    // Cart should be full-screen on mobile
    const cartSidebar = page.locator('[data-testid="cart-sidebar"]');
    await expect(cartSidebar).toHaveCSS('width', /100%|100vw/);
    
    // Test mobile checkout flow
    await page.click('[data-testid="checkout-button"]');
    
    // Form should be mobile-optimized
    const paymentForm = page.locator('[data-testid="payment-form"]');
    await expect(paymentForm).toBeVisible();
  });

  // Helper function to login test user
  async function loginTestUser(page: Page) {
    // Check if already logged in
    const loginButton = page.locator('[data-testid="login-button"]');
    
    if (await loginButton.count() > 0) {
      await loginButton.click();
      
      // Fill login form
      await page.fill('[data-testid="email-input"]', TEST_USER.email);
      await page.fill('[data-testid="password-input"]', TEST_USER.password);
      await page.click('[data-testid="submit-login"]');
      
      // Wait for successful login
      await page.waitForSelector('[data-testid="user-menu"]');
    }
  }
});