'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useCategories, Category } from '@/hooks/useCategories';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  TagIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

export default function CategoriesPage() {
  const { categories, loading, error, createCategory, updateCategory, deleteCategory, toggleCategoryStatus } = useCategories();
  const [showModal, setShowModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    isActive: true
  });

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image || '',
      isActive: category.isActive
    });
    setShowModal(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        setIsSubmitting(true);
        await deleteCategory(categoryToDelete._id);
        setCategoryToDelete(null);
        setShowDeleteDialog(false);
      } catch (error: any) {
        console.error('Failed to delete category:', error);
        alert(error.message || 'Failed to delete category');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slug from name
      if (name === 'name') {
        const slug = value.toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        setFormData(prev => ({ ...prev, slug }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const categoryData = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description,
      image: formData.image || undefined,
      isActive: formData.isActive
    };

    try {
      setIsSubmitting(true);
      
      if (selectedCategory) {
        // Update existing category
        await updateCategory(selectedCategory._id, categoryData);
      } else {
        // Add new category
        await createCategory(categoryData);
      }

      setShowModal(false);
      setSelectedCategory(null);
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(error.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleCategoryStatus = async (categoryId: string) => {
    try {
      await toggleCategoryStatus(categoryId);
    } catch (error: any) {
      console.error('Failed to toggle category status:', error);
      alert(error.message || 'Failed to toggle category status');
    }
  };

  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.isActive).length;
  const totalProducts = categories.reduce((sum, c) => sum + c.productCount, 0);

  return (
    <AdminLayout title="Categories">
      <div className="space-y-6">
        {/* Header & Stats */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600 mt-1">Manage product categories and organization</p>
            </div>
            <button 
              onClick={handleAddCategory}
              className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors flex items-center space-x-2"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 p-3 rounded-md">
                  <FolderIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Categories</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalCategories}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="bg-green-500 p-3 rounded-md">
                    <TagIcon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Categories</p>
                    <p className="text-2xl font-semibold text-gray-900">{activeCategories}</p>
                  </div>
                </div>
              </div>
              {/* Active Categories Preview */}
              {categories.filter(c => c.isActive).length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-3">Recent Active:</p>
                  <div className="flex -space-x-2 overflow-hidden">
                    {categories
                      .filter(c => c.isActive)
                      .slice(0, 5)
                      .map((category) => (
                      <div key={category.id} className="inline-block relative group">
                        <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <TagIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {/* Tooltip */}
                        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          {category.name}
                        </div>
                      </div>
                    ))}
                    {categories.filter(c => c.isActive).length > 5 && (
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                        <span className="text-xs text-gray-600 font-medium">
                          +{categories.filter(c => c.isActive).length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-purple-500 p-3 rounded-md">
                  <TagIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalProducts}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-pink-400 text-pink-600 focus:outline-none focus:placeholder-pink-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FolderIcon className="h-5 w-5 text-pink-500" />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Category Image */}
              <div className="h-48 bg-gray-200 relative">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    category.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Category Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <span className="text-sm text-gray-500">{category.productCount} products</span>
                </div>
                <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                <p className="text-xs text-gray-400 mb-4">/{category.slug}</p>
                
                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-yellow-600 hover:text-yellow-900 p-1"
                      title="Edit Category"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Delete Category"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => toggleCategoryStatus(category.id)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      category.isActive
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {category.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <FolderIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No categories found matching your search.</p>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-red-600">
                {selectedCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 placeholder-gray-400"
                  placeholder="Enter category name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 placeholder-gray-400"
                  placeholder="category-slug"
                />
                <p className="text-sm text-gray-500 mt-1">URL-friendly version of the name</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 placeholder-gray-400"
                  placeholder="Enter category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image
                </label>
                <div className="space-y-3">
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-blue-600 placeholder-gray-400"
                    placeholder="https://example.com/image.jpg"
                  />
                  
                  {/* Image Preview */}
                  {formData.image && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
                        <img
                          src={formData.image}
                          alt="Category preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Sample Images */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Quick Select (Sample Images):</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { name: 'Skincare', url: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=200&h=200&fit=crop' },
                        { name: 'Makeup', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=200&h=200&fit=crop' },
                        { name: 'Haircare', url: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=200&h=200&fit=crop' },
                        { name: 'Fragrance', url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=200&h=200&fit=crop' }
                      ].map((sample) => (
                        <button
                          key={sample.name}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: sample.url }))}
                          className="relative w-16 h-16 border-2 border-gray-200 rounded-lg overflow-hidden hover:border-pink-500 transition-colors"
                          title={`Use ${sample.name} image`}
                        >
                          <img
                            src={sample.url}
                            alt={sample.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-end justify-center pb-1">
                            <span className="text-xs text-white font-medium opacity-0 hover:opacity-100">
                              {sample.name}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Active (visible on website)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                >
                  {selectedCategory ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && categoryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Category</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete &quot;{categoryToDelete.name}&quot;? This action cannot be undone.
                {categoryToDelete.productCount > 0 && (
                  <span className="block mt-2 text-red-600 font-medium">
                    Warning: This category contains {categoryToDelete.productCount} products.
                  </span>
                )}
              </p>
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteCategory}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
