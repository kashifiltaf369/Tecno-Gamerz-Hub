'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { shopService, Product } from '@/lib/services/shop-service';
import { useCart } from '@/lib/cart';
import { Button } from '@tecno-gamerz/ui/button';
import { Badge } from '@tecno-gamerz/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@tecno-gamerz/ui/card';
import { Separator } from '@tecno-gamerz/ui/separator';
import { Loading } from '@tecno-gamerz/ui/loading';
import { toast } from '@tecno-gamerz/ui/use-toast';
import { 
  ShoppingCart, 
  Package, 
  ArrowLeft, 
  Star, 
  Crown, 
  Shield,
  Palette,
  Gift,
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addItem, isInCart, getItemQuantity } = useCart();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const productId = params.id as string;

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await shopService.getProduct(productId);
      setProduct(productData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    try {
      // Check stock for physical products
      if (product.stock !== null && product.stock <= 0) {
        toast({
          title: 'Out of Stock',
          description: `${product.title} is currently out of stock`,
          variant: 'destructive',
        });
        return;
      }

      // Check if adding this quantity would exceed available stock
      const currentInCart = getItemQuantity(product.id);
      if (product.stock !== null && (currentInCart + quantity) > product.stock) {
        toast({
          title: 'Insufficient Stock',
          description: `Only ${product.stock - currentInCart} more available`,
          variant: 'destructive',
        });
        return;
      }

      addItem(product, quantity);
      
      toast({
        title: 'Added to Cart',
        description: `${quantity} ${product.title}${quantity > 1 ? 's' : ''} added to your cart`,
        variant: 'default',
      });
      
      // Reset quantity to 1 after adding
      setQuantity(1);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Product Not Found</h3>
            <p className="text-gray-600 mb-4">
              {error || 'The product you\'re looking for doesn\'t exist.'}
            </p>
            <Button onClick={() => router.push('/shop')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shop
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ComponentType> = {
      COSMETIC: Palette,
      BADGE: Crown,
      DISCOUNT: Gift,
      PHYSICAL: Package,
    };
    return icons[type] || Package;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      COSMETIC: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      BADGE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      DISCOUNT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      PHYSICAL: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const isOutOfStock = product.stock !== null && product.stock <= 0;
  const isLowStock = product.stock !== null && product.stock <= 5 && product.stock > 0;
  const inCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);
  const maxQuantity = product.stock !== null ? Math.max(0, product.stock - cartQuantity) : 10;

  const TypeIcon = getTypeIcon(product.type);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/shop')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden border">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.title}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </div>

            {/* Image Thumbnails */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Badge className={getTypeColor(product.type)}>
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {shopService.getProductTypeLabel(product.type)}
                </Badge>
                
                {product.metadata?.rarity === 'legendary' && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                    <Crown className="w-3 h-3 mr-1" />
                    Legendary
                  </Badge>
                )}
                
                {isLowStock && !isOutOfStock && (
                  <Badge variant="destructive">
                    Only {product.stock} left
                  </Badge>
                )}
                
                {isOutOfStock && (
                  <Badge variant="destructive">
                    Out of Stock
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {product.title}
              </h1>

              <div className="flex items-center space-x-4 mb-4">
                <span className="text-4xl font-bold text-primary">
                  {formatPrice(product.price, product.currency)}
                </span>
                
                {product.metadata?.rating && (
                  <div className="flex items-center text-yellow-500">
                    <Star className="w-5 h-5 fill-current" />
                    <span className="ml-1 text-lg font-medium">
                      {product.metadata.rating}
                    </span>
                  </div>
                )}
              </div>

              {product.description && (
                <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            <Separator />

            {/* Stock Info */}
            <div className="space-y-2">
              {product.stock === null ? (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Digital Item - Always Available</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Stock:
                    </span>
                    <span className={`font-medium ${
                      isOutOfStock ? 'text-red-600' : 
                      isLowStock ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : `${product.stock} available`}
                    </span>
                  </div>
                  
                  {inCart && cartQuantity > 0 && (
                    <div className="text-sm text-gray-600">
                      {cartQuantity} already in cart
                    </div>
                  )}
                </div>
              )}
              
              {product.type === 'PHYSICAL' && (
                <div className="flex items-center text-blue-600">
                  <Truck className="w-4 h-4 mr-2" />
                  <span className="text-sm">Free shipping on orders over $50</span>
                </div>
              )}
              
              {product.type !== 'PHYSICAL' && (
                <div className="flex items-center text-purple-600">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">Instant delivery after payment</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Add to Cart */}
            <div className="space-y-4">
              {!isOutOfStock && (
                <div className="flex items-center space-x-4">
                  <label className="font-medium text-gray-900 dark:text-white">
                    Quantity:
                  </label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center font-medium">
                      {quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                      disabled={quantity >= maxQuantity}
                    >
                      +
                    </Button>
                  </div>
                  {maxQuantity < 10 && (
                    <span className="text-sm text-gray-500">
                      Max: {maxQuantity}
                    </span>
                  )}
                </div>
              )}

              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock || quantity === 0}
                className="w-full"
                size="lg"
              >
                {isOutOfStock ? (
                  <>
                    <Package className="w-5 h-5 mr-2" />
                    Out of Stock
                  </>
                ) : inCart ? (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add More ({cartQuantity} in cart)
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart - {formatPrice(product.price * quantity)}
                  </>
                )}
              </Button>
            </div>

            {/* Product Features/Metadata */}
            {product.metadata && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Product Details
                  </h3>
                  
                  {product.metadata.features && (
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                        Features:
                      </h4>
                      <ul className="space-y-1">
                        {product.metadata.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-center text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {product.metadata.rarity && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Rarity:</span>
                      <Badge variant="outline" className="capitalize">
                        {product.metadata.rarity}
                      </Badge>
                    </div>
                  )}
                  
                  {product.metadata.warranty && (
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Warranty:</span>
                      <span className="text-gray-600">
                        {product.metadata.warranty}
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Security Notice */}
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Secure Purchase
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All payments are processed securely through Stripe. 
                    {product.type !== 'PHYSICAL' && ' Digital items are delivered instantly after payment confirmation.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}