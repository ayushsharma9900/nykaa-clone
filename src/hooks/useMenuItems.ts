'use client';

import { useState, useEffect } from 'react';

export interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  showInMenu: boolean;
  menuOrder: number;
  menuLevel: number;
  parentId?: string;
  children?: MenuItem[];
  productCount?: number;
}

export function useMenuItems() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch menu items from the menu management API
  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching menu items from API...');
      const response = await fetch('/api/menu-management/menu-items');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Menu API Error ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Menu API Response:', data);
      
      if (data.success && Array.isArray(data.data)) {
        // The API already filters for showInMenu and isActive, so we can use the data directly
        const menuItems = data.data;
        console.log(`✅ Found ${menuItems.length} menu items:`, menuItems.map((item: MenuItem) => item.name));
        
        setMenuItems(menuItems);
      } else {
        console.error('❌ Invalid API response format:', data);
        throw new Error(data.message || 'Invalid API response format');
      }
    } catch (err: any) {
      console.error('Failed to fetch menu items:', err);
      setError(err.message || 'Failed to fetch menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Initialize menu items
  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Refresh menu items (useful after admin changes)
  const refreshMenuItems = () => {
    fetchMenuItems();
  };

  return {
    menuItems,
    loading,
    error,
    refreshMenuItems
  };
}
