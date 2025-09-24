'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/lib/cart';
import { shopService } from '@/lib/services/shop-service';
import { Button } from '@tecno-gamerz/ui/button';
import { Badge } from '@tecno-gamerz/ui/badge';
import { Separator } from '@tecno-gamerz/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@tecno-gamerz/ui/sheet';
import { toast } from '@tecno-gamerz/ui/use-toast';
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Package, 
  CreditCard,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { 
    cart, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    toOrderItems, 
    checkStockAvailability, 
    formatPrice 
  } = useCart();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;
    
    if (newQuantity === 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId: string, productTitle: string) => {
    removeItem(productId);
    toast({
      title: 'Item Removed',
      description: `${productTitle} has been removed from your cart`,
      variant: 'default',
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: 'Cart Cleared',
      description: 'All items have been removed from your cart',
      variant: 'default',
    });
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) return;
    
    // Check stock availability
    const stockCheck = checkStockAvailability();
    if (!stockCheck.isValid) {
      toast({
        title: 'Stock Issues',
        description: stockCheck.issues.join('. '),
        variant: 'destructive',
      });
      return;
    }

    setIsCheckingOut(true);
    
    try {
      const orderItems = toOrderItems();
      const order = await shopService.createOrder({
        items: orderItems,
        successUrl: `${window.location.origin}/shop?purchase=success`,
        cancelUrl: `${window.location.origin}/shop?purchase=cancelled`,
      });

      // Redirect to Stripe checkout
      window.location.href = order.checkoutUrl;
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: 'Checkout Failed',
        description: error instanceof Error ? error.message : 'Failed to start checkout process',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getItemSubtotal = (pricePerUnit: number, quantity: number) => {
    return pricePerUnit * quantity;
  };

  if (cart.items.length === 0) {
    return (
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:w-[400px] p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Shopping Cart
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Browse our shop and add some items to your cart
            </p>
            <Button onClick={onClose} className="w-full">
              Continue Shopping
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Shopping Cart
            </div>
            <Badge variant="secondary">
              {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.product.id} className="flex space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {/* Product Image */}
                <div className="flex-shrink-0 w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {item.product.images && item.product.images.length > 0 ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.title}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {item.product.title}
                  </h4>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {shopService.getProductTypeLabel(item.product.type)}
                    </Badge>
                    {item.product.stock !== null && (
                      <span className="text-xs text-gray-500">
                        {item.product.stock} available
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Price */}
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(getItemSubtotal(item.product.price, item.quantity))}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-gray-500 ml-1">
                          ({formatPrice(item.product.price)} each)
                        </span>
                      )}
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.product.id, item.product.title)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    
                    <span className="text-sm font-medium min-w-[2rem] text-center">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                      disabled={
                        item.product.stock !== null && 
                        item.quantity >= item.product.stock
                      }
                      className="w-8 h-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Stock Warning */}
                  {item.product.stock !== null && item.quantity >= item.product.stock && (
                    <div className="flex items-center mt-2 text-xs text-amber-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Max stock reached
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Clear Cart Button */}
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleClearCart}
              className="w-full text-gray-600 hover:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Cart Footer */}
        <div className="border-t p-6 space-y-4">
          {/* Total */}
          <div className="flex items-center justify-between text-lg font-semibold">
            <span className="text-gray-900 dark:text-white">Total:</span>
            <span className="text-gray-900 dark:text-white">
              {formatPrice(cart.total)}
            </span>
          </div>

          <Separator />

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            disabled={isCheckingOut || cart.items.length === 0}
            className="w-full"
            size="lg"
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Checkout ({formatPrice(cart.total)})
              </>
            )}
          </Button>

          {/* Security Notice */}
          <p className="text-xs text-gray-500 text-center">
            Secure checkout powered by Stripe
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}