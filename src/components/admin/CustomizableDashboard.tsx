'use client';

import React, { useState, useEffect } from 'react';
import {
  Cog6ToothIcon,
  PaintBrushIcon,
  MoonIcon,
  SunIcon,
  EyeIcon,
  PlusIcon,
  XMarkIcon,
  Bars3Icon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  ClockIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';

interface DashboardWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table' | 'text';
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  visible: boolean;
  data?: any;
  config?: any;
}

interface DashboardTheme {
  id: string;
  name: string;
  mode: 'light' | 'dark' | 'auto';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
}

const defaultThemes: DashboardTheme[] = [
  {
    id: 'light',
    name: 'Light Mode',
    mode: 'light',
    primary: '#3B82F6',
    secondary: '#6B7280',
    accent: '#F59E0B',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827'
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    mode: 'dark',
    primary: '#60A5FA',
    secondary: '#9CA3AF',
    accent: '#FBBF24',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB'
  },
  {
    id: 'blue',
    name: 'Ocean Blue',
    mode: 'light',
    primary: '#0EA5E9',
    secondary: '#64748B',
    accent: '#06B6D4',
    background: '#F0F9FF',
    surface: '#FFFFFF',
    text: '#0F172A'
  },
  {
    id: 'green',
    name: 'Forest Green',
    mode: 'light',
    primary: '#10B981',
    secondary: '#6B7280',
    accent: '#84CC16',
    background: '#F0FDF4',
    surface: '#FFFFFF',
    text: '#14532D'
  }
];

const defaultWidgets: DashboardWidget[] = [
  {
    id: 'revenue',
    title: 'Total Revenue',
    type: 'metric',
    size: 'small',
    position: { x: 0, y: 0 },
    visible: true,
    data: { value: '₹2,45,680', change: 12.5, trend: 'up' }
  },
  {
    id: 'orders',
    title: 'Total Orders',
    type: 'metric',
    size: 'small',
    position: { x: 1, y: 0 },
    visible: true,
    data: { value: '1,248', change: 8.3, trend: 'up' }
  },
  {
    id: 'customers',
    title: 'Active Customers',
    type: 'metric',
    size: 'small',
    position: { x: 2, y: 0 },
    visible: true,
    data: { value: '2,847', change: 15.2, trend: 'up' }
  },
  {
    id: 'products',
    title: 'Total Products',
    type: 'metric',
    size: 'small',
    position: { x: 3, y: 0 },
    visible: true,
    data: { value: '456', change: 2.1, trend: 'up' }
  },
  {
    id: 'sales-chart',
    title: 'Sales Overview',
    type: 'chart',
    size: 'large',
    position: { x: 0, y: 1 },
    visible: true,
    data: { /* chart data */ }
  },
  {
    id: 'recent-orders',
    title: 'Recent Orders',
    type: 'table',
    size: 'medium',
    position: { x: 2, y: 1 },
    visible: true,
    data: [
      { id: '#001', customer: 'John Doe', amount: '₹1,250', status: 'Delivered' },
      { id: '#002', customer: 'Jane Smith', amount: '₹890', status: 'Shipped' }
    ]
  }
];

