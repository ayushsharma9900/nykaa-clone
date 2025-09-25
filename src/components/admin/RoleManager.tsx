'use client';

import React, { useState, useEffect } from 'react';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  KeyIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
}

const mockPermissions: Permission[] = [
  { id: 'dashboard_view', name: 'View Dashboard', description: 'Access to main dashboard', category: 'Dashboard' },
  { id: 'products_view', name: 'View Products', description: 'View product listings', category: 'Products' },
  { id: 'products_create', name: 'Create Products', description: 'Add new products', category: 'Products' },
  { id: 'products_edit', name: 'Edit Products', description: 'Modify existing products', category: 'Products' },
  { id: 'products_delete', name: 'Delete Products', description: 'Remove products', category: 'Products' },
  { id: 'orders_view', name: 'View Orders', description: 'Access order listings', category: 'Orders' },
  { id: 'orders_edit', name: 'Edit Orders', description: 'Modify order status', category: 'Orders' },
  { id: 'customers_view', name: 'View Customers', description: 'Access customer data', category: 'Customers' },
  { id: 'customers_edit', name: 'Edit Customers', description: 'Modify customer information', category: 'Customers' },
  { id: 'analytics_view', name: 'View Analytics', description: 'Access analytics dashboard', category: 'Analytics' },
  { id: 'settings_view', name: 'View Settings', description: 'Access system settings', category: 'Settings' },
  { id: 'settings_edit', name: 'Edit Settings', description: 'Modify system configuration', category: 'Settings' },
  { id: 'users_manage', name: 'Manage Users', description: 'Manage admin users and roles', category: 'Security' },
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Super Admin',
    description: 'Full access to all system features',
    permissions: mockPermissions.map(p => p.id),
    userCount: 2,
    createdAt: '2024-01-15',
    updatedAt: '2024-02-20'
  },
  {
    id: '2',
    name: 'Store Manager',
    description: 'Manage products, orders, and basic analytics',
    permissions: ['dashboard_view', 'products_view', 'products_create', 'products_edit', 'orders_view', 'orders_edit', 'analytics_view'],
    userCount: 5,
    createdAt: '2024-01-20',
    updatedAt: '2024-02-18'
  },
  {
    id: '3',
    name: 'Customer Support',
    description: 'Handle customer inquiries and basic order management',
    permissions: ['dashboard_view', 'orders_view', 'orders_edit', 'customers_view', 'customers_edit'],
    userCount: 8,
    createdAt: '2024-01-25',
    updatedAt: '2024-02-15'
  },
  {
    id: '4',
    name: 'Analyst',
    description: 'View-only access to analytics and reports',
    permissions: ['dashboard_view', 'products_view', 'orders_view', 'customers_view', 'analytics_view'],
    userCount: 3,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-10'
  }
];

const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    userId: '1',
    userName: 'John Admin',
    action: 'LOGIN',
    resource: 'System',
    details: 'User logged in successfully',
    timestamp: '2024-02-20 14:30:00',
    ipAddress: '192.168.1.100',
    userAgent: 'Chrome 121.0.0.0',
    status: 'success'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Sarah Manager',
    action: 'CREATE',
    resource: 'Product',
    details: 'Created new product: Lakme Perfect Radiance Foundation',
    timestamp: '2024-02-20 13:45:00',
    ipAddress: '192.168.1.105',
    userAgent: 'Firefox 122.0',
    status: 'success'
  },
  {
    id: '3',
    userId: '3',
    userName: 'Mike Support',
    action: 'UPDATE',
    resource: 'Order',
    details: 'Updated order status to shipped for #ORD001',
    timestamp: '2024-02-20 12:20:00',
    ipAddress: '192.168.1.110',
    userAgent: 'Safari 17.2',
    status: 'success'
  },
  {
    id: '4',
    userId: '4',
    userName: 'Anonymous',
    action: 'LOGIN_FAILED',
    resource: 'System',
    details: 'Failed login attempt with invalid credentials',
    timestamp: '2024-02-20 11:15:00',
    ipAddress: '203.45.67.89',
    userAgent: 'Unknown',
    status: 'failure'
  }
];

export default function RoleManager() {
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'logs'>('roles');
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(mockActivityLogs);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'success' | 'failure' | 'warning'>('all');

  const permissionsByCategory = mockPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = logFilter === 'all' || log.status === logFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failure': return 'text-red-600 bg-red-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircleIcon;
      case 'failure': return XCircleIcon;
      case 'warning': return ExclamationTriangleIcon;
      default: return ClockIcon;
    }
  };

  const RoleModal = ({ role, onClose, onSave }: { role?: Role | null; onClose: () => void; onSave: (role: Partial<Role>) => void; }) => {
    const [formData, setFormData] = useState({
      name: role?.name || '',
      description: role?.description || '',
      permissions: role?.permissions || []
    });

    const handlePermissionToggle = (permissionId: string) => {
      setFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permissionId)
          ? prev.permissions.filter(p => p !== permissionId)
          : [...prev.permissions, permissionId]
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {role ? 'Edit Role' : 'Create New Role'}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-4">Permissions</h4>
              <div className="space-y-4">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category} className="border border-gray-200 rounded-md p-4">
                    <h5 className="font-medium text-gray-700 mb-3">{category}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissions.map((permission) => (
                        <label key={permission.id} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                            <p className="text-xs text-gray-500">{permission.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(formData)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              {role ? 'Update Role' : 'Create Role'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Security Management</h2>
          <p className="text-sm text-gray-600 mt-1">Manage roles, permissions, and monitor user activity</p>
        </div>

        {activeTab === 'roles' && (
          <button
            onClick={() => {
              setSelectedRole(null);
              setShowRoleModal(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Role
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'roles', label: 'Roles & Permissions', icon: ShieldCheckIcon },
            { key: 'users', label: 'User Management', icon: UserGroupIcon },
            { key: 'logs', label: 'Activity Logs', icon: ClockIcon }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {roles.map((role) => (
              <div key={role.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-md">
                      <KeyIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{role.name}</h3>
                      <p className="text-xs text-gray-500">{role.userCount} users</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setSelectedRole(role);
                        setShowRoleModal(true);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Permissions</span>
                    <span className="font-medium">{role.permissions.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div 
                      className="bg-blue-500 h-1 rounded-full" 
                      style={{ width: `${(role.permissions.length / mockPermissions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-gray-400">
                  Updated {new Date(role.updatedAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
                <option value="warning">Warning</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              {filteredLogs.length} of {activityLogs.length} logs
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => {
                  const StatusIcon = getStatusIcon(log.status);
                  return (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                          <div className="text-xs text-gray-500">{log.ipAddress}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.resource}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{log.details}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.timestamp}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showRoleModal && (
        <RoleModal
          role={selectedRole}
          onClose={() => {
            setShowRoleModal(false);
            setSelectedRole(null);
          }}
          onSave={(roleData) => {
            // Handle save logic here
            console.log('Saving role:', roleData);
            setShowRoleModal(false);
            setSelectedRole(null);
          }}
        />
      )}
    </div>
  );
}
