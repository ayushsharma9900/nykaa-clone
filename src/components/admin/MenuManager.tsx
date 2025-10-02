'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import DraggableMenuItem, { MenuItem } from './DraggableMenuItem';
import EditMenuItemModal from './EditMenuItemModal';
import { apiRequest } from '../../utils/api';

interface MenuManagerProps {
  onAddItem?: () => void;
}

interface AlertState {
  show: boolean;
  type: 'success' | 'error' | 'warning';
  message: string;
}

export default function MenuManager({ onAddItem }: MenuManagerProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState<AlertState>({ show: false, type: 'success', message: '' });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  // Fetch menu items
  const fetchMenuItems = useCallback(async () => {
    setLoading(true);
    try {
      // For admin menu management, we want to show ALL categories (including hidden ones)
      const response = await apiRequest('/menu-management/menu-items?showAll=true');

      const data = await response.json();
      
      console.log('Fetched menu items:', data);
      
      if (data.success) {
        setMenuItems(data.data);
      } else {
        showAlert('error', 'Failed to fetch menu items');
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      showAlert('error', 'Error fetching menu items');
    } finally {
      setLoading(false);
    }
  }, []);

  // Show alert message
  const showAlert = (type: 'success' | 'error' | 'warning', message: string) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: 'success', message: '' }), 5000);
  };

  // Initialize component
  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  // Handle drag end
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.index === destination.index) return;

    // Reorder items locally first for immediate feedback
    const newItems = Array.from(menuItems);
    const [movedItem] = newItems.splice(source.index, 1);
    newItems.splice(destination.index, 0, movedItem);
    
    setMenuItems(newItems);

    // Save new order to backend
    setSaving(true);
    try {
      const reorderedItems = newItems.map((item, index) => ({
        id: item._id,
        menuOrder: index,
        level: item.menuLevel,
        parentId: item.parentId,
        showInMenu: item.showInMenu
      }));

      const response = await apiRequest('/menu-management/reorder', {
        method: 'PUT',
        body: JSON.stringify({ items: reorderedItems })
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert('success', 'Menu order updated successfully');
        // Refresh data to ensure consistency
        await fetchMenuItems();
      } else {
        // Revert changes on error
        await fetchMenuItems();
        showAlert('error', 'Failed to update menu order');
      }
    } catch (error) {
      console.error('Error updating menu order:', error);
      // Revert changes on error
      await fetchMenuItems();
      showAlert('error', 'Error updating menu order');
    } finally {
      setSaving(false);
    }
  };

  // Handle item edit
  const handleEdit = useCallback((item: MenuItem) => {
    console.log('Edit item:', item);
    setSelectedItem(item);
    setEditModalOpen(true);
  }, []);

  // Handle save edit
  const handleSaveEdit = useCallback(async (itemData: Partial<MenuItem>): Promise<boolean> => {
    if (!itemData._id) {
      showAlert('error', 'Invalid item data');
      return false;
    }

    try {
      const response = await apiRequest(`/menu-management/update-item/${itemData._id}`, {
        method: 'PUT',
        body: JSON.stringify(itemData)
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert('success', 'Menu item updated successfully');
        await fetchMenuItems();
        return true;
      } else {
        showAlert('error', data.message || 'Failed to update menu item');
        return false;
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      showAlert('error', 'Error updating menu item');
      return false;
    }
  }, [fetchMenuItems]);

  // Handle close edit modal
  const handleCloseEditModal = useCallback(() => {
    setEditModalOpen(false);
    setSelectedItem(null);
  }, []);

  // Handle item delete
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      const response = await apiRequest(`/menu-management/delete-item/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert('success', 'Menu item deleted successfully');
        await fetchMenuItems();
      } else {
        showAlert('error', data.message || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      showAlert('error', 'Error deleting menu item');
    }
  }, [fetchMenuItems]);

  // Handle visibility toggle
  const handleToggleVisibility = useCallback(async (id: string, showInMenu: boolean) => {
    try {
      const response = await apiRequest(`/menu-management/toggle-visibility/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ showInMenu })
      });

      const data = await response.json();
      
      if (data.success) {
        showAlert('success', `Menu item ${showInMenu ? 'shown in' : 'hidden from'} menu`);
        await fetchMenuItems();
      } else {
        showAlert('error', 'Failed to update visibility');
      }
    } catch (error) {
      console.error('Error updating visibility:', error);
      showAlert('error', 'Error updating visibility');
    }
  }, [fetchMenuItems]);

  // Handle sync with main categories
  const handleSyncCategories = useCallback(async () => {
    if (!confirm('This will sync menu settings with the main categories table. Continue?')) return;

    setSaving(true); // Show loading state
    try {
      console.log('Starting category sync...');
      
      // Use dynamic API base URL that works for both local and Vercel
      const API_BASE_URL = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.host}/api`
        : '/api';
      const url = `${API_BASE_URL}/menu-management/sync-categories`;
      
      console.log('Sync URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Sync response:', response);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response text:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Sync data:', data);
      
      if (data.success) {
        showAlert('success', `Successfully synced ${data.synced} categories with menu settings`);
      } else {
        showAlert('error', data.message || 'Failed to sync categories');
      }
    } catch (error) {
      console.error('Error syncing categories:', error);
      
      // More detailed error reporting
      if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        showAlert('error', 'Network error: Cannot connect to backend server. Please ensure the backend is running on port 5001.');
      } else {
        showAlert('error', `Error syncing categories: ${error.message}`);
      }
    } finally {
      setSaving(false); // Hide loading state
    }
  }, []);

  // Filter items based on search
  const filteredItems = menuItems.filter(item => {
    const term = searchTerm.toLowerCase();
    const name = (item.name || '').toLowerCase();
    const description = (item.description || '').toLowerCase();
    const slug = (item.slug || '').toLowerCase();
    
    return name.includes(term) || description.includes(term) || slug.includes(term);
  });

  // Flatten items for display (including children)
  const flattenItems = (items: MenuItem[]): MenuItem[] => {
    const result: MenuItem[] = [];
    items.forEach(item => {
      result.push(item);
      if (item.children && item.children.length > 0) {
        result.push(...flattenItems(item.children));
      }
    });
    return result;
  };

  const displayItems = flattenItems(filteredItems);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        <span className="ml-3 text-gray-600">Loading menu items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert */}
      {alert.show && (
        <div className={`rounded-md p-4 ${
          alert.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          alert.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-yellow-50 text-yellow-800 border border-yellow-200'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {alert.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
              {alert.type === 'error' && <XCircleIcon className="h-5 w-5" />}
              {alert.type === 'warning' && <ExclamationTriangleIcon className="h-5 w-5" />}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{alert.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Drag and drop menu items to reorder them. Changes here will be reflected in the main website header menu.
            Use "Sync Categories" to ensure consistency with the main categories table.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchMenuItems}
            disabled={loading || saving}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={handleSyncCategories}
            disabled={loading || saving}
            className="inline-flex items-center px-3 py-2 border border-blue-300 shadow-sm text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            title="Sync menu settings with main categories table"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Syncing...' : 'Sync Categories'}
          </button>
          
          {onAddItem && (
            <button
              onClick={onAddItem}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Item
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
          placeholder="Search menu items..."
        />
      </div>

      {/* Saving Indicator */}
      {saving && (
        <div className="flex items-center justify-center py-2">
          <ArrowPathIcon className="h-4 w-4 animate-spin text-pink-600 mr-2" />
          <span className="text-sm text-gray-600">Saving changes...</span>
        </div>
      )}

      {/* Menu Items */}
      <div className="space-y-4">
        {displayItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No menu items found.</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-pink-600 hover:text-pink-700 text-sm mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="menu-items">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-pink-50 rounded-lg p-4' : ''}`}
                >
                  {displayItems.map((item, index) => (
                    <DraggableMenuItem
                      key={item._id}
                      item={item}
                      index={index}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggleVisibility={handleToggleVisibility}
                      level={item.menuLevel}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>

      {/* Stats */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-medium text-gray-900">{menuItems.length}</span> total items
          </div>
          <div>
            <span className="font-medium text-gray-900">
              {menuItems.filter(item => item.showInMenu).length}
            </span> visible in menu
          </div>
          <div>
            <span className="font-medium text-gray-900">
              {menuItems.filter(item => item.isActive).length}
            </span> active items
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditMenuItemModal
        item={selectedItem}
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveEdit}
        parentCategories={menuItems.filter(item => item.menuLevel === 0)}
      />
    </div>
  );
}
