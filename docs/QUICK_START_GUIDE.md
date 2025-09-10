# 🚀 Merchant Store Quick Start Guide

## Overview
Get the Tecno Gamerz Hub Merchant Store up and running in 15 minutes.

## Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account
- Git

## 1. Environment Setup

Create `.env` files in both `apps/api` and `apps/web`:

### API Environment (`apps/api/.env`)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/tecno_gamerz_hub"

# JWT
JWT_SECRET="your-super-secret-jwt-key-here"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

### Web Environment (`apps/web/.env.local`)
```env
# API
NEXT_PUBLIC_API_URL="http://localhost:4000"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Auth
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## 2. Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
cd apps/api && npx prisma generate

# Apply migrations
npx prisma migrate dev

# Seed sample data (optional)
npm run db:seed
```

## 3. Start the Services

```bash
# Terminal 1: Start API
cd apps/api && npm run dev

# Terminal 2: Start Web App
cd apps/web && npm run dev
```

## 4. Verify Installation

1. **API Health Check**: Visit `http://localhost:4000/health`
2. **Web App**: Visit `http://localhost:3000`
3. **Shop Page**: Visit `http://localhost:3000/shop`
4. **API Docs**: Visit `http://localhost:4000/api` (Swagger UI)

## 5. Create Your First Product

### Using API (Admin required)
```bash
curl -X POST http://localhost:4000/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Epic Gaming Skin",
    "description": "Transform your character with this legendary skin",
    "price": 29.99,
    "type": "DIGITAL_COSMETIC",
    "category": "Skins",
    "imageUrl": "https://example.com/skin.jpg",
    "metadata": {
      "rarity": "epic",
      "badgeId": "epic_skin_badge"
    }
  }'
```

### Using Database (For testing)
```sql
INSERT INTO "Product" (id, name, description, price, type, category, "isActive")
VALUES ('test_product_1', 'Test Gaming Skin', 'A test skin for development', 19.99, 'DIGITAL_COSMETIC', 'Skins', true);
```

## 6. Test the Complete Flow

1. **Browse Products**: Visit `/shop` and see your products
2. **Add to Cart**: Click "Add to Cart" on a product
3. **View Cart**: Click the cart icon in bottom-right
4. **Checkout**: Click "Checkout" (requires test Stripe setup)

## 7. Stripe Webhook Setup (For Payment Testing)

1. Install Stripe CLI: `npm install -g stripe`
2. Login: `stripe login`
3. Forward webhooks: `stripe listen --forward-to localhost:4000/payments/stripe/webhook`
4. Copy webhook secret to your `.env` file

## Common Issues & Solutions

### Database Connection Error
```
Error: Can't reach database server
```
**Solution**: Check PostgreSQL is running and DATABASE_URL is correct

### Stripe Error
```
No such customer: cus_xxx
```
**Solution**: Ensure Stripe keys are for the same account (test/live)

### CORS Error
```
Access to fetch at 'http://localhost:4000' blocked by CORS
```
**Solution**: Check FRONTEND_URL in API environment matches web app URL

### Products Not Loading
```
Products array is empty
```
**Solution**: 
1. Check API is running on port 4000
2. Verify database has product data
3. Check API logs for errors

## Sample Product Data

Run this SQL to add sample products for testing:

```sql
INSERT INTO "Product" (id, name, description, price, type, category, "imageUrl", stock, "isActive", metadata) VALUES
('prod_skin_1', 'Dragon Warrior Skin', 'Epic dragon-themed character skin', 39.99, 'DIGITAL_COSMETIC', 'Skins', 'https://via.placeholder.com/300x200', null, true, '{"rarity": "epic", "badgeId": "dragon_warrior"}'),
('prod_headset_1', 'Gaming Headset Pro', 'Professional 7.1 surround sound headset', 199.99, 'PHYSICAL_MERCHANDISE', 'Hardware', 'https://via.placeholder.com/300x200', 25, true, null),
('prod_shirt_1', 'Tecno Gamerz T-Shirt', 'Official tournament t-shirt', 29.99, 'PHYSICAL_MERCHANDISE', 'Apparel', 'https://via.placeholder.com/300x200', 100, true, null),
('prod_badge_1', 'Champion Badge', 'Exclusive champion status badge', 9.99, 'DIGITAL_COSMETIC', 'Badges', 'https://via.placeholder.com/300x200', null, true, '{"rarity": "legendary", "badgeId": "champion_2024"}');
```

## Next Steps

1. **Customize Products**: Add your own products with real images
2. **Configure Payments**: Set up live Stripe keys for production
3. **Admin Panel**: Build admin interface for product management
4. **User Testing**: Test the complete purchase flow
5. **Deploy**: Deploy to production environment

## Useful Commands

```bash
# Reset database
npx prisma migrate reset

# View database
npx prisma studio

# Check logs
# API logs in terminal
# Web app logs in browser console

# Run tests
npm test

# Build for production
npm run build
```

## Support

- **Full Documentation**: See `MERCHANT_STORE.md`
- **API Reference**: `http://localhost:4000/api` when running
- **Test Coverage**: Run `npm run test:coverage`

---

**🎉 You're all set!** Visit `http://localhost:3000/shop` to see your merchant store in action.