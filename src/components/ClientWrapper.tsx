'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { ToastProvider } from '@/contexts/ToastContext';

interface ClientWrapperProps {
  children: React.ReactNode;
}

export default function ClientWrapper({ children }: ClientWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Loading header */}
        <header className="bg-white shadow-sm">
          <div className="bg-pink-50 text-center py-2 text-sm">
            <p className="text-pink-800">FREE SHIPPING ON ORDERS ABOVE ₹499 | COD AVAILABLE</p>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-pink-600">kaayalife</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Loading content */}
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading beauty store...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <WishlistProvider>
        <CartProvider>
          <Header />
          {children}
        </CartProvider>
      </WishlistProvider>
    </ToastProvider>
  );
}
