'use client';

import { useState, useMemo, use, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { useCategories } from '@/hooks/useCategories';
import { apiService } from '@/lib/api';
import { mapBackendToFrontend } from '@/lib/dataMapper';
import ProductCard from '@/components/ui/ProductCard';
import { ChevronDownIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = use(params);
  
  const { categories } = useCategories();
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  
  const [sortBy, setSortBy] = useState<string>('featured');
  const [priceRange, setPriceRange] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Find the category by slug from API
  const currentCategory = categories.find(cat => cat.slug === category);
  
  // Fetch products for this category
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!currentCategory) return;
      
      try {
        setProductsLoading(true);
        setProductsError(null);
        
        // Use category slug for API call (backend will map it to name)
        const response = await apiService.getProducts({ 
          category: category, // Pass the slug
          limit: 100 
        });
        
        if (response.success && response.data) {
          const mappedProducts = response.data.map(mapBackendToFrontend);
          setProducts(mappedProducts);
        } else {
          throw new Error(response.message || 'Failed to fetch products');
        }
      } catch (err) {
        console.error('Failed to fetch category products:', err);
        setProductsError(err instanceof Error ? err.message : 'Failed to fetch products');
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    
    fetchCategoryProducts();
  }, [category, currentCategory]);
  
  // If category doesn't exist, show 404
  if (!currentCategory && categories.length > 0) {
    notFound();
  }

  const filteredAndSortedProducts = useMemo(() => {
    if (!currentCategory || !products) return [];
    
    // Products are already filtered by category from API
    let filtered = [...products];

    // Filter by price range
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      filtered = filtered.filter(product => {
        if (max) {
          return product.price >= min && product.price <= max;
        }
        return product.price >= min;
      });
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // Keep original order for featured
        break;
    }

    return filtered;
  }, [currentCategory, sortBy, priceRange, products]);

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
              {productsLoading ? 'Loading...' : `${filteredAndSortedProducts.length} products found`}
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
                  onChange={(e) => setSortBy(e.target.value)}
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
            {filteredAndSortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found in this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}