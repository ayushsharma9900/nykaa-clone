'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Category } from '@/hooks/useCategories';
import CategoryErrorBoundary from './CategoryErrorBoundary';

// Helper function to get appropriate icon for each category
function getCategoryIcon(categoryName: string | undefined | null): string {
  // Safety check for undefined, null, or non-string values
  if (!categoryName || typeof categoryName !== 'string') {
    return '💄'; // Default icon
  }
  
  const name = categoryName.toLowerCase();
  if (name.includes('makeup') || name.includes('cosmetic')) return '💄';
  if (name.includes('skin') || name.includes('face')) return '🧴';
  if (name.includes('hair')) return '💇';
  if (name.includes('fragrance') || name.includes('perfume')) return '🌸';
  if (name.includes('oil')) return '💧';
  if (name.includes('personal') || name.includes('care')) return '🧼';
  if (name.includes('nail')) return '💅';
  if (name.includes('body') || name.includes('bath')) return '🛁';
  if (name.includes('men')) return '👨';
  if (name.includes('charmis')) return '✨';
  return '💄'; // Default icon
}

interface DynamicCategoriesGridProps {
  categories: Category[];
  loading: boolean;
  error: string | null;
  showViewAll?: boolean;
  maxDisplay?: number;
  gridCols?: string;
}

export default function DynamicCategoriesGrid({
  categories,
  loading,
  error,
  showViewAll = true,
  maxDisplay = 8,
  gridCols = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
}: DynamicCategoriesGridProps) {
  const [showAll, setShowAll] = useState(false);
  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});
  
  // Filter only active categories and sort by sortOrder
  const activeCategories = categories
    .filter(cat => cat.isActive)
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
    
  // Show limited or all categories based on state
  const displayCategories = showAll ? activeCategories : activeCategories.slice(0, maxDisplay);
  const hasMore = activeCategories.length > maxDisplay;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading all categories...</p>
        </div>
        {/* Loading skeleton */}
        <div className={`grid ${gridCols} gap-6`}>
          {[...Array(maxDisplay)].map((_, i) => (
            <div key={i} className="text-center animate-pulse">
              <div className="bg-gray-200 rounded-full w-20 h-20 mx-auto mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Failed to load categories: {error}</p>
        <p className="text-gray-500">Please check that the backend server is running.</p>
      </div>
    );
  }

  if (activeCategories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No categories available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Categories count and toggle */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <p className="text-gray-600 text-sm">
            {showAll 
              ? `Showing all ${activeCategories.length} categories` 
              : `Showing ${displayCategories.length} of ${activeCategories.length} categories`
            }
          </p>
        </div>
        {hasMore && showViewAll && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center space-x-1 text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
          >
            <span>{showAll ? 'Show Less' : 'View All'}</span>
            {showAll ? (
              <ChevronLeftIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Categories grid */}
      <div className={`grid ${gridCols} gap-6`}>
        {displayCategories.map((category, index) => (
          <CategoryErrorBoundary key={`boundary-${category._id || category.id || category.slug || index}`} categoryName={category.name}>
            <Link
              key={category._id || category.id || category.slug || `category-${index}`}
              href={`/${category.slug || '#'}`}
              className="group text-center transform transition-all duration-300 hover:scale-105"
            >
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center group-hover:from-pink-100 group-hover:to-purple-100 transition-all duration-300 shadow-sm group-hover:shadow-lg">
                {category.image && !imageErrors[category.id] ? (
                  <Image
                    src={category.image}
                    alt={category.name || 'Category'}
                    width={44}
                    height={44}
                    className="rounded-full object-cover"
                    onError={() => setImageErrors(prev => ({ ...prev, [category.id]: true }))}
                  />
                ) : (
                  <span className="text-3xl text-pink-600 group-hover:text-pink-700 transition-colors">
                    {getCategoryIcon(category.name)}
                  </span>
                )}
              </div>
              
              {/* Category name */}
              <h3 className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors text-sm leading-tight">
                {category.name || 'Unnamed Category'}
              </h3>
              
              {/* Product count */}
              {category.productCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {category.productCount} product{category.productCount !== 1 ? 's' : ''}
                </p>
              )}
              
              {/* Hover effect */}
              <div className="mt-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                <span className="text-xs text-pink-600 font-medium">
                  Shop Now →
                </span>
              </div>
            </div>
            </Link>
          </CategoryErrorBoundary>
        ))}
      </div>
      
      {/* Expand/Collapse Animation */}
      {showAll && hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={() => setShowAll(false)}
            className="text-pink-600 hover:text-pink-700 font-medium text-sm flex items-center mx-auto space-x-1 transition-colors"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span>Show Less Categories</span>
          </button>
        </div>
      )}
    </div>
  );
}
