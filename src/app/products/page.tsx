'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import ProductCard from '@/components/ui/ProductCard';
import Pagination from '@/components/ui/Pagination';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { usePagination } from '@/hooks/usePagination';
import { ChevronDownIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { categories, loading: categoriesLoading } = useCategories();
  
  // State for client-side filters (these don't require server requests)
  const [showFilters, setShowFilters] = useState(false);

  // Get initial filters from URL params
  const getFiltersFromParams = () => {
    return {
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      category: searchParams.get('category') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
    };
  };

  // Use new pagination hook
  const pagination = usePagination({
    initialPage: parseInt(searchParams.get('page') || '1'),
    initialPageSize: parseInt(searchParams.get('limit') || '20'),
    pageSizeOptions: [10, 20, 50, 100]
  });

  const { 
    products, 
    pagination: serverPagination, 
    loading: productsLoading, 
    error: productsError,
    filters,
    updateFilters
  } = useProducts({
    ...getFiltersFromParams(),
    page: pagination.paginationState.currentPage,
    limit: pagination.paginationState.pageSize
  });
  
  // Update pagination total when server data changes
  useEffect(() => {
    if (serverPagination?.totalProducts) {
      pagination.updateTotalItems(serverPagination.totalProducts);
    }
  }, [serverPagination?.totalProducts, pagination]);

  // Update URL when filters change
  const updateURL = (newFilters: any) => {
    const params = new URLSearchParams();
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });
    
    const queryString = params.toString();
    const newURL = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(newURL, { scroll: false });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // Reset to page 1 when filtering
    updateFilters(updatedFilters);
    updateURL(updatedFilters);
  };
  
  // Filter only active categories
  const activeCategories = categories.filter(cat => cat.isActive);

  // Handle pagination changes - now managed by pagination hook
  const handlePageChange = (page: number) => {
    pagination.goToPage(page);
    // The pagination hook will update URL automatically
  };

  const handlePageSizeChange = (limit: number) => {
    pagination.changePageSize(limit);
    // The pagination hook will update URL automatically
  };

  // Show loading state
  if (productsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {filters.search 
                ? `Search results for "${filters.search}"` 
                : filters.category 
                  ? filters.category 
                  : 'All Products'
              }
            </h1>
            <p className="text-gray-600 mt-1">
              {pagination.paginationState.totalItems || products.length} products found
            </p>
            {productsError && (
              <p className="text-red-500 text-sm mt-1">
                Error loading products: {productsError}
              </p>
            )}
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-pink-600 mb-4">Categories</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value=""
                    checked={!filters.category}
                    onChange={() => handleFilterChange({ category: undefined })}
                    className="text-pink-600 focus:ring-pink-500"
                  />
                  <span className="ml-2 text-sm text-pink-600">All Categories</span>
                </label>
                {activeCategories.map((category) => (
                  <label key={category._id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value={category.name}
                      checked={filters.category === category.name}
                      onChange={() => handleFilterChange({ category: category.name })}
                      className="text-pink-600 focus:ring-pink-500"
                    />
                    <span className="ml-2 text-sm text-pink-600">
                      {category.name} {category.productCount ? `(${category.productCount})` : ''}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-pink-600 mb-4">Price Range</h3>
              <div className="space-y-2">
                {[
                  { label: 'All Prices', minPrice: undefined, maxPrice: undefined },
                  { label: 'Under ₹500', minPrice: undefined, maxPrice: 500 },
                  { label: '₹500 - ₹1000', minPrice: 500, maxPrice: 1000 },
                  { label: '₹1000 - ₹2000', minPrice: 1000, maxPrice: 2000 },
                  { label: '₹2000 - ₹5000', minPrice: 2000, maxPrice: 5000 },
                  { label: 'Over ₹5000', minPrice: 5000, maxPrice: undefined }
                ].map((range, index) => {
                  const isSelected = filters.minPrice === range.minPrice && filters.maxPrice === range.maxPrice;
                  return (
                    <label key={index} className="flex items-center">
                      <input
                        type="radio"
                        name="price"
                        checked={isSelected}
                        onChange={() => handleFilterChange({ minPrice: range.minPrice, maxPrice: range.maxPrice })}
                        className="text-pink-600 focus:ring-pink-500"
                      />
                      <span className="ml-2 text-sm text-pink-600">{range.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort dropdown */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <select
                  value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFilterChange({ sortBy, sortOrder });
                  }}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-pink-600 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="averageRating-desc">Highest Rated</option>
                  <option value="totalSold-desc">Best Selling</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Products Grid */}
            {products.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                {/* Pagination */}
                {pagination.paginationState.totalPages > 1 && (
                  <Pagination
                    currentPage={pagination.paginationState.currentPage}
                    totalPages={pagination.paginationState.totalPages}
                    totalItems={pagination.paginationState.totalItems}
                    itemsPerPage={pagination.paginationState.pageSize}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    showPageSize={true}
                    pageSizeOptions={[10, 20, 50, 100]}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          </div>
        </div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
