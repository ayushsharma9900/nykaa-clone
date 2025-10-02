'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api';

interface Setting {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  category: string;
  isEditable: boolean;
  defaultValue: any;
  validationRule?: string;
}

interface SettingsGroup {
  [key: string]: Setting;
}

interface UseSettingsOptions {
  category?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useSettings(options: UseSettingsOptions = {}) {
  const {
    category,
    autoRefresh = false,
    refreshInterval = 30000 // 30 seconds
  } = options;

  const [settings, setSettings] = useState<SettingsGroup>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string[]>([]); // Array of setting keys being saved

  // Fetch settings from API
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`/api/settings${params.toString() ? `?${params.toString()}` : ''}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch settings: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const settingsMap = data.data.reduce((acc: SettingsGroup, setting: Setting) => {
          acc[setting.key] = setting;
          return acc;
        }, {});
        
        setSettings(settingsMap);
      } else {
        // Fallback to default dynamic settings
        setSettings(getDefaultSettings());
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      // Use default settings as fallback
      setSettings(getDefaultSettings());
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Get default settings when API is not available
  const getDefaultSettings = useCallback((): SettingsGroup => {
    return {
      'site.name': {
        key: 'site.name',
        value: 'kaayalife',
        type: 'string',
        description: 'Site name displayed in header and title',
        category: 'general',
        isEditable: true,
        defaultValue: 'kaayalife'
      },
      'site.tagline': {
        key: 'site.tagline',
        value: 'Beauty Redefined',
        type: 'string',
        description: 'Site tagline for marketing',
        category: 'general',
        isEditable: true,
        defaultValue: 'Beauty Redefined'
      },
      'catalog.products_per_page': {
        key: 'catalog.products_per_page',
        value: 20,
        type: 'number',
        description: 'Number of products to display per page',
        category: 'catalog',
        isEditable: true,
        defaultValue: 20,
        validationRule: 'min:1,max:100'
      },
      'catalog.max_categories_display': {
        key: 'catalog.max_categories_display',
        value: 8,
        type: 'number',
        description: 'Maximum number of categories to display in grid',
        category: 'catalog',
        isEditable: true,
        defaultValue: 8,
        validationRule: 'min:1,max:20'
      },
      'ui.primary_color': {
        key: 'ui.primary_color',
        value: '#db2777',
        type: 'string',
        description: 'Primary brand color (hex)',
        category: 'ui',
        isEditable: true,
        defaultValue: '#db2777',
        validationRule: 'regex:^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
      },
      'ui.secondary_color': {
        key: 'ui.secondary_color',
        value: '#9333ea',
        type: 'string',
        description: 'Secondary brand color (hex)',
        category: 'ui',
        isEditable: true,
        defaultValue: '#9333ea',
        validationRule: 'regex:^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$'
      },
      'features.enable_wishlist': {
        key: 'features.enable_wishlist',
        value: true,
        type: 'boolean',
        description: 'Enable wishlist functionality',
        category: 'features',
        isEditable: true,
        defaultValue: true
      },
      'features.enable_reviews': {
        key: 'features.enable_reviews',
        value: true,
        type: 'boolean',
        description: 'Enable product reviews',
        category: 'features',
        isEditable: true,
        defaultValue: true
      },
      'features.enable_cart_persistence': {
        key: 'features.enable_cart_persistence',
        value: true,
        type: 'boolean',
        description: 'Persist cart across sessions',
        category: 'features',
        isEditable: true,
        defaultValue: true
      },
      'shipping.free_shipping_threshold': {
        key: 'shipping.free_shipping_threshold',
        value: 499,
        type: 'number',
        description: 'Minimum order value for free shipping',
        category: 'shipping',
        isEditable: true,
        defaultValue: 499,
        validationRule: 'min:0'
      },
      'payment.cod_enabled': {
        key: 'payment.cod_enabled',
        value: true,
        type: 'boolean',
        description: 'Enable Cash on Delivery',
        category: 'payment',
        isEditable: true,
        defaultValue: true
      },
      'seo.meta_title': {
        key: 'seo.meta_title',
        value: 'kaayalife - Premium Beauty Products Online',
        type: 'string',
        description: 'Default meta title for SEO',
        category: 'seo',
        isEditable: true,
        defaultValue: 'kaayalife - Premium Beauty Products Online'
      },
      'seo.meta_description': {
        key: 'seo.meta_description',
        value: 'Shop premium beauty products, skincare, makeup, and cosmetics from top brands. Free shipping on orders above ₹499.',
        type: 'string',
        description: 'Default meta description for SEO',
        category: 'seo',
        isEditable: true,
        defaultValue: 'Shop premium beauty products, skincare, makeup, and cosmetics from top brands. Free shipping on orders above ₹499.'
      }
    };
  }, []);

  // Initialize settings
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Auto-refresh settings
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchSettings, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchSettings]);

  // Get setting value by key
  const getSetting = useCallback((key: string, defaultValue?: any) => {
    const setting = settings[key];
    if (setting) {
      return setting.value;
    }
    return defaultValue;
  }, [settings]);

  // Update setting value
  const setSetting = useCallback(async (key: string, value: any) => {
    const setting = settings[key];
    if (!setting) {
      throw new Error(`Setting '${key}' not found`);
    }

    if (!setting.isEditable) {
      throw new Error(`Setting '${key}' is not editable`);
    }

    setSaving(prev => [...prev, key]);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key, value })
      });

      if (!response.ok) {
        throw new Error(`Failed to update setting: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setSettings(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            value
          }
        }));
        return true;
      } else {
        throw new Error(data.message || 'Failed to update setting');
      }
    } catch (error) {
      console.error(`Failed to update setting '${key}':`, error);
      // For development, update locally even if API fails
      setSettings(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          value
        }
      }));
      return false;
    } finally {
      setSaving(prev => prev.filter(k => k !== key));
    }
  }, [settings]);

  // Reset setting to default value
  const resetSetting = useCallback(async (key: string) => {
    const setting = settings[key];
    if (!setting) {
      throw new Error(`Setting '${key}' not found`);
    }

    return setSetting(key, setting.defaultValue);
  }, [settings, setSetting]);

  // Get settings by category
  const getSettingsByCategory = useCallback((categoryName: string) => {
    return Object.values(settings).filter(setting => setting.category === categoryName);
  }, [settings]);

  // Get all categories
  const getCategories = useCallback(() => {
    return [...new Set(Object.values(settings).map(setting => setting.category))];
  }, [settings]);

  // Validate setting value
  const validateSetting = useCallback((key: string, value: any): string | null => {
    const setting = settings[key];
    if (!setting || !setting.validationRule) {
      return null;
    }

    const rules = setting.validationRule.split(',');
    for (const rule of rules) {
      const [ruleName, ruleValue] = rule.split(':');
      
      switch (ruleName.trim()) {
        case 'min':
          if (typeof value === 'number' && value < parseInt(ruleValue)) {
            return `Value must be at least ${ruleValue}`;
          }
          break;
        case 'max':
          if (typeof value === 'number' && value > parseInt(ruleValue)) {
            return `Value must be at most ${ruleValue}`;
          }
          break;
        case 'regex':
          const regex = new RegExp(ruleValue);
          if (typeof value === 'string' && !regex.test(value)) {
            return `Value does not match required format`;
          }
          break;
      }
    }
    
    return null;
  }, [settings]);

  return {
    // State
    settings,
    loading,
    error,
    saving,
    
    // Methods
    getSetting,
    setSetting,
    resetSetting,
    getSettingsByCategory,
    getCategories,
    validateSetting,
    refreshSettings: fetchSettings,
    
    // Computed values
    settingsArray: Object.values(settings),
    settingsCount: Object.keys(settings).length
  };
}
