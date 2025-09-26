'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MenuItem } from './DraggableMenuItem';

interface EditMenuItemModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (itemData: Partial<MenuItem>) => Promise<boolean>;
  parentCategories?: MenuItem[]; // For selecting parent category
}

export default function EditMenuItemModal({
  item,
  isOpen,
  onClose,
  onSave,
  parentCategories = []
}: EditMenuItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    image: '',
    isActive: true,
    showInMenu: true,
    menuLevel: 0,
    parentId: ''
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        slug: item.slug || '',
        image: item.image || '',
        isActive: item.isActive ?? true,
        showInMenu: item.showInMenu ?? true,
        menuLevel: item.menuLevel || 0,
        parentId: item.parentId || ''
      });
      setErrors({});
    }
  }, [item]);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const success = await onSave({
        ...formData,
        _id: item?._id
      });

      if (success) {
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {item ? 'Edit Menu Item' : 'Add Menu Item'}
          </h2>
          <button
            onClick={handleClose}
            disabled={saving}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                  errors.name ? 'border-red-500' : ''
                }`}
                placeholder="e.g., Lipstick, Foundation"
                disabled={saving}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                  errors.description ? 'border-red-500' : ''
                }`}
                placeholder="Brief description of the category"
                disabled={saving}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
                className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
                  errors.slug ? 'border-red-500' : ''
                }`}
                placeholder="e.g., lipstick, foundation"
                disabled={saving}
              />
              {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
              <p className="mt-1 text-sm text-gray-500">
                This will be used in URLs: /{formData.slug}
              </p>
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                id="image"
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="https://example.com/image.jpg"
                disabled={saving}
              />
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded-md border border-gray-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Parent Category */}
            {parentCategories.length > 0 && (
              <div>
                <label htmlFor="parentId" className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  id="parentId"
                  value={formData.parentId}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    parentId: e.target.value,
                    menuLevel: e.target.value ? 1 : 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  disabled={saving}
                >
                  <option value="">No Parent (Top Level)</option>
                  {parentCategories.map((parent) => (
                    <option key={parent._id} value={parent._id}>
                      {parent.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Toggles */}
            <div className="grid grid-cols-2 gap-6">
              {/* Active Status */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    disabled={saving}
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Inactive items won't be accessible to customers
                </p>
              </div>

              {/* Menu Visibility */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showInMenu}
                    onChange={(e) => setFormData(prev => ({ ...prev, showInMenu: e.target.checked }))}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                    disabled={saving}
                  />
                  <span className="ml-2 text-sm text-gray-700">Show in Menu</span>
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Hidden items won't appear in navigation menus
                </p>
              </div>
            </div>

            {/* Current item info */}
            {item && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Current Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Menu Order:</span> {item.menuOrder}
                  </div>
                  <div>
                    <span className="font-medium">Menu Level:</span> {item.menuLevel}
                  </div>
                  {item.productCount !== undefined && (
                    <div>
                      <span className="font-medium">Products:</span> {item.productCount}
                    </div>
                  )}
                  {item.children && item.children.length > 0 && (
                    <div>
                      <span className="font-medium">Subcategories:</span> {item.children.length}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-pink-600 border border-transparent rounded-md hover:bg-pink-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
