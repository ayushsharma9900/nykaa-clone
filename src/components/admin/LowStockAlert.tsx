'use client';

import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { apiService } from '@/lib/api';

interface LowStockProduct {
  _id: string;
  name: string;
  sku: string;
  stock: number;
  category: string;
  price: number;
}

interface LowStockAlertProps {
  threshold?: number;
  limit?: number;
  className?: string;
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({
  threshold = 10,
  limit = 10,
  className = ''
}) => {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getLowStockProducts(threshold, limit);
      
      if (response.success && response.data) {
        setLowStockProducts(response.data);
        setLastRefresh(new Date());
      } else {
        throw new Error(response.message || 'Failed to fetch low stock products');
      }
    } catch (err) {
      console.error('Failed to fetch low stock products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockProducts();
  }, [threshold, limit]);

  const handleRefresh = () => {
    fetchLowStockProducts();
  };

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 bg-red-50';
    if (stock <= 5) return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return 'Critical';
    return 'Low Stock';
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Low Stock Alert</h3>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="text-center py-4">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
            >
              Try again
            </button>
          </div>
        ) : (
          <>
            {lowStockProducts.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-green-500 mb-2">
                  <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">All products are well-stocked!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        SKU: {product.sku} • {product.category}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{product.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(
                            product.stock
                          )}`}
                        >
                          {product.stock} left
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {getStockStatusText(product.stock)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-500">
                  Showing {lowStockProducts.length} products with stock ≤ {threshold}
                </div>
                <div className="text-gray-400">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LowStockAlert;
