'use client';

import { useState, useMemo } from 'react';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import AdminLayout from '@/components/admin/AdminLayout';
import AdvancedDataTable, { Column, BulkAction, FilterOption } from '@/components/admin/AdvancedDataTable';
import ProductModal from '@/components/admin/ProductModal';
import ProductDetailModal from '@/components/admin/ProductDetailModal';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Product } from '@/types';

export default function EnhancedProductsPage() {
  const { products, loading, error, saveProduct, deleteProduct, updateProduct } = useAdminProducts();
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Define table columns
  const columns: Column<Product>[] = useMemo(() => [
    {
      key: 'image',
      label: 'Image',
      render: (value: string) => (
        <img src={value} alt="Product" className="w-12 h-12 rounded-lg object-cover" />
      ),
      width: 'w-16'
    },
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      filterable: true,
      render: (value: string, item: Product) => (
        <div>
          <p className="font-medium text-gray-900 text-sm max-w-xs truncate">{value}</p>
          <p className="text-xs text-gray-500">{item.brand}</p>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      filterable: true,
      render: (value: string, item: Product) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{value}</p>
          {item.subcategory && (
            <p className="text-xs text-gray-500">{item.subcategory}</p>
          )}
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      align: 'right' as const,
      render: (value: number, item: Product) => (
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">₹{value.toLocaleString('en-IN')}</p>
          {item.originalPrice && (
            <p className="text-xs text-gray-500 line-through">₹{item.originalPrice.toLocaleString('en-IN')}</p>
          )}
        </div>
      )
    },
    {
      key: 'stockCount',
      label: 'Stock',
      sortable: true,
      align: 'center' as const,
      render: (value: number) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 0 ? 'bg-red-100 text-red-800' :
          value < 10 ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'inStock',
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'In Stock' : 'Out of Stock'}
        </span>
      )
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      align: 'center' as const,
      render: (value: number, item: Product) => (
        <div className="flex items-center justify-center">
          <span className="text-yellow-400 text-sm">★</span>
          <span className="ml-1 text-sm font-medium text-gray-900">{value}</span>
          <span className="ml-1 text-xs text-gray-500">({item.reviewCount})</span>
        </div>
      )
    }
  ], []);

  // Define bulk actions
  const bulkActions: BulkAction[] = [
    {
      id: 'activate',
      label: 'Mark In Stock',
      icon: EyeIcon,
      variant: 'primary'
    },
    {
      id: 'deactivate',
      label: 'Mark Out of Stock',
      variant: 'secondary'
    },
    {
      id: 'export-selected',
      label: 'Export Selected',
      icon: ArrowDownTrayIcon,
      variant: 'secondary'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: TrashIcon,
      variant: 'danger',
      requireConfirmation: true,
      confirmationMessage: 'Are you sure you want to delete these products? This action cannot be undone.'
    }
  ];

  // Define filter options
  const categories = Array.from(new Set(products.map(p => p.category)));
  const brands = Array.from(new Set(products.map(p => p.brand)));
  
  const filterOptions: FilterOption[] = [
    {
      key: 'category',
      label: 'Category',
      type: 'select',
      options: categories.map(cat => ({ value: cat, label: cat }))
    },
    {
      key: 'brand',
      label: 'Brand',
      type: 'select',
      options: brands.map(brand => ({ value: brand, label: brand }))
    },
    {
      key: 'inStock',
      label: 'Stock Status',
      type: 'select',
      options: [
        { value: 'true', label: 'In Stock' },
        { value: 'false', label: 'Out of Stock' }
      ]
    },
    {
      key: 'price',
      label: 'Max Price',
      type: 'number'
    },
    {
      key: 'rating',
      label: 'Min Rating',
      type: 'number'
    }
  ];

  // Calculate pagination
  const totalProducts = products.length;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = products.slice(startIndex, startIndex + pageSize);
  
  const handleBulkAction = async (actionId: string, selectedItems: Product[]) => {
    try {
      switch (actionId) {
        case 'activate':
          for (const product of selectedItems) {
            await updateProduct({ ...product, inStock: true });
          }
          break;
        case 'deactivate':
          for (const product of selectedItems) {
            await updateProduct({ ...product, inStock: false });
          }
          break;
        case 'export-selected':
          handleExportProducts(selectedItems, 'csv');
          break;
        case 'delete':
          for (const product of selectedItems) {
            await deleteProduct(product.id);
          }
          break;
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      alert('Bulk action failed. Please try again.');
      throw error;
    }
  };

  const handleRowAction = (action: string, item: Product) => {
    switch (action) {
      case 'view':
        setSelectedProduct(item);
        setShowDetailModal(true);
        break;
      case 'edit':
        setSelectedProduct(item);
        setShowProductModal(true);
        break;
      case 'delete':
        if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
          deleteProduct(item.id);
        }
        break;
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    handleExportProducts(products, format);
  };

  const handleExportProducts = (productsToExport: Product[], format: string) => {
    if (format === 'csv') {
      const headers = ['Name', 'Brand', 'Category', 'Price', 'Stock', 'Status', 'Rating'];
      const csvContent = [
        headers.join(','),
        ...productsToExport.map(product => [
          `"${product.name}"`,
          `"${product.brand}"`,
          `"${product.category}"`,
          product.price,
          product.stockCount || 0,
          product.inStock ? 'In Stock' : 'Out of Stock',
          product.rating
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else {
      console.log(`Exporting ${productsToExport.length} products as ${format}`);
      alert(`Export as ${format.toUpperCase()} functionality will be implemented soon.`);
    }
  };

  const handleSaveProduct = async (product: Product) => {
    setIsSubmitting(true);
    try {
      await saveProduct(product);
      setSelectedProduct(null);
      setShowProductModal(false);
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };

  return (
    <AdminLayout title="Products - Enhanced">
      <div className="space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong className="font-medium">Notice:</strong> {error}. Using fallback data.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enhanced Products</h1>
            <p className="text-gray-600 mt-1">Advanced product management with bulk operations and filtering</p>
          </div>
          <button 
            onClick={handleAddProduct}
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Enhanced Data Table */}
        <AdvancedDataTable<Product>
          data={products}
          columns={columns}
          loading={loading}
          pagination={{
            current: currentPage,
            total: totalProducts,
            pageSize: pageSize,
            onPageChange: setCurrentPage,
            onPageSizeChange: setPageSize
          }}
          bulkActions={bulkActions}
          filterOptions={filterOptions}
          searchable={true}
          exportable={true}
          selectable={true}
          onBulkAction={handleBulkAction}
          onRowAction={handleRowAction}
          onExport={handleExport}
          title="Product Catalog"
          subtitle={`${totalProducts} products total`}
          emptyState={
            <div className="text-center py-8">
              <PlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">No products found</p>
              <p className="text-gray-400 text-sm">Get started by adding your first product</p>
              <button 
                onClick={handleAddProduct}
                className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
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
