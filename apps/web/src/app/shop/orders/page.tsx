'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { shopService, Order } from '@/lib/services/shop-service';
import { Button } from '@tecno-gamerz/ui/button';
import { Badge } from '@tecno-gamerz/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@tecno-gamerz/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tecno-gamerz/ui/select';
import { Loading } from '@tecno-gamerz/ui/loading';
import { 
  Package, 
  Receipt, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  ArrowLeft,
  Eye,
  Filter
} from 'lucide-react';

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const success = searchParams.get('purchase');
    if (success === 'success') {
      // Show success message or refresh orders
      loadOrders();
    } else {
      loadOrders();
    }
  }, [searchParams, statusFilter, currentPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        limit: 10,
        offset: (currentPage - 1) * 10,
      };

      if (statusFilter && statusFilter !== 'all') {
        filters.status = statusFilter;
      }

      const response = await shopService.getUserOrders(filters);
      setOrders(response.orders);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'PAID':
        return <CheckCircle className="w-4 h-4" />;
      case 'FULFILLED':
        return <Package className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      case 'REFUNDED':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                asChild
                className="text-gray-600 hover:text-gray-900"
              >
                <Link href="/shop">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Shop
                </Link>
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  My Orders
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track your purchase history and order status
                </p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="All orders" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="FULFILLED">Fulfilled</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <Card className="p-8 text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Orders</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadOrders}>Try Again</Button>
          </Card>
        ) : orders.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
            <p className="text-gray-600 mb-4">
              {statusFilter !== 'all' 
                ? `No ${statusFilter.toLowerCase()} orders found. Try changing the filter.`
                : "You haven't made any purchases yet. Start shopping to see your orders here."
              }
            </p>
            <Button asChild>
              <Link href="/shop">Start Shopping</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Orders List */}
            {orders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Badge 
                        className={`${shopService.getOrderStatusColor(order.status)} flex items-center space-x-1`}
                      >
                        {getStatusIcon(order.status)}
                        <span>{shopService.getOrderStatusLabel(order.status)}</span>
                      </Badge>
                      
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(0, 8)}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(order.totalAmount, order.currency)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                            {item.product?.images && item.product.images.length > 0 ? (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product?.title || 'Product'}
                                width={48}
                                height={48}
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
                              {item.product?.title || 'Unknown Product'}
                            </h4>
                            <div className="flex items-center space-x-2 mt-1">
                              {item.product?.type && (
                                <Badge variant="outline" className="text-xs">
                                  {shopService.getProductTypeLabel(item.product.type)}
                                </Badge>
                              )}
                              <span className="text-xs text-gray-500">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>

                          {/* Item Price */}
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatPrice(item.priceAtPurchase * item.quantity, order.currency)}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-xs text-gray-500">
                                {formatPrice(item.priceAtPurchase, order.currency)} each
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {order.externalPaymentId && (
                          <span>Payment ID: {order.externalPaymentId.slice(0, 12)}...</span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/shop/orders/${order.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                        </Button>

                        {order.status === 'FULFILLED' && (
                          <Button size="sm">
                            <Package className="w-4 h-4 mr-2" />
                            Reorder
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}