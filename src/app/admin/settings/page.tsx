'use client';

import { useState } from 'react';
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

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    alert('Settings saved successfully!');
  };

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
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
          >
            Save Changes
          </button>
        </div>

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
                          value={settings.general.siteName}
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
                          value={settings.general.contactEmail}
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
                        value={settings.general.siteDescription}
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
                          value={settings.general.contactPhone}
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
                            checked={settings.notifications.emailNotifications}
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
                            checked={settings.notifications.smsNotifications}
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
                          checked={settings.payment.razorpay.enabled}
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
                              value={settings.payment.razorpay.keyId}
                              onChange={(e) => handleNestedInputChange('payment', 'razorpay', 'keyId', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Key Secret</label>
                            <input
                              type="password"
                              value={settings.payment.razorpay.keySecret}
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
                          checked={settings.payment.cod.enabled}
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
                          value={settings.payment.cod.minAmount?.toString() || '0'}
                          onChange={(e) => handleNestedInputChange('payment', 'cod', 'minAmount', parseInt(e.target.value) || 0)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                        />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Amount (₹)</label>
                            <input
                              type="number"
                              value={settings.payment.cod.maxAmount?.toString() || '5000'}
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
                        value={settings.shipping.freeShippingThreshold?.toString() || '999'}
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
                            checked={settings.shipping.standardShipping.enabled}
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
                                value={settings.shipping.standardShipping.rate?.toString() || '99'}
                                onChange={(e) => handleNestedInputChange('shipping', 'standardShipping', 'rate', parseInt(e.target.value) || 99)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Days</label>
                              <input
                                type="text"
                                value={settings.shipping.standardShipping.estimatedDays}
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
                            checked={settings.shipping.expressShipping.enabled}
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
                                value={settings.shipping.expressShipping.rate?.toString() || '199'}
                                onChange={(e) => handleNestedInputChange('shipping', 'expressShipping', 'rate', parseInt(e.target.value) || 199)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Days</label>
                              <input
                                type="text"
                                value={settings.shipping.expressShipping.estimatedDays}
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
                          value={settings.security.sessionTimeout?.toString() || '30'}
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
                          value={settings.security.loginAttempts?.toString() || '5'}
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
                        value={settings.security.passwordExpiry?.toString() || '90'}
                        onChange={(e) => handleInputChange('security', 'passwordExpiry', parseInt(e.target.value) || 90)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
