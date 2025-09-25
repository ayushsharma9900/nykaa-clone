'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronDownIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export interface Column<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'primary' | 'secondary' | 'danger';
  requireConfirmation?: boolean;
  confirmationMessage?: string;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'text' | 'date' | 'number' | 'boolean';
  options?: { value: string; label: string }[];
}

interface AdvancedDataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  bulkActions?: BulkAction[];
  filterOptions?: FilterOption[];
  searchable?: boolean;
  exportable?: boolean;
  selectable?: boolean;
  onBulkAction?: (actionId: string, selectedItems: T[]) => Promise<void>;
  onRowAction?: (action: string, item: T) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  rowActions?: Array<{
    id: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  emptyState?: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function AdvancedDataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  pagination,
  bulkActions = [],
  filterOptions = [],
  searchable = true,
  exportable = true,
  selectable = true,
  onBulkAction,
  onRowAction,
  onSort,
  onFilter,
  onExport,
  rowActions = [
    { id: 'view', label: 'View', icon: EyeIcon, variant: 'secondary' },
    { id: 'edit', label: 'Edit', icon: PencilIcon, variant: 'primary' },
    { id: 'delete', label: 'Delete', icon: TrashIcon, variant: 'danger' }
  ],
  emptyState,
  title,
  subtitle
}: AdvancedDataTableProps<T>) {
  const [selectedItems, setSelectedItems] = useState<Set<string | number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState<{ action: BulkAction; items: T[] } | null>(null);

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let result = [...data];

    // Apply search filter
    if (searchQuery) {
      result = result.filter(item =>
        columns.some(column => {
          const value = item[column.key as keyof T];
          return String(value).toLowerCase().includes(searchQuery.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value != null) {
        result = result.filter(item => {
          const itemValue = item[key as keyof T];
          if (typeof value === 'boolean') {
            return Boolean(itemValue) === value;
          }
          return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
        });
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof T];
        const bValue = b[sortConfig.key as keyof T];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, filters, sortConfig, columns]);

  const handleSort = useCallback((key: string) => {
    const direction = sortConfig?.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
    onSort?.(key, direction);
  }, [sortConfig, onSort]);

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === processedData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(processedData.map(item => item.id)));
    }
  }, [selectedItems.size, processedData]);

  const handleSelectItem = useCallback((itemId: string | number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  }, [selectedItems]);

  const handleBulkAction = useCallback(async (action: BulkAction) => {
    const selectedData = processedData.filter(item => selectedItems.has(item.id));
    
    if (action.requireConfirmation) {
      setShowBulkConfirm({ action, items: selectedData });
      return;
    }

    try {
      await onBulkAction?.(action.id, selectedData);
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  }, [processedData, selectedItems, onBulkAction]);

  const confirmBulkAction = useCallback(async () => {
    if (!showBulkConfirm) return;

    try {
      await onBulkAction?.(showBulkConfirm.action.id, showBulkConfirm.items);
      setSelectedItems(new Set());
      setShowBulkConfirm(null);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  }, [showBulkConfirm, onBulkAction]);

  const handleExport = useCallback((format: 'csv' | 'excel' | 'pdf') => {
    onExport?.(format);
  }, [onExport]);

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-medium text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Search */}
            {searchable && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Filters Toggle */}
            {filterOptions.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </button>
            )}

            {/* Export */}
            {exportable && (
              <div className="relative group">
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Export
                  <ChevronDownIcon className="h-4 w-4 ml-1" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <button onClick={() => handleExport('csv')} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Export as CSV</button>
                    <button onClick={() => handleExport('excel')} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Export as Excel</button>
                    <button onClick={() => handleExport('pdf')} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Export as PDF</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        {showFilters && filterOptions.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filterOptions.map((option) => (
                <div key={option.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {option.label}
                  </label>
                  {option.type === 'select' ? (
                    <select
                      value={filters[option.key] || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, [option.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All</option>
                      {option.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={option.type}
                      value={filters[option.key] || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, [option.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setFilters({})}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear All
              </button>
              <button
                onClick={() => onFilter?.(filters)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectable && selectedItems.size > 0 && bulkActions.length > 0 && (
          <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-md">
            <span className="text-sm text-blue-700">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              {bulkActions.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleBulkAction(action)}
                  className={`flex items-center px-3 py-1 text-sm font-medium rounded-md ${
                    action.variant === 'danger' 
                      ? 'text-red-700 bg-red-100 hover:bg-red-200'
                      : action.variant === 'primary'
                      ? 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="w-12 px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === processedData.length && processedData.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.width || ''
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <button
                        onClick={() => handleSort(String(column.key))}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ArrowsUpDownIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
              {rowActions.length > 0 && (
                <th className="w-32 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </td>
              </tr>
            ) : processedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions.length > 0 ? 1 : 0)} className="px-6 py-4 text-center">
                  {emptyState || <p className="text-gray-500">No data available</p>}
                </td>
              </tr>
            ) : (
              processedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        column.align === 'center' ? 'text-center' : 
                        column.align === 'right' ? 'text-right' : ''
                      }`}
                    >
                      {column.render 
                        ? column.render(item[column.key as keyof T], item)
                        : String(item[column.key as keyof T] || '')
                      }
                    </td>
                  ))}
                  {rowActions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {rowActions.map((action) => (
                          <button
                            key={action.id}
                            onClick={() => onRowAction?.(action.id, item)}
                            className={`p-1 rounded hover:bg-gray-100 ${
                              action.variant === 'danger' ? 'text-red-600 hover:text-red-900' :
                              action.variant === 'primary' ? 'text-blue-600 hover:text-blue-900' :
                              'text-gray-400 hover:text-gray-600'
                            }`}
                            title={action.label}
                          >
                            {action.icon && <action.icon className="h-4 w-4" />}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <p className="text-sm text-gray-700">
              Showing {((pagination.current - 1) * pagination.pageSize) + 1} to{' '}
              {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
              {pagination.total} results
            </p>
            {pagination.onPageSizeChange && (
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange!(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => pagination.onPageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, Math.ceil(pagination.total / pagination.pageSize)) }, (_, i) => {
              const page = Math.max(1, pagination.current - 2) + i;
              return page <= Math.ceil(pagination.total / pagination.pageSize) ? (
                <button
                  key={page}
                  onClick={() => pagination.onPageChange(page)}
                  className={`px-3 py-1 text-sm rounded ${
                    page === pagination.current
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ) : null;
            })}
            
            <button
              onClick={() => pagination.onPageChange(pagination.current + 1)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Action</h3>
            <p className="text-sm text-gray-600 mb-6">
              {showBulkConfirm.action.confirmationMessage || 
               `Are you sure you want to ${showBulkConfirm.action.label.toLowerCase()} ${showBulkConfirm.items.length} item(s)?`}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkAction}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  showBulkConfirm.action.variant === 'danger'
                    ? 'text-white bg-red-600 hover:bg-red-700'
                    : 'text-white bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
