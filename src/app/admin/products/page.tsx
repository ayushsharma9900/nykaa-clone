'use client';

import { useState } from 'react';
import { useAdminProducts } from '@/hooks/useAdminProducts';
import AdminLayout from '@/components/admin/AdminLayout';
import ProductModal from '@/components/admin/ProductModal';
import ProductDetailModal from '@/components/admin/ProductDetailModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Product } from '@/types';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function ProductsPage() {
  const [showProductModal, setShowProductModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { products, loading, error, saveProduct, deleteProduct } = useAdminProducts();

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesStock = !stockFilter || 
                        (stockFilter === 'in-stock' && product.inStock) ||
                        (stockFilter === 'out-of-stock' && !product.inStock);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const categories = [...new Set(products.map(p => p.category))];
  
  const handleViewProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setSelectedProduct(product);
      setShowDetailModal(true);
    }
  };
  
  const handleEditProduct = (productId: string) => {
    console.log('Edit button clicked for product ID:', productId);
    const product = products.find(p => p.id === productId);
    console.log('Found product:', product);
    if (product) {
      console.log('Setting selected product and opening modal');
      setSelectedProduct(product);
      setShowProductModal(true);
    } else {
      console.error('Product not found!');
    }
  };
  
  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowProductModal(true);
  };
  
  const handleDeleteProduct = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setShowDeleteDialog(true);
    }
  };
  
  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      try {
        await deleteProduct(productToDelete.id);
        setProductToDelete(null);
        setShowDeleteDialog(false);
      } catch (error) {
        console.error('Failed to delete product:', error);
        // You could add a toast notification here
      }
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

  return (
    <AdminLayout title="Products">
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
                  <strong className="font-medium">Notice:</strong> API connection failed. {error}. Changes will be saved locally.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">Manage your product catalog</p>
          </div>
          <button 
            onClick={handleAddProduct}
            className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-pink-500" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-pink-400 focus:outline-none focus:placeholder-pink-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-pink-500" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-pink-600 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="" className="text-pink-600">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category} className="text-pink-600">{category}</option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-pink-600 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="" className="text-pink-600">All Stock</option>
                <option value="in-stock" className="text-pink-600">In Stock</option>
                <option value="out-of-stock" className="text-pink-600">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {filteredProducts.length} Products
              </h3>
              <div className="text-sm text-gray-500">
                {filteredProducts.length} of {products.length} products shown
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0">
                            <img 
                              className="h-12 w-12 rounded-lg object-cover" 
                              src={product.image} 
                              alt={product.name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 max-w-xs">
                              {product.name.length > 50 ? 
                                `${product.name.substring(0, 50)}...` : 
                                product.name
                              }
                            </div>
                            <div className="text-sm text-gray-500">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium">{product.category}</div>
                          {product.subcategory && (
                            <div className="text-xs text-gray-400">{product.subcategory}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div className="font-medium text-gray-900">₹{product.price}</div>
                          {product.originalPrice && (
                            <div className="text-xs text-gray-400 line-through">
                              ₹{product.originalPrice}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium">{product.stockCount || 0}</div>
                        <div className="text-xs text-gray-400">units</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1 font-medium">{product.rating}</span>
                          <span className="ml-1 text-xs text-gray-400">({product.reviewCount})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewProduct(product.id)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="View Product"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditProduct(product.id)}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Edit Product"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Product"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
      
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setProductToDelete(null);
        }}
        onConfirm={confirmDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </AdminLayout>
  );
}