export default function CustomizableDashboard() {
  const [theme, setTheme] = useState<DashboardTheme>(defaultThemes[0]);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(defaultWidgets);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--dashboard-primary', theme.primary);
    root.style.setProperty('--dashboard-secondary', theme.secondary);
    root.style.setProperty('--dashboard-accent', theme.accent);
    root.style.setProperty('--dashboard-background', theme.background);
    root.style.setProperty('--dashboard-surface', theme.surface);
    root.style.setProperty('--dashboard-text', theme.text);
    
    // Apply dark mode class
    if (theme.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeChange = (newTheme: DashboardTheme) => {
    setTheme(newTheme);
    localStorage.setItem('dashboard-theme', JSON.stringify(newTheme));
  };

  const handleWidgetToggle = (widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, visible: !widget.visible }
        : widget
    ));
  };

  const handleWidgetResize = (widgetId: string, newSize: 'small' | 'medium' | 'large') => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, size: newSize }
        : widget
    ));
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'chart': return ChartBarIcon;
      case 'metric': return ChartBarIcon;
      case 'table': return Bars3Icon;
      default: return ChartBarIcon;
    }
  };

  const getGridClasses = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return 'col-span-1 row-span-1';
      case 'medium': return 'col-span-2 row-span-2';
      case 'large': return 'col-span-4 row-span-2';
      default: return 'col-span-1 row-span-1';
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    const WidgetIcon = getWidgetIcon(widget.type);
    
    return (
      <div
        key={widget.id}
        className={`${getGridClasses(widget.size)} ${theme.mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
          rounded-lg shadow-sm border p-6 transition-all duration-200 hover:shadow-md
          ${isCustomizing ? 'cursor-move' : 'cursor-default'}`}
        style={{
          backgroundColor: theme.mode === 'dark' ? '#1F2937' : theme.surface,
          borderColor: theme.mode === 'dark' ? '#374151' : '#E5E7EB',
          color: theme.text
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <WidgetIcon className="h-5 w-5" style={{ color: theme.primary }} />
            <h3 className="text-sm font-medium" style={{ color: theme.text }}>{widget.title}</h3>
          </div>
          
          {isCustomizing && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handleWidgetResize(widget.id, widget.size === 'small' ? 'medium' : widget.size === 'medium' ? 'large' : 'small')}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {widget.size === 'large' ? (
                  <ArrowsPointingInIcon className="h-4 w-4" />
                ) : (
                  <ArrowsPointingOutIcon className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={() => handleWidgetToggle(widget.id)}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {widget.type === 'metric' && widget.data && (
          <div>
            <div className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
              {widget.data.value}
            </div>
            <div className={`flex items-center text-sm ${
              widget.data.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>+{widget.data.change}%</span>
            </div>
          </div>
        )}

        {widget.type === 'chart' && (
          <div className="h-32 flex items-center justify-center" style={{ color: theme.secondary }}>
            <div className="text-center">
              <ChartBarIcon className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Chart visualization</p>
            </div>
          </div>
        )}

        {widget.type === 'table' && widget.data && (
          <div className="space-y-2">
            {widget.data.map((row: any, index: number) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium" style={{ color: theme.text }}>{row.customer}</p>
                  <p className="text-xs" style={{ color: theme.secondary }}>{row.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium" style={{ color: theme.text }}>{row.amount}</p>
                  <p className="text-xs" style={{ color: theme.secondary }}>{row.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen transition-colors duration-200"
      style={{ backgroundColor: theme.background }}
    >
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" 
           style={{ 
             backgroundColor: theme.surface, 
             borderColor: theme.mode === 'dark' ? '#374151' : '#E5E7EB' 
           }}>
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
                Admin Dashboard
              </h1>
              <p className="text-sm mt-1" style={{ color: theme.secondary }}>
                Customizable workspace with real-time insights
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                style={{ color: theme.secondary }}
              >
                {isFullscreen ? (
                  <ArrowsPointingInIcon className="h-5 w-5" />
                ) : (
                  <ArrowsPointingOutIcon className="h-5 w-5" />
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={() => setShowThemePanel(!showThemePanel)}
                className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                style={{ color: theme.secondary }}
              >
                <PaintBrushIcon className="h-5 w-5" />
              </button>

              {/* Customize Toggle */}
              <button
                onClick={() => setIsCustomizing(!isCustomizing)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isCustomizing 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-300'
                }`}
                style={{ 
                  backgroundColor: isCustomizing ? theme.primary : 'transparent',
                  color: isCustomizing ? 'white' : theme.secondary
                }}
              >
                <Cog6ToothIcon className="h-5 w-5 mr-2 inline" />
                {isCustomizing ? 'Done' : 'Customize'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Panel */}
      {showThemePanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            className="max-w-md w-full mx-4 rounded-lg shadow-lg p-6"
            style={{ backgroundColor: theme.surface, color: theme.text }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Dashboard Themes</h3>
              <button
                onClick={() => setShowThemePanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-3">
              {defaultThemes.map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => handleThemeChange(themeOption)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                    theme.id === themeOption.id 
                      ? 'border-blue-500' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{ 
                    backgroundColor: theme.mode === 'dark' ? '#374151' : '#F9FAFB' 
                  }}
                >
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: themeOption.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: themeOption.accent }}
                    />
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: themeOption.background }}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{themeOption.name}</p>
                    <p className="text-xs" style={{ color: theme.secondary }}>
                      {themeOption.mode} mode
                    </p>
                  </div>
                  {themeOption.mode === 'dark' ? (
                    <MoonIcon className="h-5 w-5" />
                  ) : (
                    <SunIcon className="h-5 w-5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customization Panel */}
      {isCustomizing && (
        <div 
          className="fixed left-0 top-20 bottom-0 w-80 border-r z-30 overflow-y-auto"
          style={{ 
            backgroundColor: theme.surface,
            borderColor: theme.mode === 'dark' ? '#374151' : '#E5E7EB'
          }}
        >
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4" style={{ color: theme.text }}>
              Dashboard Widgets
            </h3>
            
            <div className="space-y-3">
              {widgets.map((widget) => {
                const WidgetIcon = getWidgetIcon(widget.type);
                return (
                  <div 
                    key={widget.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ 
                      backgroundColor: theme.mode === 'dark' ? '#374151' : '#F9FAFB',
                      borderColor: theme.mode === 'dark' ? '#4B5563' : '#E5E7EB'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <WidgetIcon className="h-5 w-5" style={{ color: theme.primary }} />
                      <div>
                        <p className="font-medium" style={{ color: theme.text }}>
                          {widget.title}
                        </p>
                        <p className="text-xs" style={{ color: theme.secondary }}>
                          {widget.size} • {widget.type}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleWidgetToggle(widget.id)}
                        className={`p-2 rounded transition-colors ${
                          widget.visible 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div 
        className={`${isCustomizing ? 'ml-80' : ''} p-6 transition-all duration-200`}
        style={{ backgroundColor: theme.background }}
      >
        <div className="grid grid-cols-4 gap-6 auto-rows-fr">
          {widgets
            .filter(widget => widget.visible)
            .map(widget => renderWidget(widget))
          }
        </div>
      </div>
    </div>
  );
}
