'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import ProductCard from '@/components/ui/ProductCard';
import DynamicCategoriesGrid from '@/components/ui/DynamicCategoriesGrid';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';

// Helper function to get appropriate icon for each category
function getCategoryIcon(categoryName: string): string {
  const name = categoryName.toLowerCase();
  if (name.includes('makeup') || name.includes('cosmetic')) return '💄';
  if (name.includes('skin') || name.includes('face')) return '🧴';
  if (name.includes('hair')) return '🧴';
  if (name.includes('fragrance') || name.includes('perfume')) return '🌸';
  if (name.includes('oil')) return '💧';
  if (name.includes('personal') || name.includes('care')) return '🧼';
  if (name.includes('nail')) return '💅';
  if (name.includes('body')) return '🧴';
  return '💄'; // Default icon
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  // Fetch categories and products dynamically from API
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  
  const featuredProducts = products.slice(0, 8);
  const bestSellers = products.filter(p => p.rating >= 4.5).slice(0, 6);
  
  // Categories are now handled by the DynamicCategoriesGrid component
  
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubscribing(true);
    
    // Simulate API call
    setTimeout(() => {
      alert(`Thank you for subscribing! We'll send updates to ${email}`);
      setEmail('');
      setIsSubscribing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-pink-100 to-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
                Beauty
                <span className="block text-pink-600">Redefined</span>
              </h1>
              <p className="text-lg text-gray-600 mb-6">
                Discover the latest in skincare, makeup, and beauty essentials.
                Shop from top brands with exclusive offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/makeup"
                  className="bg-pink-600 text-white px-8 py-3 rounded-md font-medium hover:bg-pink-700 transition-colors text-center"
                >
                  Shop Makeup
                </Link>
                <Link
                  href="/skincare"
                  className="border border-pink-600 text-pink-600 px-8 py-3 rounded-md font-medium hover:bg-pink-50 transition-colors text-center"
                >
                  Explore Skincare
                </Link>
              </div>
            </div>
            <div className="relative h-64 lg:h-96">
              <Image
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=400&fit=crop"
                alt="Beauty products"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Categories - Show ALL Active Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Shop by Category
            </h2>
            <p className="text-gray-600">
              Explore our complete range of beauty categories
            </p>
          </div>
          
          <DynamicCategoriesGrid
            categories={categories}
            loading={categoriesLoading}
            error={categoriesError}
            showViewAll={true}
            maxDisplay={8}
            gridCols="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
          />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link
              href="/products"
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              View All →
            </Link>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          ) : productsError ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Failed to load products: {productsError}</p>
              <p className="text-gray-500">Please check that the backend server is running.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Best Sellers
            </h2>
            <Link
              href="/products?sort=popular"
              className="text-pink-600 hover:text-pink-700 font-medium"
            >
              View All →
            </Link>
          </div>
          
          {productsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
          ) : productsError ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-4">Failed to load products: {productsError}</p>
              <p className="text-gray-500">Please check that the backend server is running.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay in the Loop
          </h2>
          <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
            Get the latest beauty tips, product launches, and exclusive offers
            delivered straight to your inbox.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 rounded-md border-0 focus:ring-2 focus:ring-pink-300 focus:outline-none"
            />
            <button 
              type="submit"
              disabled={isSubscribing || !email}
              className="bg-white text-pink-600 px-6 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
