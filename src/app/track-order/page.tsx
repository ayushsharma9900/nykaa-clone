"use client";

import { useState } from "react";

type Status =
  | { found: true; id: string; status: string; eta: string }
  | { found: false; id: string };

function simulateLookup(id: string): Status {
  if (!id) return { found: false, id };
  // Simple deterministic mock: based on last char code
  const code = id.charCodeAt(id.length - 1) % 4;
  const statuses = [
    { status: "Order placed", eta: "3-5 days" },
    { status: "Packed", eta: "2-4 days" },
    { status: "Shipped", eta: "1-3 days" },
    { status: "Out for delivery", eta: "Today" },
  ];
  const s = statuses[code];
  return { found: true, id, status: s.status, eta: s.eta };
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState<Status | null>(null);
  const [checking, setChecking] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setTimeout(() => {
      setResult(simulateLookup(orderId.trim()));
      setChecking(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Order</h1>
        <p className="text-gray-700 mb-6">
          Enter your Order ID to view the current status and estimated delivery time.
        </p>
        <form onSubmit={onSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-4">
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Enter Order ID (e.g., KAY123456)"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={checking || !orderId.trim()}
            className="bg-pink-600 text-white px-6 py-3 rounded-md font-medium hover:bg-pink-700 transition-colors disabled:opacity-50"
          >
            {checking ? "Checking..." : "Check Status"}
          </button>
        </form>

        {result && (
          <div className="mt-6 bg-white p-6 rounded-lg shadow-sm">
            {result.found ? (
              <div>
                <p className="text-gray-700">Order ID: <span className="font-medium">{result.id}</span></p>
                <p className="text-gray-700">Current status: <span className="font-medium">{result.status}</span></p>
                <p className="text-gray-700">ETA: <span className="font-medium">{result.eta}</span></p>
              </div>
            ) : (
              <p className="text-red-600">Order not found. Please verify your Order ID.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
