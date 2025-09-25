'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';

const analyticsData = {
  overview: {
    totalRevenue: 145230,
    revenueChange: 12.5,
    totalOrders: 1247,
    ordersChange: -3.2,
    totalCustomers: 892,
    customersChange: 8.7,
    conversionRate: 3.4,
    conversionChange: 1.2
  },
  topProducts: [
    { name: 'MAC Lipstick - Ruby Woo', revenue: 15600, orders: 8 },
    { name: 'The Ordinary Niacinamide', revenue: 12300, orders: 24 },
    { name: 'Urban Decay Palette', revenue: 11200, orders: 4 },
    { name: 'Maybelline Foundation', revenue: 9800, orders: 18 },
    { name: 'Lakme Facewash', revenue: 7400, orders: 42 }
  ],
  salesByCategory: [
    { category: 'Skincare', revenue: 65420, percentage: 45 },
    { category: 'Makeup', revenue: 52184, percentage: 36 },
    { category: 'Haircare', revenue: 17426, percentage: 12 },
    { category: 'Fragrance', revenue: 10200, percentage: 7 }
  ],
  monthlyRevenue: [
    { month: 'Jan', revenue: 12500 },
    { month: 'Feb', revenue: 15800 },
    { month: 'Mar', revenue: 14200 },
    { month: 'Apr', revenue: 18900 },
    { month: 'May', revenue: 21300 },
    { month: 'Jun', revenue: 19800 },
    { month: 'Jul', revenue: 23400 },
    { month: 'Aug', revenue: 25600 },
    { month: 'Sep', revenue: 22100 },
    { month: 'Oct', revenue: 24800 },
    { month: 'Nov', revenue: 27300 },
    { month: 'Dec', revenue: 29500 }
  ],
  topCustomers: [
    { name: 'Priya Sharma', email: 'priya.sharma@email.com', spent: 45690, orders: 22 },
    { name: 'Emily Chen', email: 'emily.chen@email.com', spent: 28750, orders: 15 },
    { name: 'Sarah Johnson', email: 'sarah.johnson@email.com', spent: 12450, orders: 8 },
    { name: 'Jessica Wilson', email: 'jessica.wilson@email.com', spent: 3250, orders: 4 },
    { name: 'Ariana Patel', email: 'ariana.patel@email.com', spent: 1299, orders: 2 }
  ]
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-1">Track your business performance and insights</p>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={`border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-pink-500 focus:border-pink-500 ${
                timeRange === '30d' ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d" className="text-red-600">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-green-500 p-3 rounded-md">
                  <CurrencyRupeeIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₹{analyticsData.overview.totalRevenue.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className={`flex items-center text-sm font-medium ${getChangeColor(analyticsData.overview.revenueChange)}`}>
                {analyticsData.overview.revenueChange >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                )}
                {Math.abs(analyticsData.overview.revenueChange)}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-blue-500 p-3 rounded-md">
                  <ShoppingCartIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsData.overview.totalOrders.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className={`flex items-center text-sm font-medium ${getChangeColor(analyticsData.overview.ordersChange)}`}>
                {analyticsData.overview.ordersChange >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                )}
                {Math.abs(analyticsData.overview.ordersChange)}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-purple-500 p-3 rounded-md">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsData.overview.totalCustomers.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className={`flex items-center text-sm font-medium ${getChangeColor(analyticsData.overview.customersChange)}`}>
                {analyticsData.overview.customersChange >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                )}
                {Math.abs(analyticsData.overview.customersChange)}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-yellow-500 p-3 rounded-md">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {analyticsData.overview.conversionRate}%
                  </p>
                </div>
              </div>
              <div className={`flex items-center text-sm font-medium ${getChangeColor(analyticsData.overview.conversionChange)}`}>
                {analyticsData.overview.conversionChange >= 0 ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                )}
                {Math.abs(analyticsData.overview.conversionChange)}%
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Revenue</h3>
            <div className="space-y-3">
              {analyticsData.monthlyRevenue.slice(-6).map((data) => (
                <div key={data.month} className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 w-12">{data.month}</span>
                  <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-pink-600 h-2 rounded-full"
                      style={{ width: `${(data.revenue / 30000) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{data.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sales by Category */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sales by Category</h3>
            <div className="space-y-4">
              {analyticsData.salesByCategory.map((data) => (
                <div key={data.category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">{data.category}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        ₹{data.revenue.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">({data.percentage}%)</span>
                    </div>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${data.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {analyticsData.topProducts.map((product, index) => (
                <div key={product.name} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-400 w-6">#{index + 1}</span>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{product.revenue.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Top Customers</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {analyticsData.topCustomers.map((customer, index) => (
                <div key={customer.email} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-400 w-6">#{index + 1}</span>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ₹{customer.spent.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-gray-500">{customer.orders} orders</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                ₹{Math.round(analyticsData.overview.totalRevenue / analyticsData.overview.totalOrders).toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-gray-600">Average Order Value</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {Math.round(analyticsData.overview.totalRevenue / analyticsData.overview.totalCustomers).toLocaleString('en-IN')}
              </div>
              <div className="text-sm text-gray-600">Revenue per Customer</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {(analyticsData.overview.totalOrders / analyticsData.overview.totalCustomers).toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Orders per Customer</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
