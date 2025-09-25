'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  CheckCircleIcon,
  TruckIcon,
  ClockIcon,
  XCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  orderDate: Date;
  updatedAt: Date;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD001',
    customer: {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+91 9876543210'
    },
    items: [
      {
        id: '1',
        name: 'MAC Lipstick - Ruby Woo',
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
        price: 1950,
        quantity: 1
      }
    ],
    total: 1950,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '123 Beauty Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    orderDate: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-22')
  },
  {
    id: '2',
    orderNumber: 'ORD002',
    customer: {
      name: 'Emily Chen',
      email: 'emily.chen@email.com',
      phone: '+91 9876543211'
    },
    items: [
      {
        id: '2',
        name: 'The Ordinary Niacinamide 10% + Zinc 1%',
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
        price: 700,
        quantity: 2
      }
    ],
    total: 1400,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '456 Skincare Ave',
      city: 'Delhi',
      state: 'Delhi',
      zipCode: '110001',
      country: 'India'
    },
    orderDate: new Date('2024-02-19'),
    updatedAt: new Date('2024-02-21')
  },
  {
    id: '3',
    orderNumber: 'ORD003',
    customer: {
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 9876543212'
    },
    items: [
      {
        id: '3',
        name: 'Urban Decay Naked3 Eyeshadow Palette',
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
        price: 3200,
        quantity: 1
      }
    ],
    total: 3200,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '789 Makeup Lane',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India'
    },
    orderDate: new Date('2024-02-18'),
    updatedAt: new Date('2024-02-20')
  },
  {
    id: '4',
    orderNumber: 'ORD004',
    customer: {
      name: 'Jessica Wilson',
      email: 'jessica.wilson@email.com',
      phone: '+91 9876543213'
    },
    items: [
      {
        id: '4',
        name: 'Lakme Perfect Radiance Facewash',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        price: 175,
        quantity: 3
      }
    ],
    total: 525,
    status: 'confirmed',
    paymentStatus: 'paid',
    shippingAddress: {
      street: '321 Beauty Plaza',
      city: 'Chennai',
      state: 'Tamil Nadu',
      zipCode: '600001',
      country: 'India'
    },
    orderDate: new Date('2024-02-17'),
    updatedAt: new Date('2024-02-19')
  },
  {
    id: '5',
    orderNumber: 'ORD005',
    customer: {
      name: 'Ariana Patel',
      email: 'ariana.patel@email.com',
      phone: '+91 9876543214'
    },
    items: [
      {
        id: '5',
        name: 'Maybelline Fit Me Foundation',
        image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
        price: 599,
        quantity: 1
      }
    ],
    total: 599,
    status: 'cancelled',
    paymentStatus: 'refunded',
    shippingAddress: {
      street: '654 Fashion St',
      city: 'Pune',
      state: 'Maharashtra',
      zipCode: '411001',
      country: 'India'
    },
    orderDate: new Date('2024-02-16'),
    updatedAt: new Date('2024-02-18')
  }
];

export default function OrdersPage() {
  const [orders] = useState<Order[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Filter orders based on search and filters
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesPayment = !paymentFilter || order.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
      processing: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: TruckIcon },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircleIcon }
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentBadge = (paymentStatus: Order['paymentStatus']) => {
    const statusConfig = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[paymentStatus]}`}>
        {paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1)}
      </span>
    );
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    // In a real app, this would make an API call
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
    alert(`Order ${orderId} status updated to: ${newStatus}`);
  };

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'processing' || o.status === 'confirmed').length;

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">
        {/* Header & Stats */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600 mt-1">Manage customer orders and fulfillment</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-blue-500 p-3 rounded-md">
                  <CheckCircleIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalOrders}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="bg-green-500 p-3 rounded-md">
                  <TruckIcon className="h-6 w-6 text-white" />
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
                  <ClockIcon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">{pendingOrders}</p>
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
                placeholder="Search orders, customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-pink-400 focus:outline-none focus:placeholder-pink-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-pink-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-pink-600 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="" className="text-pink-600">All Status</option>
                <option value="confirmed" className="text-pink-600">Confirmed</option>
                <option value="processing" className="text-pink-600">Processing</option>
                <option value="shipped" className="text-pink-600">Shipped</option>
                <option value="delivered" className="text-pink-600">Delivered</option>
                <option value="cancelled" className="text-pink-600">Cancelled</option>
              </select>
            </div>

            {/* Payment Filter */}
            <div className="flex items-center space-x-2">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-pink-600 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="" className="text-pink-600">All Payments</option>
                <option value="pending" className="text-pink-600">Pending</option>
                <option value="paid" className="text-pink-600">Paid</option>
                <option value="failed" className="text-pink-600">Failed</option>
                <option value="refunded" className="text-pink-600">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {filteredOrders.length} Orders
              </h3>
              <div className="text-sm text-gray-500">
                {filteredOrders.length} of {orders.length} orders shown
              </div>
            </div>
          </div>
          
          {filteredOrders.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No orders found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">#{order.orderNumber}</div>
                          <div className="text-sm text-gray-500">ID: {order.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.customer.name}</div>
                          <div className="text-sm text-gray-500">{order.customer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-lg object-cover" 
                              src={order.items[0].image} 
                              alt={order.items[0].name}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {order.items[0].name.substring(0, 30)}...
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items.length > 1 ? `+${order.items.length - 1} more` : `Qty: ${order.items[0].quantity}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{order.total.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentBadge(order.paymentStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>
                          <div>{order.orderDate.toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">
                            {order.orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleViewOrder(order)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="View Order"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {/* Handle edit */}}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Update Order"
                          >
                            <PencilIcon className="h-4 w-4" />
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

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Order #{selectedOrder.orderNumber}</h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Status & Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div>Status: {getStatusBadge(selectedOrder.status)}</div>
                  <div>Payment: {getPaymentBadge(selectedOrder.paymentStatus)}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value as Order['status'])}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium">{selectedOrder.customer.name}</p>
                      <p className="text-gray-600">{selectedOrder.customer.email}</p>
                      <p className="text-gray-600">{selectedOrder.customer.phone}</p>
                    </div>
                    <div>
                      <p className="font-medium">Shipping Address:</p>
                      <p className="text-gray-600">
                        {selectedOrder.shippingAddress.street}<br />
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zipCode}<br />
                        {selectedOrder.shippingAddress.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Order Items</h3>
                <div className="border border-gray-200 rounded-lg">
                  {selectedOrder.items.map((item, index) => (
                    <div key={item.id} className={`p-4 flex items-center ${index !== selectedOrder.items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                      <div className="ml-4 flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        <p className="text-gray-600 text-sm">₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-gray-50 rounded-b-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total</span>
                      <span className="font-bold text-lg">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Order Timeline</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Order Placed</span>
                      <span className="text-gray-600">{selectedOrder.orderDate.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Updated</span>
                      <span className="text-gray-600">{selectedOrder.updatedAt.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end p-6 border-t">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
