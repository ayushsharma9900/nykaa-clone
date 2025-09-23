'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { products, categories } from '@/data/products';
import ProductCard from '@/components/ui/ProductCard';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  
  const featuredProducts = products.slice(0, 8);
  const bestSellers = products.filter(p => p.rating >= 4.5).slice(0, 6);
  
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

      {/* Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/${category.slug}`}
                className="group text-center"
              >
                <div className="bg-pink-50 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                  <span className="text-2xl text-pink-600">💄</span>
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
