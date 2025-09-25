'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ShoppingBagIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateJoined: Date;
  lastOrder: Date | null;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  addresses: {
    id: string;
    type: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
  }[];
  preferences: {
    newsletter: boolean;
    sms: boolean;
    marketing: boolean;
  };
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+91 9876543210',
    dateJoined: new Date('2024-01-15'),
    lastOrder: new Date('2024-02-20'),
    totalOrders: 8,
    totalSpent: 12450,
    status: 'active',
    addresses: [
      {
        id: '1',
        type: 'Home',
        street: '123 Beauty Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        isDefault: true
      }
    ],
    preferences: {
      newsletter: true,
      sms: true,
      marketing: true
    }
  },
  {
    id: '2',
    firstName: 'Emily',
    lastName: 'Chen',
    email: 'emily.chen@email.com',
    phone: '+91 9876543211',
    dateJoined: new Date('2023-11-20'),
    lastOrder: new Date('2024-02-19'),
    totalOrders: 15,
    totalSpent: 28750,
    status: 'active',
    addresses: [
      {
        id: '2',
        type: 'Home',
        street: '456 Skincare Ave',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        isDefault: true
      }
    ],
    preferences: {
      newsletter: true,
      sms: false,
      marketing: true
    }
  },
  {
    id: '3',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@email.com',
    phone: '+91 9876543212',
    dateJoined: new Date('2023-08-10'),
    lastOrder: new Date('2024-02-18'),
    totalOrders: 22,
    totalSpent: 45690,
    status: 'active',
    addresses: [
      {
        id: '3',
        type: 'Home',
        street: '789 Makeup Lane',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        isDefault: true
      }
    ],
    preferences: {
      newsletter: true,
      sms: true,
      marketing: false
    }
  },
  {
    id: '4',
    firstName: 'Jessica',
    lastName: 'Wilson',
    email: 'jessica.wilson@email.com',
    phone: '+91 9876543213',
    dateJoined: new Date('2024-01-05'),
    lastOrder: new Date('2024-02-17'),
    totalOrders: 4,
    totalSpent: 3250,
    status: 'active',
    addresses: [
      {
        id: '4',
        type: 'Home',
        street: '321 Beauty Plaza',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zipCode: '600001',
        isDefault: true
      }
    ],
    preferences: {
      newsletter: false,
      sms: false,
      marketing: false
    }
  },
  {
    id: '5',
    firstName: 'Ariana',
    lastName: 'Patel',
    email: 'ariana.patel@email.com',
    phone: '+91 9876543214',
    dateJoined: new Date('2023-06-25'),
    lastOrder: null,
    totalOrders: 2,
    totalSpent: 1299,
    status: 'inactive',
    addresses: [
      {
        id: '5',
        type: 'Home',
        street: '654 Fashion St',
        city: 'Pune',
        state: 'Maharashtra',
        zipCode: '411001',
        isDefault: true
      }
    ],
    preferences: {
      newsletter: true,
      sms: false,
      marketing: true
    }
  }
];

