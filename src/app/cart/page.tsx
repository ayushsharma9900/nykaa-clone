'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { 
  TrashIcon, 
  PlusIcon, 
  MinusIcon,
  ShoppingBagIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

export default function CartPage() {
  const { state, updateQuantity, removeFromCart } = useCart();
  const [promoCode, setPromoCode] = useState('');

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const subtotal = state.total;
  const savings = state.items.reduce((sum, item) => {
    const originalPrice = item.product.originalPrice || item.product.price;
    return sum + ((originalPrice - item.product.price) * item.quantity);
  }, 0);
  const shipping = subtotal >= 499 ? 0 : 50;
  const total = subtotal + shipping;

  const applyPromoCode = () => {
    // TODO: Implement promo code logic
    alert(`Promo code "${promoCode}" applied!`);
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBagIcon className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven&apos;t added any items to your cart yet.</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={80}
                      height={80}
                      className="rounded-lg object-cover"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                          {item.product.brand}
                        </p>
                        <h3 className="font-medium text-gray-900 mb-2">
                          <Link 
                            href={`/product/${item.productId}`}
                            className="hover:text-pink-600"
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">₹{item.price}</span>
                          {item.product.originalPrice && item.product.originalPrice > item.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ₹{item.product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          className="p-2 hover:bg-gray-100 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 border-x border-gray-300 min-w-[50px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          className="p-2 hover:bg-gray-100"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                        {item.product.originalPrice && item.product.originalPrice > item.price && (
                          <p className="text-sm text-green-600">
                            Save ₹{((item.product.originalPrice - item.price) * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="space-y-6">
            {/* Promo Code */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Promo Code</h3>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <button
                  onClick={applyPromoCode}
                  className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({state.items.length} items)</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount</span>
                    <span className="font-medium text-green-600">-₹{savings.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${shipping}`
                    )}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-lg font-semibold text-gray-900">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-3">
                <Link href="/checkout" className="w-full inline-block text-center bg-pink-600 text-white py-3 rounded-md hover:bg-pink-700 transition-colors font-medium">
                  Proceed to Checkout
                </Link>
                
                <Link
                  href="/products"
                  className="block text-center text-pink-600 hover:text-pink-700 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
              
              {/* Free Shipping Banner */}
              {subtotal < 499 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center space-x-2 text-sm text-blue-800">
                    <TruckIcon className="h-4 w-4" />
                    <span>
                      Add ₹{(499 - subtotal).toLocaleString()} more for FREE shipping
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}