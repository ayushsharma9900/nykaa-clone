'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  CreditCardIcon,
  TruckIcon,
  GlobeAltIcon,
  UserCircleIcon,
  KeyIcon
} from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Kaaya Beauty',
      siteDescription: 'Your ultimate destination for beauty and cosmetics',
      contactEmail: 'support@kaaya.com',
      contactPhone: '+91 9876543210',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      language: 'en'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      orderUpdates: true,
      lowStockAlerts: true,
      newCustomerAlerts: true,
      dailyReports: true,
      weeklyReports: false
    },
    payment: {
      razorpay: {
        enabled: true,
        keyId: 'rzp_test_***',
        keySecret: '***'
      },
      paypal: {
        enabled: false,
        clientId: '',
        clientSecret: ''
      },
      stripe: {
        enabled: false,
        publishableKey: '',
        secretKey: ''
      },
      cod: {
        enabled: true,
        minAmount: 0,
        maxAmount: 5000
      }
    },
    shipping: {
      freeShippingThreshold: 999,
      standardShipping: {
        enabled: true,
        rate: 99,
        estimatedDays: '3-7'
      },
      expressShipping: {
        enabled: true,
        rate: 199,
        estimatedDays: '1-2'
      },
      zones: [
        { name: 'Metro Cities', rate: 99, days: '2-4' },
        { name: 'Tier 2 Cities', rate: 149, days: '4-7' },
        { name: 'Remote Areas', rate: 199, days: '7-14' }
      ]
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      loginAttempts: 5,
      passwordExpiry: 90,
      requireStrongPassword: true
    }
  });

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'payment', name: 'Payment', icon: CreditCardIcon },
    { id: 'shipping', name: 'Shipping', icon: TruckIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon }
  ];

  const handleInputChange = (section: string, field: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: string | boolean | number) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subsection]: {
          ...(prev[section as keyof typeof prev] as Record<string, Record<string, string | boolean | number>>)[subsection],
          [field]: value
        }
      }
    }));
  };

  // Helper function to safely get values and prevent controlled/uncontrolled component issues
  const getSafeValue = (value: any, defaultValue: string | number | boolean = '') => {
    if (value === undefined || value === null) {
      return defaultValue;
    }
    return value;
  };

  // Helper function to safely get nested values
  const getSafeNestedValue = (obj: any, path: string[], defaultValue: any = '') => {
    let current = obj;
    for (const key of path) {
      if (current === undefined || current === null || typeof current !== 'object') {
        return defaultValue;
      }
      current = current[key];
    }
    return current !== undefined && current !== null ? current : defaultValue;
  };

  // Load settings from API
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch('/api/settings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load settings');
      }

      const data = await response.json();
      if (data.success && data.settings) {
        // Deep merge loaded settings with defaults to ensure all properties exist
        setSettings(prevSettings => {
          const mergedSettings = { ...prevSettings };
          
          // Deep merge each section while preserving nested structure
          Object.keys(data.settings).forEach(section => {
            if (mergedSettings[section as keyof typeof mergedSettings]) {
              const currentSection = mergedSettings[section as keyof typeof mergedSettings];
              const newSection = data.settings[section];
              
              // For nested objects, merge recursively
              const mergedSection: any = { ...currentSection };
              Object.keys(newSection).forEach(key => {
                if (typeof newSection[key] === 'object' && newSection[key] !== null && !Array.isArray(newSection[key])) {
                  mergedSection[key] = {
                    ...mergedSection[key],
                    ...newSection[key]
                  };
                } else {
                  mergedSection[key] = newSection[key];
                }
              });
              
              mergedSettings[section as keyof typeof mergedSettings] = mergedSection;
            }
          });
          
          return mergedSettings;
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setError('Failed to load settings. Using default values.');
    } finally {
      setLoading(false);
    }
  };

  // Save settings to API
  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      
      const token = typeof window !== 'undefined' && window.localStorage ? localStorage.getItem('token') : null;
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      const data = await response.json();
      if (data.success) {
        setSuccess('Settings saved successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        throw new Error(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError(error instanceof Error ? error.message : 'Failed to save settings');
      // Clear error message after 5 seconds
      setTimeout(() => setError(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Load settings on component mount
  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="admin-text text-2xl font-bold">Settings</h1>
            <p className="admin-text-secondary mt-1">Manage your store configuration and preferences</p>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={saving || loading}
            className={`px-4 py-2 rounded-md transition-colors ${
              saving || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-pink-600 hover:bg-pink-700'
            } text-white`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-pink-100 text-pink-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1">
            {loading ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                  <span className="ml-2 text-gray-600">Loading settings...</span>
                </div>
              </div>
            ) : (
            <div className="bg-white rounded-lg shadow-sm">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="p-6">
                  <h3 className="admin-text text-lg font-medium mb-6">General Settings</h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="admin-text block text-sm font-medium mb-2">
                          Site Name
                        </label>
                        <input
                          type="text"
                          value={getSafeValue(settings.general?.siteName, 'Kaaya Beauty')}
                          onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                          className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent font-medium"
                        />
                      </div>
                      <div>
                        <label className="admin-text block text-sm font-medium mb-2">
                          Contact Email
                        </label>
                        <input
                          type="email"
                          value={getSafeValue(settings.general?.contactEmail, 'support@kaaya.com')}
                          onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                          className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="admin-text block text-sm font-medium mb-2">
                        Site Description
                      </label>
                      <textarea
                        value={getSafeValue(settings.general?.siteDescription, 'Your ultimate destination for beauty and cosmetics')}
                        onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                        rows={3}
                        className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="admin-text block text-sm font-medium mb-2">
                          Contact Phone
                        </label>
                        <input
                          type="tel"
                          value={getSafeValue(settings.general?.contactPhone, '+91 9876543210')}
                          onChange={(e) => handleInputChange('general', 'contactPhone', e.target.value)}
                          className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent font-medium"
                        />
                      </div>
                      <div>
                        <label className="admin-text block text-sm font-medium mb-2">
                          Currency
                        </label>
                        <select
                          value={settings.general.currency}
                          onChange={(e) => handleInputChange('general', 'currency', e.target.value)}
                          className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent font-medium"
                        >
                          <option value="INR">Indian Rupee (₹)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="admin-text block text-sm font-medium mb-2">
                          Timezone
                        </label>
                        <select
                          value={settings.general.timezone}
                          onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                          className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent font-medium"
                        >
                          <option value="Asia/Kolkata">Asia/Kolkata</option>
                          <option value="America/New_York">America/New_York</option>
                          <option value="Europe/London">Europe/London</option>
                        </select>
                      </div>
                      <div>
                        <label className="admin-text block text-sm font-medium mb-2">
                          Language
                        </label>
                        <select
                          value={settings.general.language}
                          onChange={(e) => handleInputChange('general', 'language', e.target.value)}
                          className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent font-medium"
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="es">Spanish</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <h3 className="admin-text text-lg font-medium mb-6">Notification Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Communication Preferences</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-700">Email Notifications</span>
                            <p className="text-xs text-gray-500">Receive notifications via email</p>
                          </div>
                          <input
                            type="checkbox"
                          checked={getSafeNestedValue(settings, ['notifications', 'emailNotifications'], false)}
                            onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-700">SMS Notifications</span>
                            <p className="text-xs text-gray-500">Receive notifications via SMS</p>
                          </div>
                          <input
                            type="checkbox"
                          checked={getSafeNestedValue(settings, ['notifications', 'smsNotifications'], false)}
                            onChange={(e) => handleInputChange('notifications', 'smsNotifications', e.target.checked)}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Alert Preferences</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Order Updates</span>
                          <input
                            type="checkbox"
                            checked={settings.notifications.orderUpdates}
                            onChange={(e) => handleInputChange('notifications', 'orderUpdates', e.target.checked)}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Low Stock Alerts</span>
                          <input
                            type="checkbox"
                            checked={settings.notifications.lowStockAlerts}
                            onChange={(e) => handleInputChange('notifications', 'lowStockAlerts', e.target.checked)}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">New Customer Alerts</span>
                          <input
                            type="checkbox"
                            checked={settings.notifications.newCustomerAlerts}
                            onChange={(e) => handleInputChange('notifications', 'newCustomerAlerts', e.target.checked)}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Report Schedule</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Daily Reports</span>
                          <input
                            type="checkbox"
                            checked={settings.notifications.dailyReports}
                            onChange={(e) => handleInputChange('notifications', 'dailyReports', e.target.checked)}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Weekly Reports</span>
                          <input
                            type="checkbox"
                            checked={settings.notifications.weeklyReports}
                            onChange={(e) => handleInputChange('notifications', 'weeklyReports', e.target.checked)}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Payment Settings</h3>
                  <div className="space-y-8">
                    {/* Razorpay */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-900">Razorpay</h4>
                        <input
                          type="checkbox"
                          checked={getSafeNestedValue(settings, ['payment', 'razorpay', 'enabled'], false)}
                          onChange={(e) => handleNestedInputChange('payment', 'razorpay', 'enabled', e.target.checked)}
                          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                        />
                      </div>
                      {settings.payment.razorpay.enabled && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Key ID</label>
                            <input
                              type="text"
                              value={getSafeNestedValue(settings, ['payment', 'razorpay', 'keyId'], '')}
                              onChange={(e) => handleNestedInputChange('payment', 'razorpay', 'keyId', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Key Secret</label>
                            <input
                              type="password"
                              value={getSafeNestedValue(settings, ['payment', 'razorpay', 'keySecret'], '')}
                              onChange={(e) => handleNestedInputChange('payment', 'razorpay', 'keySecret', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cash on Delivery */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-900">Cash on Delivery</h4>
                        <input
                          type="checkbox"
                          checked={getSafeNestedValue(settings, ['payment', 'cod', 'enabled'], false)}
                          onChange={(e) => handleNestedInputChange('payment', 'cod', 'enabled', e.target.checked)}
                          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                        />
                      </div>
                      {settings.payment.cod.enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Amount (₹)</label>
                        <input
                          type="number"
                          value={getSafeNestedValue(settings, ['payment', 'cod', 'minAmount'], 0).toString()}
                          onChange={(e) => handleNestedInputChange('payment', 'cod', 'minAmount', parseInt(e.target.value) || 0)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                        />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Amount (₹)</label>
                            <input
                              type="number"
                              value={getSafeNestedValue(settings, ['payment', 'cod', 'maxAmount'], 5000).toString()}
                              onChange={(e) => handleNestedInputChange('payment', 'cod', 'maxAmount', parseInt(e.target.value) || 5000)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Settings */}
              {activeTab === 'shipping' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Shipping Settings</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Free Shipping Threshold (₹)
                      </label>
                      <input
                        type="number"
                        value={getSafeNestedValue(settings, ['shipping', 'freeShippingThreshold'], 999).toString()}
                        onChange={(e) => handleInputChange('shipping', 'freeShippingThreshold', parseInt(e.target.value) || 999)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-gray-900">Shipping Methods</h4>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-medium text-black">Standard Shipping</span>
                          <input
                            type="checkbox"
                          checked={getSafeNestedValue(settings, ['shipping', 'standardShipping', 'enabled'], false)}
                            onChange={(e) => handleNestedInputChange('shipping', 'standardShipping', 'enabled', e.target.checked)}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          />
                        </div>
                        {settings.shipping.standardShipping.enabled && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Rate (₹)</label>
                              <input
                                type="number"
                                value={getSafeNestedValue(settings, ['shipping', 'standardShipping', 'rate'], 99).toString()}
                                onChange={(e) => handleNestedInputChange('shipping', 'standardShipping', 'rate', parseInt(e.target.value) || 99)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Days</label>
                              <input
                                type="text"
                                value={getSafeNestedValue(settings, ['shipping', 'standardShipping', 'estimatedDays'], '3-7')}
                                onChange={(e) => handleNestedInputChange('shipping', 'standardShipping', 'estimatedDays', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-medium text-black">Express Shipping</span>
                          <input
                            type="checkbox"
                          checked={getSafeNestedValue(settings, ['shipping', 'expressShipping', 'enabled'], false)}
                            onChange={(e) => handleNestedInputChange('shipping', 'expressShipping', 'enabled', e.target.checked)}
                            className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                          />
                        </div>
                        {settings.shipping.expressShipping.enabled && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Rate (₹)</label>
                              <input
                                type="number"
                                value={getSafeNestedValue(settings, ['shipping', 'expressShipping', 'rate'], 199).toString()}
                                onChange={(e) => handleNestedInputChange('shipping', 'expressShipping', 'rate', parseInt(e.target.value) || 199)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Days</label>
                              <input
                                type="text"
                                value={getSafeNestedValue(settings, ['shipping', 'expressShipping', 'estimatedDays'], '1-2')}
                                onChange={(e) => handleNestedInputChange('shipping', 'expressShipping', 'estimatedDays', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Two-Factor Authentication</span>
                        <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.security.twoFactorAuth}
                        onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Strong Password Required</span>
                        <p className="text-xs text-gray-500">Require complex passwords for all users</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.security.requireStrongPassword}
                        onChange={(e) => handleInputChange('security', 'requireStrongPassword', e.target.checked)}
                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Timeout (minutes)
                        </label>
                        <input
                          type="number"
                          value={getSafeNestedValue(settings, ['security', 'sessionTimeout'], 30).toString()}
                          onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value) || 30)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Login Attempts
                        </label>
                        <input
                          type="number"
                          value={getSafeNestedValue(settings, ['security', 'loginAttempts'], 5).toString()}
                          onChange={(e) => handleInputChange('security', 'loginAttempts', parseInt(e.target.value) || 5)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password Expiry (days)
                      </label>
                      <input
                        type="number"
                        value={getSafeNestedValue(settings, ['security', 'passwordExpiry'], 90).toString()}
                        onChange={(e) => handleInputChange('security', 'passwordExpiry', parseInt(e.target.value) || 90)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