export default function CustomersPage() {
  const [customers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Filter customers based on search and filters
  const filteredCustomers = customers.filter(customer => {
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    const matchesStatus = !statusFilter || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerModal(true);
  };

  // Calculate stats
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const averageOrderValue = totalRevenue / customers.reduce((sum, customer) => sum + customer.totalOrders, 0);

  const getCustomerValue = (customer: Customer) => {
    if (customer.totalSpent > 30000) return { label: 'VIP', color: 'bg-pink-100 text-red-600' };
    if (customer.totalSpent > 15000) return { label: 'Premium', color: 'bg-orange-100 text-red-600' };
    if (customer.totalSpent > 5000) return { label: 'Regular', color: 'bg-cyan-100 text-red-600' };
    return { label: 'New', color: 'bg-lime-100 text-red-600' };
  };

  return (
    <AdminLayout title="Customers">
      <div className="space-y-6">
        {/* Header & Stats */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
              <p className="text-gray-600 mt-1">Manage your customer base and relationships</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 p-3 rounded-md">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Customers</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalCustomers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-green-500 p-3 rounded-md">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Customers</p>
                  <p className="text-2xl font-semibold text-gray-900">{activeCustomers}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-purple-500 p-3 rounded-md">
                  <ShoppingBagIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{totalRevenue.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-yellow-500 p-3 rounded-md">
                  <ShoppingBagIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Order Value</p>
                  <p className="text-2xl font-semibold text-gray-900">₹{Math.round(averageOrderValue).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>
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
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-pink-400 text-pink-600 focus:outline-none focus:placeholder-pink-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-pink-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-pink-600"
              >
                <option value="" className="text-pink-600">All Status</option>
                <option value="active" className="text-pink-600">Active</option>
                <option value="inactive" className="text-pink-600">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {filteredCustomers.length} Customers
              </h3>
              <div className="text-sm text-gray-500">
                {filteredCustomers.length} of {customers.length} customers shown
              </div>
            </div>
          </div>
          
          {filteredCustomers.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No customers found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Orders
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Spent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => {
                    const customerValue = getCustomerValue(customer);
                    return (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 bg-pink-100 rounded-full flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-pink-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {customer.firstName} {customer.lastName}
                              </div>
                              <div className="flex items-center mt-1">
                                <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${customerValue.color}`}>
                                  {customerValue.label}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900 flex items-center">
                              <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-1" />
                              {customer.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <PhoneIcon className="h-4 w-4 text-gray-400 mr-1" />
                              {customer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="font-medium">{customer.totalOrders}</div>
                          <div className="text-xs text-gray-500">orders</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₹{customer.totalSpent.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            customer.status === 'active' 
                              ? 'bg-emerald-100 text-red-600' 
                              : 'bg-rose-100 text-red-600'
                          }`}>
                            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            {customer.lastOrder ? (
                              <>
                                <div>{customer.lastOrder.toLocaleDateString()}</div>
                                <div className="text-xs text-gray-400">
                                  {customer.lastOrder.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </>
                            ) : (
                              <span className="text-gray-400">No orders yet</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleViewCustomer(customer)}
                              className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                              title="View Complete Customer Profile & Purchase History"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => window.location.href = `mailto:${customer.email}`}
                              className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded"
                              title="Send Email"
                            >
                              <EnvelopeIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => window.location.href = `tel:${customer.phone}`}
                              className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-50 rounded"
                              title="Call Customer"
                            >
                              <PhoneIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Customer Profile: {selectedCustomer.firstName} {selectedCustomer.lastName}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Complete customer information and activity summary</p>
              </div>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Status & Value */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                    selectedCustomer.status === 'active' 
                      ? 'bg-emerald-100 text-red-600' 
                      : 'bg-rose-100 text-red-600'
                  }`}>
                    {selectedCustomer.status.charAt(0).toUpperCase() + selectedCustomer.status.slice(1)}
                  </span>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getCustomerValue(selectedCustomer).color}`}>
                    {getCustomerValue(selectedCustomer).label} Customer
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Customer since</p>
                  <p className="font-medium">{selectedCustomer.dateJoined.toLocaleDateString()}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">📞 Contact Information & Communication Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium">Email:</span>
                      </div>
                      <p className="text-gray-600">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <div className="flex items-center mb-2">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                        <span className="font-medium">Phone:</span>
                      </div>
                      <p className="text-gray-600">{selectedCustomer.phone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">📍 Delivery Addresses & Location Information</h3>
                <div className="space-y-3">
                  {selectedCustomer.addresses.map((address) => (
                    <div key={address.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{address.type}</span>
                        {address.isDefault && (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-start">
                        <MapPinIcon className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                        <p className="text-gray-600">
                          {address.street}<br />
                          {address.city}, {address.state} {address.zipCode}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Statistics */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">📊 Purchase History & Spending Analytics</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{selectedCustomer.totalOrders}</p>
                      <p className="text-sm text-gray-600">Total Orders</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</p>
                      <p className="text-sm text-gray-600">Total Spent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{Math.round(selectedCustomer.totalSpent / selectedCustomer.totalOrders || 0).toLocaleString('en-IN')}
                      </p>
                      <p className="text-sm text-gray-600">Avg. Order Value</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Last Order:</span>
                      <span className="text-sm text-gray-600">
                        {selectedCustomer.lastOrder ? selectedCustomer.lastOrder.toLocaleDateString() : 'No orders yet'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Communication Preferences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">🔔 Marketing & Communication Preferences</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Newsletter:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedCustomer.preferences.newsletter 
                          ? 'bg-teal-100 text-red-600' 
                          : 'bg-amber-100 text-red-600'
                      }`}>
                        {selectedCustomer.preferences.newsletter ? 'Subscribed' : 'Not Subscribed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">SMS Notifications:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedCustomer.preferences.sms 
                          ? 'bg-indigo-100 text-red-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {selectedCustomer.preferences.sms ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Marketing Emails:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        selectedCustomer.preferences.marketing 
                          ? 'bg-violet-100 text-red-600' 
                          : 'bg-slate-100 text-red-600'
                      }`}>
                        {selectedCustomer.preferences.marketing ? 'Allowed' : 'Blocked'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end p-6 border-t">
              <button
                onClick={() => setShowCustomerModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
