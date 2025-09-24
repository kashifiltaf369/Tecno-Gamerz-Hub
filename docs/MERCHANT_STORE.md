# 🏪 Merchant Store System Documentation

## Overview

The Merchant Store System is a comprehensive e-commerce solution integrated into Tecno Gamerz Hub, enabling the sale of digital cosmetics, physical merchandise, and tournament-related items. The system features automatic digital goods fulfillment, inventory management, and seamless Stripe payment integration.

## Table of Contents

- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Backend API](#backend-api)
- [Frontend Components](#frontend-components)
- [Payment Integration](#payment-integration)
- [Digital Goods Fulfillment](#digital-goods-fulfillment)
- [Stock Management](#stock-management)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Architecture

The merchant store system follows a modular architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  Shop Pages  │  Cart Component  │  Product Components      │
│  (/shop)     │  (Sidebar)       │  (Cards, Filters)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (NestJS)                    │
├─────────────────────────────────────────────────────────────┤
│ Products Module │ Orders Module  │ Payments Module         │
│ • CRUD Ops      │ • Order Mgmt   │ • Stripe Integration    │
│ • Stock Mgmt    │ • Fulfillment  │ • Webhook Handling      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Database (PostgreSQL + Prisma)              │
├─────────────────────────────────────────────────────────────┤
│   Product   │    Order    │  OrderItem  │   Purchase      │
│   • Details │    • Status │   • Items   │   • Digital     │
│   • Stock   │    • Total  │   • Qty     │   • Tracking    │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema

### Product Model

```prisma
model Product {
  id            String      @id @default(cuid())
  name          String      // Product name
  description   String?     // Product description
  price         Float       // Price in USD
  type          ProductType // DIGITAL_COSMETIC, PHYSICAL_MERCHANDISE, TOURNAMENT_ITEM
  category      String?     // Category (Skins, Hardware, etc.)
  imageUrl      String?     // Product image URL
  stock         Int?        // Stock quantity (null for digital items)
  isActive      Boolean     @default(true) // Active/inactive status
  metadata      Json?       // Additional data (badges, cosmetics, etc.)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  OrderItem     OrderItem[] // Related order items
}

enum ProductType {
  DIGITAL_COSMETIC     // Skins, badges, cosmetics
  PHYSICAL_MERCHANDISE // T-shirts, hardware, etc.
  TOURNAMENT_ITEM      // Tournament-specific items
}
```

### Order Model

```prisma
model Order {
  id              String      @id @default(cuid())
  userId          String      // User who placed the order
  status          OrderStatus @default(PENDING)
  totalAmount     Float       // Total order amount
  stripeSessionId String?     // Stripe checkout session ID
  items           OrderItem[] // Order items
  user            User        @relation(fields: [userId], references: [id])
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

enum OrderStatus {
  PENDING    // Payment pending
  COMPLETED  // Order completed and fulfilled
  CANCELLED  // Order cancelled
  FAILED     // Payment failed
}
```

### OrderItem Model

```prisma
model OrderItem {
  id        String  @id @default(cuid())
  orderId   String  // Parent order ID
  productId String  // Product ID
  quantity  Int     // Quantity ordered
  price     Float   // Price at time of purchase
  order     Order   @relation(fields: [orderId], references: [id])
  product   Product @relation(fields: [productId], references: [id])
}
```

### Purchase Model

```prisma
model Purchase {
  id              String      @id @default(cuid())
  userId          String      // User who made the purchase
  orderId         String      // Related order ID
  productId       String      // Purchased product ID
  quantity        Int         // Quantity purchased
  totalAmount     Float       // Total amount for this item
  type            ProductType // Product type
  fulfilledAt     DateTime?   // When digital goods were fulfilled
  metadata        Json?       // Additional fulfillment data
  user            User        @relation(fields: [userId], references: [id])
  createdAt       DateTime    @default(now())
}
```

## Backend API

### Products Module

The Products module handles all product-related operations with comprehensive CRUD functionality.

#### ProductsService

```typescript
class ProductsService {
  // Create a new product (Admin only)
  async create(createProductDto: CreateProductDto): Promise<Product>

  // Get all products with filtering and pagination
  async findAll(query: ProductQueryDto): Promise<PaginatedResponse<Product>>

  // Get a single product by ID
  async findOne(id: string): Promise<Product>

  // Update a product (Admin only)
  async update(id: string, updateDto: UpdateProductDto): Promise<Product>

  // Soft delete a product (sets isActive = false)
  async remove(id: string): Promise<Product>

  // Stock management methods
  async reserveStock(productId: string, quantity: number): Promise<void>
  async restoreStock(productId: string, quantity: number): Promise<void>
  async validateStock(productId: string, quantity: number): Promise<boolean>
  async bulkReserveStock(items: { productId: string; quantity: number }[]): Promise<void>
  async bulkRestoreStock(items: { productId: string; quantity: number }[]): Promise<void>
}
```

#### ProductsController

```typescript
@Controller('products')
@ApiTags('Products')
export class ProductsController {
  @Get()
  @ApiOperation({ summary: 'Get all products' })
  async findAll(@Query() query: ProductQueryDto)

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findOne(@Param('id') id: string)

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Create product (Admin only)' })
  async create(@Body() createProductDto: CreateProductDto)

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Update product (Admin only)' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateProductDto)

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Delete product (Admin only)' })
  async remove(@Param('id') id: string)
}
```

### Orders Module

The Orders module manages the complete order lifecycle from creation to fulfillment.

#### OrdersService

```typescript
class OrdersService {
  // Create a new order with Stripe checkout
  async create(userId: string, createOrderDto: CreateOrderDto): Promise<{
    order: Order;
    checkoutUrl: string;
  }>

  // Get user orders with pagination
  async findAll(userId: string, query: OrderQueryDto): Promise<PaginatedResponse<Order>>

  // Get single order by ID
  async findOne(userId: string, orderId: string): Promise<Order>

  // Complete an order and fulfill digital goods
  async completeOrder(orderId: string): Promise<Order>

  // Cancel an order and restore stock
  async cancelOrder(orderId: string): Promise<Order>

  // Handle successful payment webhook
  async handlePaymentSuccess(sessionId: string): Promise<void>

  // Admin methods
  async getAllOrders(query: OrderQueryDto): Promise<PaginatedResponse<Order>>
  async getOrderStats(): Promise<OrderStats>
}
```

#### OrdersController

```typescript
@Controller('orders')
@ApiTags('Orders')
export class OrdersController {
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create new order' })
  async create(@GetUser() user: User, @Body() createOrderDto: CreateOrderDto)

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user orders' })
  async findAll(@GetUser() user: User, @Query() query: OrderQueryDto)

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get order by ID' })
  async findOne(@GetUser() user: User, @Param('id') id: string)

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Cancel order' })
  async cancel(@Param('id') id: string)
}
```

## Frontend Components

### Shop Page (`/shop`)

The main shop page displays all available products with filtering and search capabilities.

```typescript
// apps/web/src/app/shop/page.tsx
export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [loading, setLoading] = useState(true);

  // Fetch products with filters
  const fetchProducts = async () => {
    const response = await shopService.getProducts(filters);
    setProducts(response.products);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gaming Store</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <ProductFilters filters={filters} onFiltersChange={setFilters} />
        </div>
        
        {/* Products Grid */}
        <div className="lg:w-3/4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Shopping Cart Sidebar */}
      <CartSidebar />
    </div>
  );
}
```

### ProductCard Component

Displays individual products with add to cart functionality.

```typescript
// apps/web/src/components/shop/ProductCard.tsx
interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);
    try {
      await addItem(product, 1);
    } finally {
      setIsLoading(false);
    }
  };

  const isOutOfStock = product.type === ProductType.PHYSICAL_MERCHANDISE && 
                       product.stock === 0;
  const isDigital = product.type === ProductType.DIGITAL_COSMETIC;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="relative">
        <Image
          src={product.imageUrl || '/placeholder.jpg'}
          alt={product.name}
          width={300}
          height={200}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        
        {/* Product Type Badge */}
        <div className="absolute top-2 left-2">
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
            isDigital ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}>
            {isDigital ? 'Digital' : 'Physical'}
          </span>
        </div>

        {/* Rarity Badge (for digital items) */}
        {product.metadata?.rarity && (
          <div className="absolute top-2 right-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
              getRarityColor(product.metadata.rarity)
            }`}>
              {product.metadata.rarity}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{product.description}</p>
        
        <div className="flex justify-between items-center mb-3">
          <span className="text-2xl font-bold text-primary">
            {product.price === 0 ? 'Free' : `$${product.price.toFixed(2)}`}
          </span>
          <span className="text-sm text-gray-500">{product.category}</span>
        </div>

        {/* Stock Information */}
        <div className="mb-4">
          {isDigital ? (
            <span className="text-green-600 text-sm font-medium">In Stock</span>
          ) : (
            <span className={`text-sm font-medium ${
              isOutOfStock ? 'text-red-600' : 'text-green-600'
            }`}>
              {isOutOfStock ? 'Out of Stock' : `Stock: ${product.stock}`}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isLoading || isOutOfStock || !product.isActive}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            isLoading || isOutOfStock || !product.isActive
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
        >
          {isLoading
            ? 'Adding...'
            : isOutOfStock
            ? 'Out of Stock'
            : !product.isActive
            ? 'Unavailable'
            : 'Add to Cart'
          }
        </button>
      </div>
    </div>
  );
}
```

### CartSidebar Component

Manages the shopping cart with checkout functionality.

```typescript
// apps/web/src/components/shop/CartSidebar.tsx
export function CartSidebar() {
  const { items, totalPrice, totalItems, updateQuantity, removeItem, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      const response = await shopService.createOrder({ items: orderItems });
      
      // Redirect to Stripe checkout
      window.location.href = response.checkoutUrl;
    } catch (error) {
      console.error('Checkout failed:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      {/* Cart Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary-dark transition-colors z-50"
      >
        <ShoppingCartIcon className="w-6 h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-xl transform transition-transform z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Shopping Cart ({totalItems})</h2>
            <button onClick={() => setIsOpen(false)}>
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <p className="text-center text-gray-500 mt-8">Your cart is empty</p>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <CartItem
                    key={item.product.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
                >
                  {isCheckingOut ? 'Processing...' : 'Checkout'}
                </button>
                
                <button
                  onClick={clearCart}
                  className="w-full border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
```

## Payment Integration

### Stripe Checkout Flow

The merchant store uses Stripe Checkout for secure payment processing:

1. **Order Creation**: User creates an order with selected items
2. **Stock Reservation**: Physical product stock is temporarily reserved
3. **Stripe Session**: Checkout session is created with order details
4. **Payment**: User is redirected to Stripe Checkout
5. **Webhook**: Stripe sends webhook on successful payment
6. **Order Completion**: Order is marked complete and digital goods are fulfilled

### Webhook Handler

```typescript
// apps/api/src/payments/payments.controller.ts
@Post('stripe/webhook')
async handleStripeWebhook(
  @Req() request: Request,
  @Headers('stripe-signature') signature: string,
) {
  const event = this.paymentsService.validateWebhook(
    request.body,
    signature,
  );

  switch (event.type) {
    case 'checkout.session.completed':
      await this.ordersService.handlePaymentSuccess(
        event.data.object.id,
      );
      break;
    
    case 'checkout.session.expired':
      await this.ordersService.cancelOrder(
        event.data.object.metadata.orderId,
      );
      break;
  }

  return { received: true };
}
```

## Digital Goods Fulfillment

### Automatic Fulfillment Process

When a digital order is completed, the system automatically grants digital items to the user:

```typescript
async fulfillDigitalGoods(order: Order, user: User): Promise<void> {
  for (const item of order.items) {
    if (item.product.type === ProductType.DIGITAL_COSMETIC) {
      const metadata = item.product.metadata as DigitalItemMetadata;
      
      // Grant badges
      if (metadata.badgeId) {
        await this.usersService.addBadge(user.id, metadata.badgeId);
      }
      
      // Grant cosmetics
      if (metadata.cosmeticId) {
        await this.usersService.addCosmetic(user.id, metadata.cosmeticId);
      }
      
      // Create purchase record
      await this.prisma.purchase.create({
        data: {
          userId: user.id,
          orderId: order.id,
          productId: item.product.id,
          quantity: item.quantity,
          totalAmount: item.price * item.quantity,
          type: item.product.type,
          fulfilledAt: new Date(),
          metadata: {
            badgeId: metadata.badgeId,
            cosmeticId: metadata.cosmeticId,
          },
        },
      });
    }
  }
}
```

### Digital Item Metadata Structure

```typescript
interface DigitalItemMetadata {
  badgeId?: string;          // Badge to grant
  cosmeticId?: string;       // Cosmetic to grant
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  description?: string;       // Additional description
  previewUrl?: string;       // Preview image/video URL
  requirements?: {           // Unlock requirements
    level?: number;
    achievements?: string[];
  };
}
```

## Stock Management

### Physical Product Stock

Physical products have finite stock that must be managed carefully:

- **Stock Reservation**: When an order is created, stock is temporarily reserved
- **Stock Restoration**: If payment fails or order is cancelled, stock is restored
- **Stock Validation**: Before allowing checkout, system validates sufficient stock
- **Bulk Operations**: Multiple products can have stock reserved/restored in transactions

### Stock Management Methods

```typescript
// Reserve stock for multiple products atomically
async bulkReserveStock(items: { productId: string; quantity: number }[]): Promise<void> {
  await this.prisma.$transaction(async (tx) => {
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }

      // Digital products don't have stock
      if (product.stock === null) continue;

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      await tx.product.update({
        where: { id: item.productId },
        data: { stock: product.stock - item.quantity },
      });
    }
  });
}
```

## API Documentation

### Products Endpoints

#### GET /api/products

Get all products with optional filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `type`: Filter by product type
- `category`: Filter by category
- `search`: Search in name and description
- `isActive`: Filter by active status

**Response:**
```json
{
  "products": [
    {
      "id": "product_1",
      "name": "Epic Gaming Skin",
      "description": "Transform your character",
      "price": 29.99,
      "type": "DIGITAL_COSMETIC",
      "category": "Skins",
      "imageUrl": "https://example.com/skin.jpg",
      "stock": null,
      "isActive": true,
      "metadata": {
        "badgeId": "epic_skin_badge",
        "rarity": "epic"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 25,
  "totalPages": 3,
  "currentPage": 1,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

#### POST /api/products (Admin Only)

Create a new product.

**Request Body:**
```json
{
  "name": "Gaming Headset Pro",
  "description": "Professional gaming headset",
  "price": 199.99,
  "type": "PHYSICAL_MERCHANDISE",
  "category": "Hardware",
  "imageUrl": "https://example.com/headset.jpg",
  "stock": 50
}
```

### Orders Endpoints

#### POST /api/orders

Create a new order and get Stripe checkout URL.

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_1",
      "quantity": 1
    },
    {
      "productId": "product_2",
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "order": {
    "id": "order_1",
    "userId": "user_1",
    "status": "PENDING",
    "totalAmount": 259.97,
    "items": [...]
  },
  "checkoutUrl": "https://checkout.stripe.com/session_123"
}
```

#### GET /api/orders

Get user orders with pagination.

**Response:**
```json
{
  "orders": [...],
  "total": 10,
  "totalPages": 2,
  "currentPage": 1,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

## Testing

### Unit Tests

Comprehensive unit tests are provided for all major components:

#### Backend Tests
- **ProductsService**: CRUD operations, stock management, validation
- **OrdersService**: Order creation, payment handling, fulfillment

#### Frontend Tests
- **Cart Hook**: localStorage persistence, stock validation
- **ProductCard**: Rendering, interactions, accessibility

### Running Tests

```bash
# Backend tests
cd apps/api
npm test

# Frontend tests  
cd apps/web
npm test

# Coverage reports
npm run test:coverage
```

### Test Coverage Goals

- **Backend Services**: >90% coverage
- **Frontend Components**: >85% coverage
- **Critical Paths**: 100% coverage (payment, fulfillment)

## Deployment

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# JWT
JWT_SECRET=your-jwt-secret

# App URLs
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Feature Flags
ENABLE_DIGITAL_FULFILLMENT=true
ENABLE_STOCK_MANAGEMENT=true
```

### Database Migrations

```bash
# Generate Prisma client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Seed sample data
npm run db:seed
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured
- [ ] SSL certificates installed
- [ ] Error monitoring setup
- [ ] Performance monitoring
- [ ] Backup strategy implemented
- [ ] CDN configured for images

## Troubleshooting

### Common Issues

#### Stock Management Issues

**Problem**: Stock goes negative
**Solution**: Ensure all stock operations use database transactions

**Problem**: Stock not restored on payment failure
**Solution**: Check webhook configuration and error handling

#### Payment Integration Issues

**Problem**: Webhook not receiving events
**Solution**: Verify webhook URL and signature validation

**Problem**: Orders stuck in pending status
**Solution**: Check Stripe webhook logs and manual payment confirmation

#### Digital Fulfillment Issues

**Problem**: Digital items not granted
**Solution**: Check user service integration and metadata format

**Problem**: Duplicate digital items granted
**Solution**: Implement idempotency checks in fulfillment process

### Debug Commands

```bash
# Check order status
curl -H "Authorization: Bearer $TOKEN" \
     "$API_URL/orders/ORDER_ID"

# Check product stock
curl "$API_URL/products/PRODUCT_ID"

# Check user badges/cosmetics
curl -H "Authorization: Bearer $TOKEN" \
     "$API_URL/users/profile"
```

### Monitoring Queries

```sql
-- Check pending orders older than 1 hour
SELECT * FROM "Order" 
WHERE status = 'PENDING' 
AND "createdAt" < NOW() - INTERVAL '1 hour';

-- Check products with low stock
SELECT * FROM "Product" 
WHERE stock IS NOT NULL 
AND stock < 5;

-- Check recent digital fulfillments
SELECT * FROM "Purchase" 
WHERE type = 'DIGITAL_COSMETIC' 
AND "fulfilledAt" > NOW() - INTERVAL '1 day';
```

## Performance Optimization

### Database Indexing

```sql
-- Product search performance
CREATE INDEX idx_product_search ON "Product" 
USING gin(to_tsvector('english', name || ' ' || description));

-- Order filtering
CREATE INDEX idx_order_user_status ON "Order" (userId, status, createdAt);

-- Stock lookups
CREATE INDEX idx_product_stock ON "Product" (stock) WHERE stock IS NOT NULL;
```

### Caching Strategy

- **Product Catalog**: Cache for 5 minutes (frequently updated)
- **User Cart**: localStorage + Redis for sync across devices
- **Stock Levels**: Real-time updates, no caching for accuracy
- **Images**: CDN with long-term caching

### Load Testing

Regular load testing scenarios:
- 100 concurrent users browsing products
- 50 concurrent checkout processes
- Peak traffic during sales events
- Webhook processing under high volume

## Security Considerations

### Input Validation

All endpoints use comprehensive validation:
- Price validation (positive numbers)
- Quantity limits (prevent abuse)
- User authorization checks
- Product availability verification

### Payment Security

- Stripe handles all card data (PCI compliant)
- Webhook signatures verified
- Order amount validation
- Idempotency keys for duplicate prevention

### Access Control

- Admin-only product management
- User-only order access
- Stock reservation prevents race conditions
- Digital fulfillment audit trail

## Future Enhancements

### Phase 2 Features

1. **Advanced Inventory Management**
   - Low stock alerts
   - Automatic reordering
   - Supplier management
   - Inventory forecasting

2. **Enhanced Digital Items**
   - Time-limited items
   - Bundle packages
   - Gifting system
   - Trade marketplace

3. **Analytics & Reporting**
   - Sales analytics dashboard
   - Customer behavior tracking
   - Inventory turnover reports
   - Revenue optimization

4. **Mobile Support**
   - React Native app
   - Push notifications for orders
   - Mobile-optimized checkout
   - Offline cart support

---

## Support

For technical support or questions about the merchant store system:

- **Documentation**: This file and inline code comments
- **API Reference**: Available at `/api/docs` (Swagger UI)
- **Issue Tracking**: GitHub Issues
- **Testing**: Comprehensive test suite in `__tests__` directories

---

*Last Updated: 2024-01-01*
*Version: 1.0.0*