'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useProducts } from '@/hooks/useProducts';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  ShoppingBagIcon, 
  UsersIcon, 
  ChartBarIcon,
  CurrencyRupeeIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const { products, loading } = useProducts();
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenueChange: 0,
    ordersChange: 0,
    customersChange: 0
  });

  useEffect(() => {
    // Simulate fetching dashboard data
    const calculateDashboardData = () => {
      const totalRevenue = products.reduce((sum, product) => sum + (product.price * (product.stockCount || 1)), 0);
      const totalOrders = Math.floor(totalRevenue / 1500); // Approximate orders
      const totalCustomers = Math.floor(totalOrders * 0.7); // Approximate unique customers
      
      setDashboardData({
        totalRevenue,
        totalOrders,
        totalCustomers,
        revenueChange: 12.5,
        ordersChange: 8.3,
        customersChange: 15.2
      });
    };
    
    if (!loading && products.length > 0) {
      calculateDashboardData();
    }
  }, [products, loading]);
  

  const stats = [
    {
      name: 'Total Products',
      value: products.length,
      change: null,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Revenue',
      value: `₹${dashboardData.totalRevenue.toLocaleString('en-IN')}`,
      change: dashboardData.revenueChange,
      icon: CurrencyRupeeIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Total Orders',
      value: dashboardData.totalOrders.toLocaleString('en-IN'),
      change: dashboardData.ordersChange,
      icon: ChartBarIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Total Customers',
      value: dashboardData.totalCustomers.toLocaleString('en-IN'),
      change: dashboardData.customersChange,
      icon: UsersIcon,
      color: 'bg-pink-500'
    }
  ];

  const recentOrders = [
    { id: '#ORD001', customer: 'Sarah Johnson', product: 'MAC Lipstick - Ruby Woo', amount: '₹1,950', status: 'Delivered', date: '2024-02-20' },
    { id: '#ORD002', customer: 'Emily Chen', product: 'The Ordinary Niacinamide 10%', amount: '₹700', status: 'Shipped', date: '2024-02-20' },
    { id: '#ORD003', customer: 'Priya Sharma', product: 'Urban Decay Naked3 Palette', amount: '₹3,200', status: 'Processing', date: '2024-02-19' },
    { id: '#ORD004', customer: 'Jessica Wilson', product: 'Lakme Perfect Radiance', amount: '₹175', status: 'Confirmed', date: '2024-02-19' },
    { id: '#ORD005', customer: 'Ariana Patel', product: 'Maybelline Fit Me Foundation', amount: '₹599', status: 'Delivered', date: '2024-02-18' },
  ];

  const topProducts = products
    .filter(p => p.rating >= 4.5)
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 5);

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`${stat.color} p-3 rounded-md`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                {stat.change !== null && (
                  <div className={`flex items-center text-sm font-medium ${
                    stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change >= 0 ? (
                      <ArrowUpIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              <Link href="/admin/orders" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <div key={order.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{order.id}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{order.customer}</p>
                      <p className="text-sm text-gray-500">{order.product}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium text-gray-900">{order.amount}</span>
                        <span className="text-xs text-gray-400">{order.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Top Rated Products</h3>
              <Link href="/admin/products" className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {topProducts.map((product) => (
                <div key={product.id} className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {product.name.substring(0, 40)}...
                      </p>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center">
                          <span className="text-sm text-yellow-500">★</span>
                          <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                          <span className="text-xs text-gray-400 ml-1">({product.reviewCount})</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          ₹{product.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}
