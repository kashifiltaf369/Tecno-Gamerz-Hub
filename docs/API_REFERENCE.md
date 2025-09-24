# 📚 Merchant Store API Reference

## Base URL
```
Development: http://localhost:4000
Production: https://api.yourdomain.com
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Products API

### GET /api/products
Get all products with optional filtering and pagination.

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `type` | ProductType | - | Filter by product type |
| `category` | string | - | Filter by category |
| `search` | string | - | Search in name/description |
| `isActive` | boolean | - | Filter by active status |

**Example Request:**
```bash
curl "http://localhost:4000/api/products?page=1&limit=5&type=DIGITAL_COSMETIC&search=skin"
```

**Response:**
```json
{
  "products": [
    {
      "id": "product_1",
      "name": "Epic Gaming Skin",
      "description": "Transform your character with this legendary skin",
      "price": 29.99,
      "type": "DIGITAL_COSMETIC",
      "category": "Skins",
      "imageUrl": "https://example.com/skin.jpg",
      "stock": null,
      "isActive": true,
      "metadata": {
        "rarity": "epic",
        "badgeId": "epic_skin_badge"
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

### GET /api/products/:id
Get a single product by ID.

**Example Request:**
```bash
curl "http://localhost:4000/api/products/product_1"
```

**Response:**
```json
{
  "id": "product_1",
  "name": "Epic Gaming Skin",
  "description": "Transform your character with this legendary skin",
  "price": 29.99,
  "type": "DIGITAL_COSMETIC",
  "category": "Skins",
  "imageUrl": "https://example.com/skin.jpg",
  "stock": null,
  "isActive": true,
  "metadata": {
    "rarity": "epic",
    "badgeId": "epic_skin_badge"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Error Response:**
```json
{
  "statusCode": 404,
  "message": "Product not found",
  "error": "Not Found"
}
```

### POST /api/products
Create a new product (Admin only).

**Authentication Required:** Yes (Admin role)

**Request Body:**
```json
{
  "name": "Gaming Headset Pro",
  "description": "Professional gaming headset with 7.1 surround sound",
  "price": 199.99,
  "type": "PHYSICAL_MERCHANDISE",
  "category": "Hardware",
  "imageUrl": "https://example.com/headset.jpg",
  "stock": 50,
  "metadata": {
    "brand": "TechnoGamerz",
    "warranty": "2 years"
  }
}
```

**Validation Rules:**
- `name`: Required, 1-200 characters
- `price`: Required, positive number
- `type`: Required, valid ProductType enum
- `stock`: Required for physical items, null for digital
- `imageUrl`: Optional, valid URL format

**Example Request:**
```bash
curl -X POST "http://localhost:4000/api/products" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{
    "name": "Gaming Headset Pro",
    "description": "Professional gaming headset",
    "price": 199.99,
    "type": "PHYSICAL_MERCHANDISE",
    "category": "Hardware",
    "stock": 50
  }'
```

**Response:**
```json
{
  "id": "product_2",
  "name": "Gaming Headset Pro",
  "description": "Professional gaming headset",
  "price": 199.99,
  "type": "PHYSICAL_MERCHANDISE",
  "category": "Hardware",
  "imageUrl": null,
  "stock": 50,
  "isActive": true,
  "metadata": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### PUT /api/products/:id
Update a product (Admin only).

**Authentication Required:** Yes (Admin role)

**Request Body:** Same as POST, all fields optional
```json
{
  "price": 179.99,
  "stock": 25
}
```

### DELETE /api/products/:id
Soft delete a product (Admin only).

**Authentication Required:** Yes (Admin role)

Sets `isActive` to false instead of permanently deleting.

**Response:**
```json
{
  "id": "product_1",
  "isActive": false,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Orders API

### POST /api/orders
Create a new order and get Stripe checkout URL.

**Authentication Required:** Yes

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

**Validation Rules:**
- `items`: Required, non-empty array
- `productId`: Required, valid product ID
- `quantity`: Required, positive integer

**Example Request:**
```bash
curl -X POST "http://localhost:4000/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user_token>" \
  -d '{
    "items": [
      {"productId": "product_1", "quantity": 1},
      {"productId": "product_2", "quantity": 1}
    ]
  }'
```

**Response:**
```json
{
  "order": {
    "id": "order_1",
    "userId": "user_1",
    "status": "PENDING",
    "totalAmount": 229.98,
    "stripeSessionId": "cs_session_123",
    "items": [
      {
        "id": "item_1",
        "productId": "product_1",
        "quantity": 1,
        "price": 29.99,
        "product": {
          "id": "product_1",
          "name": "Epic Gaming Skin",
          "type": "DIGITAL_COSMETIC"
        }
      },
      {
        "id": "item_2",
        "productId": "product_2",
        "quantity": 1,
        "price": 199.99,
        "product": {
          "id": "product_2",
          "name": "Gaming Headset Pro",
          "type": "PHYSICAL_MERCHANDISE"
        }
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "checkoutUrl": "https://checkout.stripe.com/c/pay/cs_session_123"
}
```

**Error Responses:**
```json
// Product not found
{
  "statusCode": 400,
  "message": "Product product_xyz not found or inactive",
  "error": "Bad Request"
}

// Insufficient stock
{
  "statusCode": 400,
  "message": "Insufficient stock for Gaming Headset Pro. Available: 5, Requested: 10",
  "error": "Bad Request"
}
```

### GET /api/orders
Get user orders with pagination.

**Authentication Required:** Yes

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `status` | OrderStatus | - | Filter by order status |

**Example Request:**
```bash
curl "http://localhost:4000/api/orders?page=1&limit=5&status=COMPLETED" \
  -H "Authorization: Bearer <user_token>"
```

**Response:**
```json
{
  "orders": [
    {
      "id": "order_1",
      "userId": "user_1",
      "status": "COMPLETED",
      "totalAmount": 229.98,
      "stripeSessionId": "cs_session_123",
      "items": [...],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 15,
  "totalPages": 3,
  "currentPage": 1,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

### GET /api/orders/:id
Get a single order by ID.

**Authentication Required:** Yes (must be order owner)

**Response:**
```json
{
  "id": "order_1",
  "userId": "user_1",
  "status": "COMPLETED",
  "totalAmount": 229.98,
  "stripeSessionId": "cs_session_123",
  "items": [
    {
      "id": "item_1",
      "productId": "product_1",
      "quantity": 1,
      "price": 29.99,
      "product": {
        "id": "product_1",
        "name": "Epic Gaming Skin",
        "type": "DIGITAL_COSMETIC",
        "imageUrl": "https://example.com/skin.jpg"
      }
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/orders/:id/cancel
Cancel a pending order.

**Authentication Required:** Yes (must be order owner)

Only orders with status `PENDING` can be cancelled.

**Response:**
```json
{
  "id": "order_1",
  "status": "CANCELLED",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Admin Orders API

### GET /api/orders/admin/all
Get all orders (Admin only).

**Authentication Required:** Yes (Admin role)

**Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page |
| `status` | OrderStatus | - | Filter by status |
| `userId` | string | - | Filter by user |

**Response:**
```json
{
  "orders": [
    {
      "id": "order_1",
      "userId": "user_1",
      "status": "COMPLETED",
      "totalAmount": 229.98,
      "user": {
        "id": "user_1",
        "email": "user@example.com",
        "username": "gamer123"
      },
      "items": [...],
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "total": 100,
  "totalPages": 10,
  "currentPage": 1
}
```

### GET /api/orders/admin/stats
Get order statistics (Admin only).

**Authentication Required:** Yes (Admin role)

**Response:**
```json
{
  "totalOrders": 1250,
  "completedOrders": 1100,
  "pendingOrders": 120,
  "cancelledOrders": 30,
  "totalRevenue": 125750.50,
  "averageOrderValue": 100.60,
  "recentOrders": [...],
  "topProducts": [
    {
      "productId": "product_1",
      "productName": "Epic Gaming Skin",
      "totalSold": 500,
      "revenue": 14995.00
    }
  ]
}
```

## Webhook Endpoints

### POST /api/payments/stripe/webhook
Handle Stripe webhook events.

**Authentication:** Stripe signature validation

**Supported Events:**
- `checkout.session.completed`: Complete order and fulfill digital goods
- `checkout.session.expired`: Cancel expired order and restore stock
- `payment_intent.payment_failed`: Mark order as failed

**Request Headers:**
```
stripe-signature: t=1234567890,v1=signature...
```

**Response:**
```json
{
  "received": true
}
```

## Data Types

### ProductType Enum
```typescript
enum ProductType {
  DIGITAL_COSMETIC = "DIGITAL_COSMETIC",      // Skins, badges, cosmetics
  PHYSICAL_MERCHANDISE = "PHYSICAL_MERCHANDISE", // T-shirts, hardware
  TOURNAMENT_ITEM = "TOURNAMENT_ITEM"         // Tournament-specific items
}
```

### OrderStatus Enum
```typescript
enum OrderStatus {
  PENDING = "PENDING",       // Payment pending
  COMPLETED = "COMPLETED",   // Order completed and fulfilled
  CANCELLED = "CANCELLED",   // Order cancelled
  FAILED = "FAILED"         // Payment failed
}
```

### Product Interface
```typescript
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  type: ProductType;
  category?: string;
  imageUrl?: string;
  stock?: number | null;     // null for digital items
  isActive: boolean;
  metadata?: any;            // JSON object for additional data
  createdAt: string;
  updatedAt: string;
}
```

### Order Interface
```typescript
interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  stripeSessionId?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;            // Price at time of purchase
  product: Product;
}
```

## Error Handling

### Standard Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate resource)
- `500`: Internal Server Error

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Products**: 100 requests per minute per IP
- **Orders**: 50 requests per minute per user
- **Admin endpoints**: 200 requests per minute per admin

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

All list endpoints support pagination with consistent parameters:

**Request Parameters:**
- `page`: Page number (1-based, default: 1)
- `limit`: Items per page (1-100, default: 10)

**Response Format:**
```json
{
  "items": [...],
  "total": 100,
  "totalPages": 10,
  "currentPage": 1,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

## Testing

### Test with cURL

```bash
# Get products
curl "http://localhost:4000/api/products"

# Create order (requires auth)
curl -X POST "http://localhost:4000/api/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"items": [{"productId": "prod_1", "quantity": 1}]}'
```

### Test with Postman

Import the OpenAPI spec from `http://localhost:4000/api-json` to automatically generate a Postman collection.

---

**📖 For complete implementation details, see `MERCHANT_STORE.md`**