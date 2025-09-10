'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { shopService, Product, ProductQuery } from '@/lib/services/shop-service';
import { useCart } from '@/lib/cart';
import { ProductCard } from '@/components/shop/ProductCard';
import { ProductFilters } from '@/components/shop/ProductFilters';
import { CartSidebar } from '@/components/shop/CartSidebar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Search, Filter } from 'lucide-react';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const { cart, getCartSummary } = useCart();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<ProductQuery>({
    limit: 12,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    isActive: true,
  });

  const cartSummary = getCartSummary();

  // Handle URL parameters
  useEffect(() => {
    const search = searchParams.get('search');
    const type = searchParams.get('type') as ProductQuery['type'];
    const success = searchParams.get('purchase');
    
    if (search) {
      setFilters(prev => ({ ...prev, search }));
    }
    
    if (type) {
      setFilters(prev => ({ ...prev, type }));
    }

    if (success === 'success') {
      // Show success message for successful purchase
      setShowCart(false);
    }
  }, [searchParams]);

  // Load products
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await shopService.getProducts(filters);
      setProducts(response.products);
      setTotalPages(response.totalPages);
      setCurrentPage(response.page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<ProductQuery>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      offset: 0, // Reset to first page
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      offset: (page - 1) * (prev.limit || 12),
    }));
  };

  const clearFilters = () => {
    setFilters({
      limit: 12,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      isActive: true,
    });
  };

  const activeFiltersCount = [
    filters.search,
    filters.type,
    filters.sortBy !== 'createdAt' || filters.sortOrder !== 'desc',
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  TecnoGamerz Shop
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Exclusive gaming items and merchandise
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Mobile filter button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="sm:hidden"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>

              {/* Cart button */}
              <Button
                variant="outline"
                onClick={() => setShowCart(true)}
                className="relative"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {cartSummary.itemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 min-w-[20px] h-5 text-xs"
                  >
                    {cartSummary.itemCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`
            lg:w-64 lg:flex-shrink-0
            ${showFilters ? 'block' : 'hidden lg:block'}
          `}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <ProductFilters
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={clearFilters}
                activeFiltersCount={activeFiltersCount}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {loading ? 'Loading...' : `${products.length} Products`}
                </h2>
                {filters.search && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Search results for "{filters.search}"
                  </p>
                )}
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Clear filters ({activeFiltersCount})
                </Button>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : error ? (
              <ErrorMessage 
                message={error} 
                onRetry={loadProducts}
                className="py-12"
              />
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search or filters
                </p>
                <Button onClick={clearFilters}>
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="min-w-[40px]"
                        >
                          {page}
                        </Button>
                      ))}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar
        open={showCart}
        onClose={() => setShowCart(false)}
      />
    </div>
  );
}