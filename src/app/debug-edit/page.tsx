'use client';

import { useState } from 'react';
import ProductModal from '@/components/admin/ProductModal';
import { Product } from '@/types';

const testProduct: Product = {
  id: 'test-123',
  name: 'Test Product',
  description: 'This is a test product',
  price: 29.99,
  originalPrice: 39.99,
  discount: 25,
  category: 'Skincare',
  subcategory: 'Moisturizers',
  brand: 'Test Brand',
  image: 'https://via.placeholder.com/400',
  images: ['https://via.placeholder.com/400'],
  inStock: true,
  stockCount: 50,
  rating: 4.5,
  reviewCount: 123,
  tags: ['test', 'debug'],
  createdAt: new Date(),
  updatedAt: new Date()
};

export default function DebugEditPage() {
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (product: Product) => {
    console.log('Save called with product:', product);
    setIsSubmitting(true);
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setShowModal(false);
    alert('Product saved successfully!');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Product Edit</h1>
      
      <button
        onClick={() => {
          console.log('Opening modal with test product:', testProduct);
          setShowModal(true);
        }}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Test Edit Product Modal
      </button>

      <div className="mt-4">
        <p><strong>Modal Open:</strong> {showModal ? 'Yes' : 'No'}</p>
        <p><strong>Is Submitting:</strong> {isSubmitting ? 'Yes' : 'No'}</p>
      </div>

      <ProductModal
        isOpen={showModal}
        onClose={() => {
          console.log('Modal close called');
          setShowModal(false);
        }}
        onSave={handleSave}
        product={testProduct}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
