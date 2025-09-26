'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdvancedDataTable, { Column, BulkAction } from '@/components/admin/AdvancedDataTable';
import { apiService } from '@/lib/api';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  FolderIcon
} from '@heroicons/react/24/outline';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: string;
  productCount?: number;
  activeProductCount?: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCategoryModal, setCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true,
    sortOrder: 0
  });

  // Fetch categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getCategories({ limit: 100 });
      
      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch categories');
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Table columns definition
  const columns: Column<Category>[] = useMemo(() => [
    {
      key: 'name',
      label: 'Category',
      sortable: true,
      render: (value: string, item: Category) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 mr-3">
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <FolderIcon className="h-6 w-6 text-gray-500" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{value}</div>
            <div className="text-xs text-gray-500">{item.slug}</div>
          </div>
        </div>
      )
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string) => (
        <div className="max-w-xs text-sm text-gray-500 truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'productCount',
      label: 'Products',
      sortable: true,
      align: 'center' as const,
      render: (value: number, item: Category) => (
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{value || 0}</div>
          <div className="text-xs text-gray-500">
            {item.activeProductCount || 0} active
          </div>
        </div>
      )
    },
    {
      key: 'sortOrder',
      label: 'Order',
      sortable: true,
      align: 'center' as const,
      render: (value: number) => (
        <div className="text-center text-sm text-gray-500">
          {value}
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      filterable: true,
      render: (value: boolean) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? (
            <>
              <CheckCircleIcon className="h-3 w-3 mr-1" />
              Active
            </>
          ) : (
            <>
              <XCircleIcon className="h-3 w-3 mr-1" />
              Inactive
            </>
          )}
        </span>
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString()}
        </div>
      )
    }
  ], []);

  // Bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: 'activate',
      label: 'Activate',
      icon: CheckCircleIcon,
      variant: 'primary'
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      icon: XCircleIcon,
      variant: 'secondary'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: TrashIcon,
      variant: 'danger',
      requireConfirmation: true,
      confirmationMessage: 'Are you sure you want to delete the selected categories? Categories with products cannot be deleted.'
    }
  ];

  // Row actions
  const rowActions = [
    { id: 'edit', label: 'Edit', icon: PencilIcon, variant: 'primary' as const },
    { id: 'toggle', label: 'Toggle Status', icon: CheckCircleIcon, variant: 'secondary' as const },
    { id: 'delete', label: 'Delete', icon: TrashIcon, variant: 'danger' as const }
  ];

  // Filter options
  const filterOptions = [
    {
      key: 'isActive',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
      ]
    }
  ];

  // Event handlers
  const handleRowAction = useCallback(async (action: string, category: Category) => {
    switch (action) {
      case 'edit':
        setSelectedCategory(category);
        setFormData({
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image || '',
          isActive: category.isActive,
          sortOrder: category.sortOrder
        });
        setCategoryModal(true);
        break;
      case 'toggle':
        try {
          await apiService.toggleCategoryStatus(category._id);
          await fetchCategories();
        } catch (err) {
          console.error('Failed to toggle category status:', err);
          alert('Failed to toggle category status. Please try again.');
        }
        break;
      case 'delete':
        if (category.productCount && category.productCount > 0) {
          alert(`Cannot delete category "${category.name}" because it contains ${category.productCount} products. Please move or delete the products first.`);
          return;
        }
        
        if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
          try {
            await apiService.deleteCategory(category._id);
            await fetchCategories();
          } catch (err) {
            console.error('Failed to delete category:', err);
            alert('Failed to delete category. Please try again.');
          }
        }
        break;
    }
  }, [fetchCategories]);

  const handleBulkAction = useCallback(async (actionId: string, selectedCategories: Category[]) => {
    try {
      setLoading(true);
      const categoryIds = selectedCategories.map(c => c._id);
      
      switch (actionId) {
        case 'activate':
        case 'deactivate':
          const isActive = actionId === 'activate';
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/categories/bulk/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ categoryIds, isActive })
          });
          
          if (!response.ok) {
            throw new Error(`Failed to ${actionId} categories`);
          }
          break;
        case 'delete':
          // Check if any categories have products
          const categoriesWithProducts = selectedCategories.filter(c => c.productCount && c.productCount > 0);
          if (categoriesWithProducts.length > 0) {
            alert(`Cannot delete ${categoriesWithProducts.length} categories because they contain products. Please move or delete the products first.`);
            return;
          }
          
          const deleteResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/categories/bulk`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ categoryIds })
          });
          
          if (!deleteResponse.ok) {
            throw new Error('Failed to delete categories');
          }
          break;
      }
      
      await fetchCategories();
    } catch (err) {
      console.error(`Failed to ${actionId} categories:`, err);
      alert(`Failed to ${actionId} categories. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  const handleAddCategory = useCallback(() => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      isActive: true,
      sortOrder: categories.length
    });
    setCategoryModal(true);
  }, [categories.length]);

  const handleSaveCategory = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      if (selectedCategory) {
        // Update existing category
        await apiService.updateCategory(selectedCategory._id, formData);
      } else {
        // Create new category
        await apiService.createCategory(formData);
      }
      
      await fetchCategories();
      setCategoryModal(false);
      setSelectedCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
        isActive: true,
        sortOrder: 0
      });
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Failed to save category. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedCategory, formData, fetchCategories]);

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')          // Replace spaces with hyphens
      .replace(/-+/g, '-')           // Replace multiple hyphens with single
      .trim()
      .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newFormData = {
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
             type === 'number' ? parseInt(value) || 0 : value
    };
    
    // Auto-generate slug when name changes
    if (name === 'name') {
      newFormData.slug = generateSlug(value);
    }
    
    setFormData(newFormData);
  }, [formData]);

  return (
    <AdminLayout title="Categories Management">
      <div className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong className="font-medium">Error:</strong> {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="admin-text text-2xl font-bold">Categories</h1>
            <p className="admin-text-secondary mt-1">Manage product categories and organization</p>
          </div>
          <button 
            onClick={handleAddCategory}
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Category</span>
          </button>
        </div>

        {/* Advanced Data Table */}
        <AdvancedDataTable
          data={categories}
          columns={columns}
          loading={loading}
          bulkActions={bulkActions}
          filterOptions={filterOptions}
          rowActions={rowActions}
          searchable={true}
          exportable={true}
          selectable={true}
          onBulkAction={handleBulkAction}
          onRowAction={handleRowAction}
          title={`${categories.length} Categories`}
          subtitle={`${categories.filter(c => c.isActive).length} active categories`}
          emptyState={
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <FolderIcon className="mx-auto h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first category.</p>
              <button 
                onClick={handleAddCategory}
                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
              >
                Add Category
              </button>
            </div>
          }
        />
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="admin-text text-xl font-semibold">
                {selectedCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="admin-text block text-sm font-medium mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="admin-text block text-sm font-medium mb-1">
                  URL Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="category-url-slug"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be used in the URL: yoursite.com/<strong>{formData.slug || 'category-slug'}</strong>
                </p>
              </div>

              <div>
                <label className="admin-text block text-sm font-medium mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <label className="admin-text block text-sm font-medium mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="admin-text block text-sm font-medium mb-1">
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleInputChange}
                  min="0"
                  className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label className="admin-text ml-2 block text-sm">
                  Active
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setCategoryModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                  {isSubmitting && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>
                    {isSubmitting 
                      ? (selectedCategory ? 'Updating...' : 'Creating...') 
                      : (selectedCategory ? 'Update Category' : 'Create Category')
                    }
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
