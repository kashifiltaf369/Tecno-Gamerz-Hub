'use client';

import React, { useState } from 'react';
import { ProductQuery } from '@/lib/services/shop-service';
import { Button } from '@tecno-gamerz/ui/button';
import { Input } from '@tecno-gamerz/ui/input';
import { Label } from '@tecno-gamerz/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@tecno-gamerz/ui/select';
import { Separator } from '@tecno-gamerz/ui/separator';
import { Badge } from '@tecno-gamerz/ui/badge';
import { Search, X, Filter, Package, Crown, Palette, Gift } from 'lucide-react';

interface ProductFiltersProps {
  filters: ProductQuery;
  onFilterChange: (filters: Partial<ProductQuery>) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
}

export function ProductFilters({
  filters,
  onFilterChange,
  onClearFilters,
  activeFiltersCount,
}: ProductFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search: searchInput || undefined });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    // Auto-search with debounce would be nice here
  };

  const productTypes = [
    { value: 'COSMETIC', label: 'Cosmetics', icon: Palette, color: 'text-purple-600' },
    { value: 'BADGE', label: 'Badges', icon: Crown, color: 'text-yellow-600' },
    { value: 'DISCOUNT', label: 'Discounts', icon: Gift, color: 'text-red-600' },
    { value: 'PHYSICAL', label: 'Physical Items', icon: Package, color: 'text-blue-600' },
  ] as const;

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First', sortBy: 'createdAt', sortOrder: 'desc' },
    { value: 'createdAt-asc', label: 'Oldest First', sortBy: 'createdAt', sortOrder: 'asc' },
    { value: 'title-asc', label: 'Name A-Z', sortBy: 'title', sortOrder: 'asc' },
    { value: 'title-desc', label: 'Name Z-A', sortBy: 'title', sortOrder: 'desc' },
    { value: 'price-asc', label: 'Price Low to High', sortBy: 'price', sortOrder: 'asc' },
    { value: 'price-desc', label: 'Price High to Low', sortBy: 'price', sortOrder: 'desc' },
  ] as const;

  const currentSortValue = `${filters.sortBy}-${filters.sortOrder}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
        </div>
        
        {activeFiltersCount > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{activeFiltersCount}</Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Search */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-white">
          Search Products
        </Label>
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name or description..."
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" size="sm" className="w-full">
            Search
          </Button>
        </form>
        
        {filters.search && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Searching for: "{filters.search}"</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchInput('');
                onFilterChange({ search: undefined });
              }}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Product Type */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-white">
          Product Type
        </Label>
        <div className="space-y-2">
          <Button
            variant={!filters.type ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange({ type: undefined })}
            className="w-full justify-start"
          >
            <Package className="w-4 h-4 mr-2 text-gray-600" />
            All Types
          </Button>
          
          {productTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = filters.type === type.value;
            
            return (
              <Button
                key={type.value}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange({ 
                  type: isSelected ? undefined : type.value 
                })}
                className="w-full justify-start"
              >
                <Icon className={`w-4 h-4 mr-2 ${type.color}`} />
                {type.label}
              </Button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Sort Options */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-white">
          Sort By
        </Label>
        <Select
          value={currentSortValue}
          onValueChange={(value) => {
            const option = sortOptions.find(opt => opt.value === value);
            if (option) {
              onFilterChange({
                sortBy: option.sortBy,
                sortOrder: option.sortOrder,
              });
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sort option" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Availability */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900 dark:text-white">
          Availability
        </Label>
        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            In Stock Only
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-purple-600 hover:text-purple-700 hover:bg-purple-50"
          >
            Digital Items
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Physical Items
          </Button>
        </div>
      </div>

      {/* Clear All Filters */}
      {activeFiltersCount > 0 && (
        <>
          <Separator />
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );
}