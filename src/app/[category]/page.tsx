'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import { useCategories } from '@/hooks/useCategories';
import { usePagination } from '@/hooks/usePagination';
import { apiService } from '@/lib/api';
import { mapBackendToFrontend } from '@/lib/dataMapper';
import ProductCard from '@/components/ui/ProductCard';
import Pagination from '@/components/ui/Pagination';
import { ChevronDownIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const searchParams = useSearchParams();
  
  const { categories } = useCategories();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  
  // Use new pagination hook
  const pagination = usePagination({
    initialPage: parseInt(searchParams?.get('page') || '1'),
    initialPageSize: parseInt(searchParams?.get('limit') || '20'),
    pageSizeOptions: [10, 20, 50, 100]
  });
  
  const [sortBy, setSortBy] = useState<string>(searchParams?.get('sort') || 'featured');
  const [priceRange, setPriceRange] = useState<string>(searchParams?.get('priceRange') || '');
  const [showFilters, setShowFilters] = useState(false);
  
  // Find the category by slug from API
  const currentCategory = categories.find(cat => cat.slug === category);
  
  // Fetch products for this category
  const fetchCategoryProducts = async (page = pagination.paginationState.currentPage, limit = pagination.paginationState.pageSize, sort = sortBy) => {
    if (!currentCategory) return;
    
    try {
      setProductsLoading(true);
      setProductsError(null);
      
      // Map frontend sort to backend sort
      let backendSortBy = 'createdAt';
      let sortOrder: 'asc' | 'desc' = 'desc';
      
      switch (sort) {
        case 'price-low':
          backendSortBy = 'price';
          sortOrder = 'asc';
          break;
        case 'price-high':
          backendSortBy = 'price';
          sortOrder = 'desc';
          break;
        case 'rating':
          backendSortBy = 'averageRating';
          sortOrder = 'desc';
          break;
        case 'newest':
          backendSortBy = 'createdAt';
          sortOrder = 'desc';
          break;
        default:
          // Keep featured/default sorting
          break;
      }
      
      // Use category slug for API call (backend will map it to name)
      const response = await apiService.getProducts({ 
        category: category, // Pass the slug
        page,
        limit,
        sortBy: backendSortBy,
        sortOrder
      });
      
      if (response.success && response.data) {
        const mappedProducts = response.data.map(mapBackendToFrontend);
        setProducts(mappedProducts);
        
        // Update pagination info
        if (response.pagination) {
          pagination.updateTotalItems(response.pagination.totalProducts);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Failed to fetch category products:', err);
      setProductsError(err instanceof Error ? err.message : 'Failed to fetch products');
      setProducts([]);
      pagination.updateTotalItems(0);
    } finally {
      setProductsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCategoryProducts();
  }, [category, currentCategory]);
  
  // Update products when sort or pagination changes
  useEffect(() => {
    if (currentCategory) {
      fetchCategoryProducts(pagination.paginationState.currentPage, pagination.paginationState.pageSize, sortBy);
    }
  }, [sortBy, pagination.paginationState.currentPage, pagination.paginationState.pageSize, currentCategory]);
  
  // If category doesn't exist, show 404
  if (!currentCategory && categories.length > 0) {
    notFound();
  }
  
  // Pagination handlers - now managed by pagination hook
  const handlePageChange = (page: number) => {
    pagination.goToPage(page);
  };
  
  const handlePageSizeChange = (newPageSize: number) => {
    pagination.changePageSize(newPageSize);
  };
  
  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    pagination.goToFirstPage();
  };
  
  // Apply client-side price range filtering to server results
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    
    let filtered = [...products];

    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter((product: any) => {
        if (max) {
          return product.price >= min && product.price <= max;
        }
        return product.price >= min;
      });
    }

    return filtered;
  }, [products, priceRange]);

  // Show loading state while categories are being fetched
  if (categories.length === 0) {
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
            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {currentCategory?.name || 'Category'}
            </h1>
            <p className="text-gray-600 mt-1">
              {productsLoading ? 'Loading...' : `${pagination.paginationState.totalItems} products found`}
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
            className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold text-pink-600 mb-4">Price Range</h3>
              <div className="space-y-2">
                {[
                  { label: 'All Prices', value: '' },
                  { label: 'Under ₹500', value: '0-500' },
                  { label: '₹500 - ₹1000', value: '500-1000' },
                  { label: '₹1000 - ₹2000', value: '1000-2000' },
                  { label: '₹2000 - ₹5000', value: '2000-5000' },
                  { label: 'Over ₹5000', value: '5000' }
                ].map((range) => (
                  <label key={range.value} className="flex items-center">
                    <input
                      type="radio"
                      name="price"
                      value={range.value}
                      checked={priceRange === range.value}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="text-pink-600 focus:ring-pink-500"
                    />
                    <span className="ml-2 text-sm text-pink-600">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort dropdown */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-pink-600 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="featured" className="text-pink-600">Featured</option>
                  <option value="newest" className="text-pink-600">Newest</option>
                  <option value="price-low" className="text-pink-600">Price: Low to High</option>
                  <option value="price-high" className="text-pink-600">Price: High to Low</option>
                  <option value="rating" className="text-pink-600">Highest Rated</option>
                </select>
                <ChevronDownIcon className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product: any) => (
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
                <p className="text-gray-500 text-lg">
                  {productsLoading ? 'Loading products...' : 'No products found in this category.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
