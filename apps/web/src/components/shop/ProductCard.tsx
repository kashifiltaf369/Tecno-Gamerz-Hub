'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/services/shop-service';
import { useCart } from '@/lib/cart';
import { Button } from '@tecno-gamerz/ui/button';
import { Badge } from '@tecno-gamerz/ui/badge';
import { Card, CardContent, CardFooter } from '@tecno-gamerz/ui/card';
import { toast } from '@tecno-gamerz/ui/use-toast';
import { ShoppingCart, Package, Eye, Star, Crown } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, isInCart, getItemQuantity } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    
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

      addItem(product, 1);
      
      toast({
        title: 'Added to Cart',
        description: `${product.title} has been added to your cart`,
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      });
    }
  };

  const formatPrice = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
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

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      COSMETIC: 'Cosmetic',
      BADGE: 'Badge',
      DISCOUNT: 'Discount',
      PHYSICAL: 'Physical',
    };
    return labels[type] || type;
  };

  const isOutOfStock = product.stock !== null && product.stock <= 0;
  const isLowStock = product.stock !== null && product.stock <= 5 && product.stock > 0;
  const inCart = isInCart(product.id);
  const cartQuantity = getItemQuantity(product.id);

  return (
    <Link href={`/shop/products/${product.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200 dark:border-gray-700 h-full flex flex-col">
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[0]}
                alt={product.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <Badge className={getTypeColor(product.type)}>
              {getTypeLabel(product.type)}
            </Badge>
            
            {product.type === 'BADGE' && product.metadata?.rarity === 'legendary' && (
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

          {/* Quick Actions */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="w-8 h-8 p-0"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4 flex-1">
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            
            {product.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Metadata Display */}
            {product.metadata && (
              <div className="flex flex-wrap gap-1">
                {product.metadata.features && (
                  <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {product.metadata.features[0]}
                  </span>
                )}
                {product.metadata.rarity && product.metadata.rarity !== 'common' && (
                  <span className="text-xs text-purple-600 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded capitalize">
                    {product.metadata.rarity}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 space-y-3">
          {/* Price */}
          <div className="w-full flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.stock === null && (
                <div className="text-xs text-gray-500">Digital Item</div>
              )}
              {product.stock !== null && (
                <div className="text-xs text-gray-500">
                  {product.stock} in stock
                </div>
              )}
            </div>
            
            {/* Rating/Quality indicator */}
            {product.metadata?.rating && (
              <div className="flex items-center text-yellow-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="ml-1 text-sm text-gray-600">
                  {product.metadata.rating}
                </span>
              </div>
            )}
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-full"
            variant={inCart ? "secondary" : "default"}
          >
            {isOutOfStock ? (
              <>
                <Package className="w-4 h-4 mr-2" />
                Out of Stock
              </>
            ) : inCart ? (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                In Cart ({cartQuantity})
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}