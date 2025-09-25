'use client';

import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';

export interface Category {
  _id: string;
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  productCount: number;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  sortOrder?: number;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from API
  const fetchCategories = async (params?: { search?: string; active?: boolean }) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getCategories({
        limit: 100,
        ...params
      });
      
      if (response.success && response.data && Array.isArray(response.data)) {
        const mappedCategories = response.data.map((cat: any) => ({
          ...cat,
          id: cat._id // Ensure we have both _id and id for compatibility
        }));
        setCategories(mappedCategories);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      setError(err.message || 'Failed to fetch categories');
      setCategories([]); // Clear categories on error
    } finally {
      setLoading(false);
    }
  };

  // Initialize categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Create a new category
  const createCategory = async (categoryData: CategoryFormData) => {
    try {
      const response = await apiService.createCategory(categoryData);
      
      if (response.success && response.data) {
        const newCategory = {
          ...response.data,
          id: response.data._id,
          productCount: 0
        };
        setCategories(prev => [...prev, newCategory]);
        return newCategory;
      } else {
        throw new Error('Failed to create category');
      }
    } catch (err: any) {
      console.error('Failed to create category:', err);
      throw new Error(err.message || 'Failed to create category');
    }
  };

  // Update an existing category
  const updateCategory = async (categoryId: string, categoryData: Partial<CategoryFormData>) => {
    try {
      const response = await apiService.updateCategory(categoryId, categoryData);
      
      if (response.success && response.data) {
        const updatedCategory = {
          ...response.data,
          id: response.data._id
        };
        setCategories(prev => 
          prev.map(cat => 
            cat._id === categoryId ? updatedCategory : cat
          )
        );
        return updatedCategory;
      } else {
        throw new Error('Failed to update category');
      }
    } catch (err: any) {
      console.error('Failed to update category:', err);
      throw new Error(err.message || 'Failed to update category');
    }
  };

  // Toggle category active status
  const toggleCategoryStatus = async (categoryId: string) => {
    try {
      const response = await apiService.toggleCategoryStatus(categoryId);
      
      if (response.success && response.data) {
        const updatedCategory = {
          ...response.data,
          id: response.data._id
        };
        setCategories(prev => 
          prev.map(cat => 
            cat._id === categoryId ? updatedCategory : cat
          )
        );
        return updatedCategory;
      } else {
        throw new Error('Failed to toggle category status');
      }
    } catch (err: any) {
      console.error('Failed to toggle category status:', err);
      throw new Error(err.message || 'Failed to toggle category status');
    }
  };

  // Delete a category
  const deleteCategory = async (categoryId: string) => {
    try {
      const response = await apiService.deleteCategory(categoryId);
      
      if (response.success) {
        setCategories(prev => prev.filter(cat => cat._id !== categoryId));
        return true;
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (err: any) {
      console.error('Failed to delete category:', err);
      throw new Error(err.message || 'Failed to delete category');
    }
  };

  // Get a single category by ID
  const getCategory = (categoryId: string) => {
    return categories.find(cat => cat._id === categoryId || cat.id === categoryId);
  };

  // Save category (create if new, update if existing)
  const saveCategory = async (categoryData: CategoryFormData & { _id?: string }) => {
    if (categoryData._id) {
      return await updateCategory(categoryData._id, categoryData);
    } else {
      return await createCategory(categoryData);
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    getCategory,
    saveCategory,
    refreshCategories: fetchCategories
  };
}
