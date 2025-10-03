'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';


import AdminLayout from '@/components/admin/AdminLayout';
import AdvancedDataTable, { Column, BulkAction } from '@/components/admin/AdvancedDataTable';
import { usePagination } from '@/hooks/usePagination';
import ProductModal from '@/components/admin/ProductModal';
import ProductDetailModal from '@/components/admin/ProductDetailModal';
import { apiService } from '@/lib/api';
import { mapBackendToFrontend, mapFrontendToBackend } from '@/lib/dataMapper';
import { Product } from '@/types';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface BackendProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  sku: string;
  isActive: boolean;
  totalSold?: number;
  averageRating?: number;
  reviewCount?: number;
  tags?: string[];
  images?: Array<{ url: string; alt: string }>;
  createdAt: string;
  updatedAt: string;
}

function EnhancedProductsContent() {
  console.log('🚀 ENHANCED PRODUCTS PAGE LOADING');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; isActive: boolean }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Use new pagination hook
  const pagination = usePagination({
    initialPage: parseInt(searchParams?.get('page') || '1'),
    initialPageSize: parseInt(searchParams?.get('limit') || '25'),
    pageSizeOptions: [10, 25, 50, 100]
  });

  // Fetch products from backend
  const fetchProducts = useCallback(async (page = pagination.paginationState.currentPage, pageSize = pagination.paginationState.pageSize, filters: Record<string, any> = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: pageSize,
        // Default to showing only active products unless explicitly filtering for inactive ones
        status: filters.status || 'active',
        ...filters
      };
      
      console.log('Fetching products with params:', params);
      const response = await apiService.getAllProductsForAdmin(params);
      console.log('Fetch products response:', response);
      
      if (response.success && response.data) {
        const mappedProducts = (response.data as BackendProduct[]).map(mapBackendToFrontend);
        setProducts(mappedProducts);
        
        // Update pagination - assuming backend returns pagination info
        if ((response as any).pagination) {
          pagination.updateTotalItems((response as any).pagination.totalProducts || 0);
        } else {
          pagination.updateTotalItems(mappedProducts.length);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      
      let errorMessage = 'Failed to fetch products. Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle specific network errors
        if (errorMessage.includes('Backend server is not running')) {
          errorMessage = 'Backend server is not available. Please check if the server is running.';
        } else if (errorMessage.includes('timeout')) {
          errorMessage = 'Request timed out. Please check your connection and try again.';
        } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
          errorMessage = 'Access denied. You do not have permission to view products.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const response = await apiService.getCategories();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Refetch when pagination state changes
  useEffect(() => {
    fetchProducts(pagination.paginationState.currentPage, pagination.paginationState.pageSize);
  }, [pagination.paginationState.currentPage, pagination.paginationState.pageSize]);

  // Table columns definition
  const columns: Column<Product>[] = useMemo(() => [
    {
      key: 'image',
      label: 'Image',
      width: 'w-20',
      render: (value: string, item: Product) => (
        <div className="h-12 w-12 flex-shrink-0">
          <img 
            className="h-12 w-12 rounded-lg object-cover" 
            src={value || '/placeholder-product.png'} 
            alt={item.name}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-product.png';
            }}
          />
        </div>
      )
    },
    {
      key: 'name',
      label: 'Product',
      sortable: true,
      render: (value: string, item: Product) => (
        <div className="max-w-xs">
          <div className="text-sm font-medium text-gray-900 truncate" title={value}>
            {value}
          </div>
          <div className="text-sm text-gray-500">{item.brand}</div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      align: 'right' as const,
      render: (value: number, item: Product) => {
        // Defensive coding: ensure value is a number
        const numericValue = typeof value === 'number' ? value : parseFloat(value as any) || 0;
        const originalPrice = item.originalPrice && typeof item.originalPrice === 'number' ? 
          item.originalPrice : parseFloat(item.originalPrice as any) || 0;
        
        return (
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">₹{numericValue.toLocaleString('en-IN')}</div>
            {originalPrice > 0 && (
              <div className="text-xs text-gray-400 line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'stockCount',
      label: 'Stock',
      sortable: true,
      align: 'center' as const,
      render: (value: number) => (
        <div className="text-center">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            value <= 0 ? 'bg-red-100 text-red-800' :
            value <= 10 ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {value}
          </span>
        </div>
      )
    },
    {
      key: 'inStock',
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
      key: 'rating',
      label: 'Rating',
      sortable: true,
      align: 'center' as const,
      render: (value: number, item: Product) => {
        // Defensive coding: ensure value is a number
        const numericValue = typeof value === 'number' ? value : parseFloat(value as any) || 0;
        return (
          <div className="text-center">
            <div className="flex items-center justify-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm font-medium">{numericValue.toFixed(1)}</span>
            </div>
            <div className="text-xs text-gray-400">({item.reviewCount || 0})</div>
          </div>
        );
      }
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
      id: 'change-category',
      label: 'Change Category',
      icon: () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.023.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" /></svg>,
      variant: 'secondary'
    },
    {
      id: 'update-pricing',
      label: 'Update Pricing',
      icon: () => <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>,
      variant: 'secondary'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: TrashIcon,
      variant: 'danger',
      requireConfirmation: true,
      confirmationMessage: 'Are you sure you want to delete the selected products? This action cannot be undone.'
    }
  ];

  // Row actions
  const rowActions = [
    { id: 'view', label: 'View', icon: EyeIcon, variant: 'secondary' as const },
    { id: 'edit', label: 'Edit', icon: PencilIcon, variant: 'primary' as const },
    { id: 'delete', label: 'Delete', icon: TrashIcon, variant: 'danger' as const }
  ];

  // Filter options
  const filterOptions = [
    {
      key: 'category',
      label: 'Category',
      type: 'select' as const,
      options: categories.map(cat => ({ value: cat.name, label: cat.name }))
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      key: 'minPrice',
      label: 'Min Price',
      type: 'number' as const
    },
    {
      key: 'maxPrice',
      label: 'Max Price',
      type: 'number' as const
    }
  ];

  // Event handlers
  const handleRowAction = useCallback(async (action: string, product: Product) => {
    switch (action) {
      case 'view':
        setSelectedProduct(product);
        setShowDetailModal(true);
        break;
      case 'edit':
        setSelectedProduct(product);
        setShowProductModal(true);
        break;
      case 'delete':
        console.log('📝 DELETE BUTTON CLICKED:', { 
          productId: product.id, 
          productName: product.name,
          timestamp: new Date().toISOString()
        });
        
        // Simple test first - just show alert
        alert(`Delete clicked for: ${product.name} (ID: ${product.id})`);
        
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
          console.log('👍 DELETE CONFIRMED by user');
          try {
            console.log('🚀 Calling apiService.deleteProduct...');
            const response = await apiService.deleteProduct(product.id);
            
            console.log('📝 DELETE RESPONSE:', response);
            
            if (response.success) {
              console.log('✅ DELETE SUCCESS - showing alert');
              alert('Product deleted successfully!');
              console.log('🔄 Refreshing products list...');
              await fetchProducts(pagination.current, pagination.pageSize);
              console.log('✨ Products list refreshed');
            } else {
              throw new Error(response.message || 'Delete operation failed');
            }
          } catch (err: any) {
            console.error('❌ DELETE ERROR:', err);
            const errorMsg = err.message || 'Failed to delete product. Please try again.';
            if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
              console.log('🔐 Auth error detected');
              alert('Authentication failed. Please log in again.');
            } else if (errorMsg.includes('403') || errorMsg.includes('forbidden')) {
              console.log('🚫 Permission error detected');
              alert('Access denied. You do not have permission to delete products.');
            } else {
              console.log('⁉️ General error:', errorMsg);
              alert(`Delete failed: ${errorMsg}`);
            }
          }
        } else {
          console.log('❌ DELETE CANCELLED by user');
        }
        break;
    }
  }, [pagination.current, pagination.pageSize, fetchProducts]);

  const handleBulkAction = useCallback(async (actionId: string, selectedProducts: Product[]) => {
    try {
      setLoading(true);
      const productIds = selectedProducts.map(p => p.id);
      
      switch (actionId) {
        case 'activate':
        case 'deactivate':
          const isActive = actionId === 'activate';
          await apiService.bulkUpdateProductStatus(productIds, isActive);
          break;
          
        case 'change-category':
          const availableCategories = categories
            .filter(cat => cat.isActive)
            .map(cat => cat.name)
            .join(', ');
          
          const categoryPrompt = prompt(
            `Enter new category name:\nAvailable categories: ${availableCategories}`,
            categories.find(cat => cat.isActive)?.name || ''
          );
          
          if (categoryPrompt) {
            const trimmedCategory = categoryPrompt.trim();
            const validCategory = categories.find(
              cat => cat.isActive && cat.name.toLowerCase() === trimmedCategory.toLowerCase()
            );
            
            if (validCategory) {
              await apiService.bulkChangeCategory(productIds, validCategory.name);
            } else {
              throw new Error(`Invalid category "${trimmedCategory}". Available categories: ${availableCategories}`);
            }
          } else {
            return; // User cancelled
          }
          break;
          
        case 'update-pricing':
          const priceType = prompt('Price change type (percentage/fixed):', 'percentage');
          if (!priceType || !['percentage', 'fixed'].includes(priceType)) {
            if (priceType) throw new Error('Invalid price change type');
            return; // User cancelled
          }
          
          const priceValue = prompt(`Enter ${priceType} change value:`, '0');
          if (priceValue === null) return; // User cancelled
          
          const numValue = parseFloat(priceValue);
          if (isNaN(numValue)) {
            throw new Error('Invalid price value');
          }
          
          await apiService.bulkUpdatePricing(productIds, {
            type: priceType as 'percentage' | 'fixed',
            value: numValue
          });
          break;
          
        case 'delete':
          const deleteResponse = await apiService.bulkDeleteProducts(productIds);
          if (deleteResponse.success) {
            alert(`Successfully deleted ${productIds.length} products!`);
          } else {
            throw new Error(deleteResponse.message || 'Bulk delete operation failed');
          }
          break;
      }
      
      await fetchProducts(pagination.current, pagination.pageSize);
    } catch (err: any) {
      console.error(`Failed to ${actionId} products:`, err);
      const errorMsg = err.message || `Failed to ${actionId} products. Please try again.`;
      if (errorMsg.includes('401') || errorMsg.includes('unauthorized')) {
        alert('Authentication failed. Please log in again.');
      } else if (errorMsg.includes('403') || errorMsg.includes('forbidden')) {
        alert('Access denied. You do not have permission to perform this action.');
      } else {
        alert(`${actionId.charAt(0).toUpperCase() + actionId.slice(1)} failed: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, fetchProducts, categories]);

  const handleAddProduct = useCallback(() => {
    setSelectedProduct(null);
    setShowProductModal(true);
  }, []);

  const handleSaveProduct = useCallback(async (product: Product) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const backendProduct = mapFrontendToBackend(product);
      console.log('Saving product with data:', backendProduct);
      
      if (product.id && products.find(p => p.id === product.id)) {
        // Update existing product
        const response = await apiService.updateProduct(product.id, backendProduct);
        console.log('Update response:', response);
        if (!response.success) {
          throw new Error(response.message || 'Failed to update product');
        }
      } else {
        // Create new product
        const response = await apiService.createProduct(backendProduct);
        console.log('Create response:', response);
        if (!response.success) {
          throw new Error(response.message || 'Failed to create product');
        }
      }
      
      await fetchProducts(pagination.current, pagination.pageSize);
      setShowProductModal(false);
      setSelectedProduct(null);
      
      // Show success message
      const action = product.id ? 'updated' : 'created';
      alert(`Product successfully ${action}!`);
    } catch (err) {
      console.error('Failed to save product:', err);
      
      let errorMessage = 'Failed to save product. Please try again.';
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Handle specific validation errors
        if (errorMessage.includes('Validation errors')) {
          errorMessage = 'Please check all required fields and try again.';
        } else if (errorMessage.includes('SKU already exists')) {
          errorMessage = 'A product with this SKU already exists. Please use a different name or brand.';
        } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          errorMessage = 'Authentication failed. Please log in again.';
        } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
          errorMessage = 'Access denied. You do not have permission to perform this action.';
        }
      }
      
      setError(errorMessage);
      alert(errorMessage);
      throw err; // Re-throw to keep modal open
    } finally {
      setIsSubmitting(false);
    }
  }, [products, pagination.current, pagination.pageSize, fetchProducts]);

  const handlePageChange = useCallback((page: number) => {
    pagination.goToPage(page);
  }, [pagination]);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    pagination.changePageSize(pageSize);
  }, [pagination]);

  const handleFilter = useCallback((filters: Record<string, any>) => {
    fetchProducts(1, pagination.paginationState.pageSize, filters);
  }, [pagination.paginationState.pageSize, fetchProducts]);

  const handleExport = useCallback(async (format: 'csv' | 'excel' | 'pdf') => {
    try {
      // Implement export functionality
      console.log(`Exporting products as ${format}`);
      alert(`Export as ${format.toUpperCase()} functionality would be implemented here`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
  }, []);

  return (
    <AdminLayout title="Products Management">
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
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product inventory with advanced controls</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.push('/admin/import')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <ArrowDownTrayIcon className="h-5 w-5" />
              <span>Import Products</span>
            </button>
            <button 
              onClick={handleAddProduct}
              className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Advanced Data Table */}
        
        <AdvancedDataTable
          data={products}
          columns={columns}
          loading={loading}
          pagination={{
            current: pagination.paginationState.currentPage,
            total: pagination.paginationState.totalItems,
            pageSize: pagination.paginationState.pageSize,
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange
          }}
          bulkActions={bulkActions}
          filterOptions={filterOptions}
          rowActions={rowActions}
          searchable={true}
          exportable={true}
          selectable={true}
          onBulkAction={handleBulkAction}
          onRowAction={handleRowAction}
          onFilter={handleFilter}
          onExport={handleExport}
          title={`${pagination.total} Products`}
          subtitle={`Showing ${products.length} products`}
          emptyState={
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Get started by adding your first product.</p>
              <button 
                onClick={handleAddProduct}
                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors"
              >
                Add Product
              </button>
            </div>
          }
        />
      </div>
      
      {/* Modals */}
      <ProductModal
        isOpen={showProductModal}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProduct(null);
        }}
        onSave={handleSaveProduct}
        product={selectedProduct}
        isSubmitting={isSubmitting}
      />
      
      <ProductDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
      />
    </AdminLayout>
  );
}

function EnhancedProductsLoading() {
  return (
    <AdminLayout title="Products Management">
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-pink-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span>Loading products...</span>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function EnhancedProductsPage() {
  return (
    <Suspense fallback={<EnhancedProductsLoading />}>
      <EnhancedProductsContent />
    </Suspense>
  );
}
