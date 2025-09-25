'use client';

import React, { useState, useEffect } from 'react';
import { useProducts } from '@/hooks/useProducts';
import CustomizableDashboard from '@/components/admin/CustomizableDashboard';
import PerformanceDashboard from '@/components/admin/PerformanceDashboard';
import RoleManager from '@/components/admin/RoleManager';
import SystemManager from '@/components/admin/SystemManager';
import {
  ChartBarIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  HomeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function EnhancedDashboard() {
  const [activeView, setActiveView] = useState<'dashboard' | 'performance' | 'security' | 'system'>('dashboard');
  const { products, loading } = useProducts();
  
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 2456800,
    totalOrders: 1248,
    totalCustomers: 2847,
    totalProducts: products.length,
    revenueChange: 12.5,
    ordersChange: 8.3,
    customersChange: 15.2,
    productsChange: 2.1
  });

  useEffect(() => {
    setDashboardStats(prev => ({
      ...prev,
      totalProducts: products.length
    }));
  }, [products]);

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Customizable Dashboard',
      icon: HomeIcon,
      description: 'Personalized workspace with widgets'
    },
    {
      id: 'performance',
      label: 'Performance Analytics',
      icon: ChartBarIcon,
      description: 'Real-time system monitoring'
    },
    {
      id: 'security',
      label: 'Security Management',
      icon: ShieldCheckIcon,
      description: 'Roles, permissions & activity logs'
    },
    {
      id: 'system',
      label: 'System Management',
      icon: Cog6ToothIcon,
      description: 'Database, cache & maintenance'
    }
  ];

  const quickStats = [
    {
      name: 'Total Revenue',
      value: `₹${dashboardStats.totalRevenue.toLocaleString('en-IN')}`,
      change: dashboardStats.revenueChange,
      icon: CurrencyRupeeIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Total Orders',
      value: dashboardStats.totalOrders.toLocaleString('en-IN'),
      change: dashboardStats.ordersChange,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Customers',
      value: dashboardStats.totalCustomers.toLocaleString('en-IN'),
      change: dashboardStats.customersChange,
      icon: UserGroupIcon,
      color: 'bg-purple-500'
    },
    {
      name: 'Total Products',
      value: dashboardStats.totalProducts.toString(),
      change: dashboardStats.productsChange,
      icon: CpuChipIcon,
      color: 'bg-pink-500'
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <CustomizableDashboard />;
      case 'performance':
        return <PerformanceDashboard />;
      case 'security':
        return <RoleManager />;
      case 'system':
        return <SystemManager />;
      default:
        return <CustomizableDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Enterprise Admin Panel</h1>
              <p className="text-sm text-gray-600 mt-1">Advanced administration for large-scale operations</p>
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-600">System Operational</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6">
          <nav className="-mb-px flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`group py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeView === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className={`h-5 w-5 ${
                    activeView === item.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`} />
                  <div className="text-left">
                    <div>{item.label}</div>
                    <div className={`text-xs ${
                      activeView === item.id ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Quick Stats Bar - Only show on dashboard view */}
      {activeView === 'dashboard' && (
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((stat) => (
                <div key={stat.name} className="flex items-center space-x-3">
                  <div className={`${stat.color} p-2 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-xl font-semibold text-gray-900">{stat.value}</p>
                      <div className={`flex items-center text-xs font-medium ${
                        stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change >= 0 ? (
                          <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                        )}
                        {Math.abs(stat.change)}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1">
        {renderContent()}
      </div>

      {/* Feature Highlights */}
      {activeView === 'dashboard' && (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Enterprise Features</h3>
              <p className="text-sm text-gray-600">Powerful tools designed for large-scale operations</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <ChartBarIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Advanced Analytics</h4>
                <p className="text-xs text-gray-600 mt-1">Real-time performance monitoring and detailed insights</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <ShieldCheckIcon className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Enterprise Security</h4>
                <p className="text-xs text-gray-600 mt-1">Role-based access control and activity logging</p>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Cog6ToothIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">System Management</h4>
                <p className="text-xs text-gray-600 mt-1">Database optimization and maintenance tools</p>
              </div>
              
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <HomeIcon className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900">Customizable UI</h4>
                <p className="text-xs text-gray-600 mt-1">Personalized dashboard with drag-and-drop widgets</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
