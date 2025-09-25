'use client';

import { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';

export default function TestReviewsPage() {
  const { products, loading, error } = useProducts();
  
  if (loading) return <div className="p-8">Loading products...</div>;
  if (error) return <div className="p-8">Error: {error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Review Values Test</h1>
      
      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="border border-gray-300 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Rating:</span> 
                <span className="ml-2">{product.rating.toFixed(1)} / 5.0</span>
              </div>
              <div>
                <span className="font-medium">Review Count:</span> 
                <span className="ml-2">{product.reviewCount} reviews</span>
              </div>
              <div>
                <span className="font-medium">Price:</span> 
                <span className="ml-2">₹{product.price}</span>
              </div>
              <div>
                <span className="font-medium">Stock:</span> 
                <span className="ml-2">{product.stockCount} units</span>
              </div>
            </div>
            <div className="mt-2">
              <span className="font-medium">Category:</span> 
              <span className="ml-2">{product.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
