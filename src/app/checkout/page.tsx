"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { TruckIcon } from "@heroicons/react/24/outline";

export default function CheckoutPage() {
  const { state, clearCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    paymentMethod: "cod" as "cod" | "card",
  });

  const subtotal = state.total;
  const shipping = subtotal >= 499 ? 0 : 50;
  const total = subtotal + shipping;

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!form.firstName || !form.lastName) return "Please enter your full name.";
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Please enter a valid email.";
    if (!form.phone || form.phone.replace(/\D/g, "").length < 10)
      return "Please enter a valid phone number.";
    if (!form.address || !form.city || !form.state || !form.postalCode)
      return "Please complete your shipping address.";
    return null;
  };

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      showToast(error, "error");
      return;
    }
    if (state.items.length === 0) {
      showToast("Your cart is empty.", "info");
      router.push("/products");
      return;
    }

    // Simulate order success
    showToast("Order placed successfully!", "success");
    clearCart();
    router.push("/");
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some items before proceeding to checkout.</p>
          <Link
            href="/products"
            className="bg-pink-600 text-white px-6 py-3 rounded-md hover:bg-pink-700 transition-colors inline-block"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping & Payment */}
          <form onSubmit={placeOrder} className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={onChange}
                  placeholder="First name"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={onChange}
                  placeholder="Last name"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="Email"
                  className="sm:col-span-2 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <input
                  name="phone"
                  value={form.phone}
                  onChange={onChange}
                  placeholder="Phone number"
                  className="sm:col-span-2 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="address"
                  value={form.address}
                  onChange={onChange}
                  placeholder="Address"
                  className="sm:col-span-2 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <input
                  name="city"
                  value={form.city}
                  onChange={onChange}
                  placeholder="City"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <input
                  name="state"
                  value={form.state}
                  onChange={onChange}
                  placeholder="State"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <input
                  name="postalCode"
                  value={form.postalCode}
                  onChange={onChange}
                  placeholder="Postal code"
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              {shipping === 0 ? (
                <p className="mt-4 text-sm text-green-700">You&apos;re eligible for FREE shipping!</p>
              ) : (
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

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Payment</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={form.paymentMethod === "cod"}
                    onChange={onChange}
                  />
                  <span>Cash on Delivery (COD)</span>
                </label>
                <label className="flex items-center gap-3 opacity-60 cursor-not-allowed">
                  <input type="radio" disabled />
                  <span>Credit/Debit Card (coming soon)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-3 rounded-md hover:bg-pink-700 transition-colors font-medium"
            >
              Place Order
            </button>
          </form>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>

              <div className="divide-y divide-gray-100">
                {state.items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      width={56}
                      height={56}
                      className="rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{shipping === 0 ? "Free" : `₹${shipping}`}</span>
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

              <p className="mt-3 text-xs text-gray-500">By placing your order, you agree to our Terms & Conditions.</p>
            </div>

            <Link
              href="/cart"
              className="block text-center text-pink-600 hover:text-pink-700 font-medium"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
