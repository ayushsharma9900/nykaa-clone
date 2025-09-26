'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useMenuItems } from '@/hooks/useMenuItems';
import MegaDropdown from '@/components/ui/MegaDropdown';
import { 
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  UserIcon,
  HeartIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export default function Header() {
  const { state } = useCart();
  const { state: wishlistState } = useWishlist();
  const { menuItems, loading: menuLoading } = useMenuItems();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({}); // mobile submenu state
  
  // Top-level menu items already come hierarchical from API (with children)
  const navMenuItems = menuItems; // roots with children
  
  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

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
              kaayalife
            </Link>
          </div>

          {/* Desktop Navigation - Enhanced mega dropdown */}
          <nav className="hidden md:flex space-x-4">
            {menuLoading ? (
              <div className="flex space-x-4">
                {[...Array(6)].map((_, i) => (
                  <MegaDropdown key={i} category={{} as any} isLoading={true} />
                ))}
              </div>
            ) : (
              navMenuItems.map((category) => (
                <MegaDropdown key={category._id} category={category} />
              ))
            )}
          </nav>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md text-pink-600 placeholder-pink-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
              <button type="submit" className="absolute right-2 top-2 hover:text-pink-600">
                <MagnifyingGlassIcon className="h-5 w-5 text-pink-500" />
              </button>
            </form>
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

            <Link href="/wishlist" className="text-gray-600 hover:text-gray-900 relative">
              <HeartIcon className="h-6 w-6" />
              {wishlistState.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {wishlistState.itemCount > 99 ? '99+' : wishlistState.itemCount}
                </span>
              )}
            </Link>
            
            <Link href="/account" className="text-gray-600 hover:text-gray-900">
              <UserIcon className="h-6 w-6" />
            </Link>
            
            <Link href="/cart" className="text-gray-600 hover:text-gray-900 relative">
              <ShoppingBagIcon className="h-6 w-6" />
              {state.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {state.itemCount > 99 ? '99+' : state.itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="md:hidden py-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands..."
                className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-md text-pink-600 placeholder-pink-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                autoFocus
              />
              <button type="submit" className="absolute right-2 top-2 hover:text-pink-600">
                <MagnifyingGlassIcon className="h-5 w-5 text-pink-500" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Navigation Menu - Dynamic with collapsible submenus */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="py-4 space-y-2">
              {menuLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                navMenuItems.map((category) => (
                  <div key={category._id} className="">
                    <div className="flex items-center justify-between">
                      <Link 
                        href={`/${category.slug}`} 
                        className="block text-gray-700 hover:text-pink-600 font-medium py-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {category.name}
                      </Link>
                      {category.children && category.children.length > 0 && (
                        <button 
                          className="text-gray-500 hover:text-gray-700 px-2"
                          onClick={() => toggleExpand(category._id)}
                          aria-label="Toggle submenu"
                        >
                          <ChevronDownIcon 
                            className={`h-5 w-5 transition-transform ${expanded[category._id] ? 'rotate-180' : ''}`} 
                          />
                        </button>
                      )}
                    </div>

                    {/* Collapsible children (level 1) */}
                    {category.children && category.children.length > 0 && expanded[category._id] && (
                      <div className="pl-4 border-l border-gray-200 ml-2">
                        {category.children.map((child) => (
                          <div key={child._id} className="py-1">
                            <Link 
                              href={`/${child.slug}`} 
                              className="block text-gray-600 hover:text-pink-600 text-sm py-1"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {child.name}
                            </Link>
                            {/* Level 2 children */}
                            {child.children && child.children.length > 0 && (
                              <ul className="pl-4 ml-2 border-l border-gray-100">
                                {child.children.map((sub) => (
                                  <li key={sub._id} className="py-1">
                                    <Link 
                                      href={`/${sub.slug}`} 
                                      className="block text-gray-500 hover:text-pink-600 text-sm"
                                      onClick={() => setIsMenuOpen(false)}
                                    >
                                      {sub.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
