'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/contexts/ToastContext';
import { 
  HeartIcon,
  ShoppingBagIcon,
  TrashIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

export default function WishlistPage() {
  const { state: wishlistState, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const wishlistItems = wishlistState.items;

  const handleAddToCart = (productId: string, productName: string) => {
    const wishlistItem = wishlistItems.find(item => item.productId === productId);
    if (wishlistItem) {
      addToCart(wishlistItem.product, 1);
      showToast(`Added ${productName} to cart!`);
    }
  };

  const moveAllToCart = () => {
    const availableItems = wishlistItems.filter(item => item.product.inStock);
    if (availableItems.length > 0) {
      availableItems.forEach(item => {
        addToCart(item.product, 1);
      });
      showToast(`Added ${availableItems.length} items to cart!`);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="h-4 w-4 text-yellow-400" />
      );
    }
    
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }
    
    return stars;
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Save items you love to your wishlist and shop them later.</p>
            <Link
              href="/products"
              className="bg-pink-600 text-white px-8 py-3 rounded-md hover:bg-pink-700 transition-colors inline-block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-600 mt-1">{wishlistItems.length} items saved</p>
          </div>
          
          {wishlistItems.some(item => item.product.inStock) && (
            <button
              onClick={moveAllToCart}
              className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors flex items-center space-x-2"
            >
              <ShoppingBagIcon className="h-5 w-5" />
              <span>Add All to Cart</span>
            </button>
          )}
        </div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Remove from wishlist button */}
              <button 
                onClick={() => removeFromWishlist(item.productId)}
                className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
              >
                <HeartSolidIcon className="h-5 w-5 text-pink-600" />
              </button>

              {/* Discount badge */}
              {item.product.discount && (
                <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                  {item.product.discount}% OFF
                </div>
              )}

              <Link href={`/product/${item.productId}`}>
                {/* Product image */}
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <Image
                    src={item.product.image}
                    alt={item.product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>

                {/* Product info */}
                <div className="p-4">
                  {/* Brand */}
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {item.product.brand}
                  </p>

                  {/* Product name */}
                  <h3 className="font-medium text-gray-900 text-sm leading-5 mb-2 line-clamp-2">
                    {item.product.name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center space-x-1 mb-2">
                    <div className="flex items-center">
                      {renderStars(item.product.rating)}
                    </div>
                    <span className="text-xs text-gray-500">({item.product.reviewCount})</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{item.product.price.toLocaleString()}
                    </span>
                    {item.product.originalPrice && (
                      <>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{item.product.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-green-600 font-medium">
                          Save ₹{(item.product.originalPrice - item.product.price).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Stock status */}
                  <div className="flex items-center space-x-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${item.product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-xs ${item.product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {item.product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Action buttons */}
              <div className="p-4 pt-0 space-y-2">
                <button 
                  onClick={() => handleAddToCart(item.productId, item.product.name)}
                  className="w-full py-2 px-4 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  disabled={!item.product.inStock}
                >
                  <ShoppingBagIcon className="h-4 w-4" />
                  <span>{item.product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </button>

                <button
                  onClick={() => removeFromWishlist(item.productId)}
                  className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-12">
          <Link
            href="/products"
            className="text-pink-600 hover:text-pink-700 font-medium"
          >
            Continue Shopping →
          </Link>
        </div>
      </div>
    </div>
  );
}