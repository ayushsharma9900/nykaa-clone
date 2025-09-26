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
      
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/menu-management/menu-items`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        // Filter only items that should be shown in menu and are active
        const visibleMenuItems = data.data.filter((item: MenuItem) => 
          item.showInMenu && item.isActive
        );
        
        // Sort by menu order
        const sortedItems = visibleMenuItems.sort((a: MenuItem, b: MenuItem) => 
          a.menuOrder - b.menuOrder
        );
        
        setMenuItems(sortedItems);
      } else {
        throw new Error('Invalid API response format');
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
