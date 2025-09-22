'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
  HeartIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      {/* Top banner */}
      <div className="bg-pink-50 text-center py-2 text-sm">
        <p className="text-pink-800">FREE SHIPPING ON ORDERS ABOVE ₹499 | COD AVAILABLE</p>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-pink-600">
              Nykaa
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/skincare" className="text-gray-700 hover:text-pink-600 font-medium">
              Skincare
            </Link>
            <Link href="/makeup" className="text-gray-700 hover:text-pink-600 font-medium">
              Makeup
            </Link>
            <Link href="/hair-care" className="text-gray-700 hover:text-pink-600 font-medium">
              Hair Care
            </Link>
            <Link href="/fragrance" className="text-gray-700 hover:text-pink-600 font-medium">
              Fragrance
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search for products, brands..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button className="absolute right-2 top-2">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center space-x-4">
            {/* Mobile search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>

            <Link href="/wishlist" className="text-gray-600 hover:text-gray-900">
              <HeartIcon className="h-6 w-6" />
            </Link>
            
            <Link href="/account" className="text-gray-600 hover:text-gray-900">
              <UserIcon className="h-6 w-6" />
            </Link>
            
            <Link href="/cart" className="text-gray-600 hover:text-gray-900 relative">
              <ShoppingBagIcon className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                0
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden py-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products, brands..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button className="absolute right-2 top-2">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        )}

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="py-4 space-y-4">
              <Link 
                href="/skincare" 
                className="block text-gray-700 hover:text-pink-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Skincare
              </Link>
              <Link 
                href="/makeup" 
                className="block text-gray-700 hover:text-pink-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Makeup
              </Link>
              <Link 
                href="/hair-care" 
                className="block text-gray-700 hover:text-pink-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Hair Care
              </Link>
              <Link 
                href="/fragrance" 
                className="block text-gray-700 hover:text-pink-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Fragrance
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
