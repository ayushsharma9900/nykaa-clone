'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { categories } from '@/data/products';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => Promise<void> | void;
  product?: Product | null;
  isSubmitting?: boolean;
}

export default function ProductModal({ isOpen, onClose, onSave, product, isSubmitting = false }: ProductModalProps) {
  console.log('ProductModal rendered with:', { isOpen, product: product?.name });
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    category: 'Skincare',
    subcategory: '',
    brand: '',
    image: '',
    images: [''],
    inStock: true,
    stockCount: 0,
    rating: 0,
    reviewCount: 0,
    tags: [],
    discount: undefined
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    console.log('ProductModal useEffect triggered with product:', product);
    if (product) {
      console.log('Setting form data with product:', product.name, 'Price:', product.price);
      setFormData({
        ...product,
        images: product.images || ['']
      });
      setTagInput(product.tags?.join(', ') || '');
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        price: 0,
        originalPrice: undefined,
        category: 'Skincare',
        subcategory: '',
        brand: '',
        image: '',
        images: [''],
        inStock: true,
        stockCount: 0,
        rating: 0,
        reviewCount: 0,
        tags: [],
        discount: undefined
      });
      setTagInput('');
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      let numValue = parseFloat(value) || 0;
      
      // Apply specific validations for different fields
      if (name === 'rating') {
        numValue = Math.max(0, Math.min(5, numValue)); // Clamp between 0 and 5
      } else if (name === 'reviewCount' || name === 'stockCount') {
        numValue = Math.max(0, numValue); // Ensure non-negative
      } else if (name === 'price' || name === 'originalPrice') {
        numValue = Math.max(0, numValue); // Ensure non-negative prices
      }
      
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...(formData.images || [''])];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
    
    // Set main image to first image if it's empty
    if (index === 0 && value && !formData.image) {
      setFormData(prev => ({ ...prev, image: value }));
    }
  };

  const addImageField = () => {
    setFormData(prev => ({ 
      ...prev, 
      images: [...(prev.images || ['']), ''] 
    }));
  };

  const removeImageField = (index: number) => {
    const newImages = (formData.images || ['']).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages.length ? newImages : [''] }));
  };

  const handleTagsChange = (value: string) => {
    setTagInput(value);
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate discount if both prices are provided
    let discount = formData.discount;
    if (formData.originalPrice && formData.price && formData.originalPrice > formData.price) {
      discount = Math.round(((formData.originalPrice - formData.price) / formData.originalPrice) * 100);
    }

    const newProduct: Product = {
      id: product?.id || Date.now().toString(),
      name: formData.name || '',
      description: formData.description || '',
      price: formData.price || 0,
      originalPrice: formData.originalPrice,
      discount,
      category: formData.category || 'Skincare',
      subcategory: formData.subcategory || '',
      brand: formData.brand || '',
      image: formData.image || formData.images?.[0] || '',
      images: (formData.images || ['']).filter(img => img.trim().length > 0),
      inStock: formData.inStock ?? true,
      stockCount: formData.stockCount || 0,
      rating: formData.rating || 0,
      reviewCount: formData.reviewCount || 0,
      tags: formData.tags || [],
      createdAt: product?.createdAt || new Date(),
      updatedAt: new Date()
    };

    await onSave(newProduct);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Brand *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category || 'Skincare'}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Subcategory
                </label>
                <input
                  type="text"
                  name="subcategory"
                  value={formData.subcategory || ''}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || 0}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Original Price (₹)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice || ''}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Stock Count *
                </label>
                <input
                  type="number"
                  name="stockCount"
                  value={formData.stockCount || 0}
                  onChange={handleInputChange}
                  required
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="inStock"
                  checked={formData.inStock ?? true}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm font-medium text-gray-800">
                  In Stock
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Product Images
            </label>
            <div className="space-y-2">
              {(formData.images || ['']).map((image, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="Image URL"
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  />
                  {(formData.images || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="text-red-600 hover:text-red-800 px-2 py-1 text-sm font-medium"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImageField}
                className="text-pink-600 hover:text-pink-800 text-sm font-medium"
              >
                + Add Another Image
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="e.g., skincare, moisturizer, anti-aging"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            />
          </div>

          {/* Rating & Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Rating (0-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating || 0}
                onChange={handleInputChange}
                min="0"
                max="5"
                step="0.1"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Review Count
              </label>
              <input
                type="number"
                name="reviewCount"
                value={formData.reviewCount || 0}
                onChange={handleInputChange}
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 bg-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>
                {isSubmitting 
                  ? (product ? 'Updating...' : 'Adding...') 
                  : (product ? 'Update Product' : 'Add Product')
                }
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}