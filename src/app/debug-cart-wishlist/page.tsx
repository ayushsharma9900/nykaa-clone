'use client';

import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';

export default function DebugCartWishlist() {
  const { state: cartState, addToCart } = useCart();
  const { state: wishlistState, addToWishlist } = useWishlist();
  const { showToast } = useToast();

  const testProduct = {
    id: 'test-1',
    _id: 'test-1',
    name: 'Test Product',
    description: 'A test product for debugging',
    price: 100,
    originalPrice: 120,
    discount: 20,
    category: 'Skincare',
    subcategory: 'Test',
    brand: 'Test Brand',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'],
    inStock: true,
    stockCount: 10,
    rating: 4.5,
    reviewCount: 100,
    tags: ['test'],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const handleAddToCart = () => {
    try {
      addToCart(testProduct, 1);
      showToast('Test product added to cart!');
      console.log('Added to cart successfully');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showToast('Error adding to cart', 'error');
    }
  };

  const handleAddToWishlist = () => {
    try {
      addToWishlist(testProduct);
      showToast('Test product added to wishlist!');
      console.log('Added to wishlist successfully');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      showToast('Error adding to wishlist', 'error');
    }
  };

  const testLocalStorage = () => {
    try {
      // Test localStorage write
      localStorage.setItem('test-key', 'test-value');
      const value = localStorage.getItem('test-key');
      localStorage.removeItem('test-key');
      
      if (value === 'test-value') {
        showToast('localStorage is working!');
        console.log('localStorage test passed');
      } else {
        showToast('localStorage test failed', 'error');
        console.error('localStorage test failed');
      }
    } catch (error) {
      console.error('localStorage error:', error);
      showToast('localStorage is not available', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Cart & Wishlist Debug Page
        </h1>

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleAddToCart}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Test Add to Cart
          </button>
          <button
            onClick={handleAddToWishlist}
            className="bg-pink-600 text-white py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors"
          >
            Test Add to Wishlist
          </button>
          <button
            onClick={testLocalStorage}
            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            Test localStorage
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cart State */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cart State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Item Count:</strong> {cartState.itemCount}</p>
              <p><strong>Total:</strong> ₹{cartState.total}</p>
              <p><strong>Items:</strong></p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(cartState.items, null, 2)}
              </pre>
            </div>
          </div>

          {/* Wishlist State */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Wishlist State</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Item Count:</strong> {wishlistState.itemCount}</p>
              <p><strong>Items:</strong></p>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(wishlistState.items, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* localStorage Inspection */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">localStorage Contents</h2>
          <div className="space-y-4">
            <div>
              <strong>Cart localStorage:</strong>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto mt-2">
                {typeof window !== 'undefined' 
                  ? localStorage.getItem('kaayalife-cart') || 'No cart data'
                  : 'localStorage not available (SSR)'
                }
              </pre>
            </div>
            <div>
              <strong>Wishlist localStorage:</strong>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto mt-2">
                {typeof window !== 'undefined' 
                  ? localStorage.getItem('kaayalife-wishlist') || 'No wishlist data'
                  : 'localStorage not available (SSR)'
                }
              </pre>
            </div>
          </div>
        </div>

        {/* Environment Info */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Info</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Window available:</strong> {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
            <p><strong>User Agent:</strong> {typeof window !== 'undefined' ? navigator.userAgent : 'Not available'}</p>
            <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Not available'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
