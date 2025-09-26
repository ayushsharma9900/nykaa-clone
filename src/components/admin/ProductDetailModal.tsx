'use client';

import { Product } from '@/types';
import { XMarkIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface ProductDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export default function ProductDetailModal({ isOpen, onClose, product }: ProductDetailModalProps) {
  if (!isOpen || !product) return null;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="h-5 w-5 text-yellow-400" />
      );
    }
    
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-5 w-5 text-gray-300" />
      );
    }
    
    return stars;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="admin-modal bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" data-admin-modal>
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="admin-modal-text text-xl font-semibold">Product Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square relative overflow-hidden rounded-md bg-gray-100">
                      <img
                        src={image}
                        alt={`${product.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="admin-modal-text-muted text-sm uppercase tracking-wide mb-1">
                  {product.brand}
                </p>
                <h1 className="admin-modal-text text-2xl font-bold mb-2">
                  {product.name}
                </h1>
                <p className="admin-modal-text-secondary">
                  {product.description}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {renderStars(product.rating)}
                </div>
                <span className="admin-modal-text-secondary text-sm">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <span className="admin-modal-text text-3xl font-bold">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && (
                    <>
                      <span className="admin-modal-text-muted text-lg line-through">
                        ₹{product.originalPrice}
                      </span>
                      {product.discount && (
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                          {product.discount}% OFF
                        </span>
                      )}
                    </>
                  )}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-sm text-green-600">
                    You save ₹{product.originalPrice - product.price}
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                  <span className="admin-modal-text-secondary text-sm">
                    {product.stockCount} units available
                  </span>
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="space-y-2">
                <div>
                  <span className="admin-modal-text text-sm font-medium">Category: </span>
                  <span className="admin-modal-text-secondary text-sm">{product.category}</span>
                </div>
                {product.subcategory && (
                  <div>
                    <span className="admin-modal-text text-sm font-medium">Subcategory: </span>
                    <span className="admin-modal-text-secondary text-sm">{product.subcategory}</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <span className="admin-modal-text text-sm font-medium block mb-2">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="pt-4 border-t space-y-1">
                <div className="admin-modal-text-muted text-xs">
                  <span className="font-medium">Created:</span> {new Date(product.createdAt).toLocaleDateString()}
                </div>
                <div className="admin-modal-text-muted text-xs">
                  <span className="font-medium">Updated:</span> {new Date(product.updatedAt).toLocaleDateString()}
                </div>
                <div className="admin-modal-text-muted text-xs">
                  <span className="font-medium">Product ID:</span> {product.id}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}