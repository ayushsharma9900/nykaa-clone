'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { usePagination } from '@/hooks/usePagination';
import Pagination from '@/components/ui/Pagination';
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

// API utility functions
const fetchOrders = async () => {
  try {
    const response = await fetch('/api/orders');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch orders');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

const updateOrder = async (orderId: string, updateData: any) => {
  try {
    const response = await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update order');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update order status');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

interface Order {
  _id: string;
  invoiceNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  customerName: string;
  items: {
    _id: string;
    product: {
      _id: string;
      name: string;
      images?: string[];
    };
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'credit';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  orderDate: string;
  createdAt: string;
  updatedAt: string;
}

// Removed mock orders - will load from backend

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination for orders
  const pagination = usePagination({
    initialPage: parseInt(searchParams?.get('page') || '1'),
    initialPageSize: parseInt(searchParams?.get('limit') || '10'),
    pageSizeOptions: [5, 10, 25, 50]
  });
  const [editFormData, setEditFormData] = useState({
    status: '',
    paymentStatus: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  // Load orders on component mount and when pagination changes
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await fetchOrders();
      if (response.success && response.data) {
        setOrders(response.data);
        pagination.updateTotalItems(response.data.length);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders based on search and filters
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order.customer?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !statusFilter || order.status === statusFilter;
      const matchesPayment = !paymentFilter || order.paymentStatus === paymentFilter;
      
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);
  
  // Update pagination when filtered orders change
  pagination.updateTotalItems(filteredOrders.length);
  
  // Get paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (pagination.paginationState.currentPage - 1) * pagination.paginationState.pageSize;
    const endIndex = startIndex + pagination.paginationState.pageSize;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, pagination.paginationState.currentPage, pagination.paginationState.pageSize]);

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { color: 'bg-gray-100 text-gray-800', icon: ClockIcon },
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

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setError(null); // Clear any previous errors
    setEditFormData({
      status: order.status,
      paymentStatus: order.paymentStatus,
      customerName: order.customerName,
      customerEmail: order.customer?.email || '',
      customerPhone: order.customer?.phone || '',
      street: order.shippingAddress?.street || '',
      city: order.shippingAddress?.city || '',
      state: order.shippingAddress?.state || '',
      zipCode: order.shippingAddress?.zipCode || '',
      country: order.shippingAddress?.country || ''
    });
    setShowEditModal(true);
  };

  const handleSaveOrder = async () => {
    if (!editingOrder) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updateData = {
        status: editFormData.status,
        paymentStatus: editFormData.paymentStatus,
        customerName: editFormData.customerName,
        customerEmail: editFormData.customerEmail,
        customerPhone: editFormData.customerPhone,
        shippingAddress: {
          street: editFormData.street,
          city: editFormData.city,
          state: editFormData.state,
          zipCode: editFormData.zipCode,
          country: editFormData.country
        }
      };
      
      const result = await updateOrder(editingOrder._id, updateData);
      
      // Update the local orders array if using mock data
      // In a real app, you'd refetch the orders or update the local state
      console.log('Order updated successfully:', result);
      
      setShowEditModal(false);
      setEditingOrder(null);
      
      // Show success message
      alert(`Order ${editingOrder.invoiceNumber} updated successfully!`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order';
      setError(errorMessage);
      console.error('Error saving order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        // Update local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId ? { ...order, status: newStatus } : order
          )
        );
        alert(`Order status updated to: ${newStatus}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      alert(`Error: ${errorMessage}`);
    }
  };

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing').length;

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">
        {/* Header & Stats */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="admin-text text-2xl font-bold">Orders</h1>
              <p className="admin-text-secondary mt-1">Manage customer orders and fulfillment</p>
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
                className="admin-input admin-field-bg block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 placeholder-pink-400 focus:outline-none focus:placeholder-pink-300 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-pink-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-input admin-field-bg border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="" className="text-pink-600">All Status</option>
                <option value="pending" className="text-pink-600">Pending</option>
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
                className="admin-input admin-field-bg border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-pink-500 focus:border-pink-500"
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
                Showing {paginatedOrders.length} of {filteredOrders.length} filtered orders ({orders.length} total)
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
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-pink-600 border-t-transparent rounded-full animate-spin mr-3"></div>
                          Loading orders...
                        </div>
                      </td>
                    </tr>
                  ) : paginatedOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">#{order.invoiceNumber}</div>
                          <div className="text-sm text-gray-500">ID: {order._id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                          <div className="text-sm text-gray-500">{order.customer?.email || 'No email'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-lg object-cover" 
                              src={(order.items[0]?.product?.images?.[0]) || 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'} 
                              alt={order.items[0]?.productName || 'Product'}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {(order.items[0]?.productName || 'Unknown Product').substring(0, 30)}...
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.items.length > 1 ? `+${order.items.length - 1} more` : `Qty: ${order.items[0]?.quantity || 0}`}
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
                          <div>{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(order.orderDate || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                            onClick={() => handleEditOrder(order)}
                            className="text-yellow-600 hover:text-yellow-900 p-1"
                            title="Edit Order"
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
          
          {/* Pagination - only show if there are multiple pages */}
          {pagination.paginationState.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Pagination
                currentPage={pagination.paginationState.currentPage}
                totalPages={pagination.paginationState.totalPages}
                totalItems={pagination.paginationState.totalItems}
                itemsPerPage={pagination.paginationState.pageSize}
                onPageChange={pagination.goToPage}
                onPageSizeChange={pagination.changePageSize}
                showPageSize={true}
                pageSizeOptions={[5, 10, 25, 50]}
              />
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="admin-modal bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" data-admin-modal>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="admin-modal-text text-xl font-semibold">Order #{selectedOrder.invoiceNumber}</h2>
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
                    onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value as Order['status'])}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="pending">Pending</option>
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
                <h3 className="admin-modal-text text-lg font-medium mb-3">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="admin-modal-text font-medium">{selectedOrder.customerName}</p>
                      <p className="admin-modal-text-secondary">{selectedOrder.customer?.email || 'No email'}</p>
                      <p className="admin-modal-text-secondary">{selectedOrder.customer?.phone || 'No phone'}</p>
                    </div>
                    <div>
                      <p className="admin-modal-text font-medium">Shipping Address:</p>
                      <p className="admin-modal-text-secondary">
                        {selectedOrder.shippingAddress?.street || 'N/A'}<br />
                        {selectedOrder.shippingAddress?.city || 'N/A'}, {selectedOrder.shippingAddress?.state || 'N/A'} {selectedOrder.shippingAddress?.zipCode || 'N/A'}<br />
                        {selectedOrder.shippingAddress?.country || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="admin-modal-text text-lg font-medium mb-3">Order Items</h3>
                <div className="border border-gray-200 rounded-lg">
                  {selectedOrder.items.map((item, index) => (
                    <div key={item._id} className={`p-4 flex items-center ${index !== selectedOrder.items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <img 
                        src={(item.product?.images?.[0]) || 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'} 
                        alt={item.productName} 
                        className="h-16 w-16 rounded-lg object-cover" 
                      />
                      <div className="ml-4 flex-1">
                        <p className="admin-modal-text font-medium">{item.productName}</p>
                        <p className="admin-modal-text-secondary">Quantity: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="admin-modal-text font-medium">₹{item.total.toLocaleString('en-IN')}</p>
                        <p className="admin-modal-text-muted text-sm">₹{item.price} each</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 bg-gray-50 rounded-b-lg">
                    <div className="flex justify-between items-center">
                      <span className="admin-modal-text font-medium">Total</span>
                      <span className="admin-modal-text font-bold text-lg">₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Timeline */}
              <div>
                <h3 className="admin-modal-text text-lg font-medium mb-3">Order Timeline</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="admin-modal-text">Order Placed</span>
                      <span className="admin-modal-text-secondary">{selectedOrder.orderDate.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="admin-modal-text">Last Updated</span>
                      <span className="admin-modal-text-secondary">{selectedOrder.updatedAt.toLocaleString()}</span>
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

      {/* Edit Order Modal */}
      {showEditModal && editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="admin-modal bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto" data-admin-modal>
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="admin-modal-text text-xl font-semibold">Edit Order #{editingOrder.orderNumber}</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        Error updating order
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Order Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="admin-text block text-sm font-medium mb-2">
                    Order Status
                  </label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="admin-text block text-sm font-medium mb-2">
                    Payment Status
                  </label>
                  <select
                    value={editFormData.paymentStatus}
                    onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                    className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <h3 className="admin-text text-lg font-medium mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="admin-text block text-sm font-medium mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editFormData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="admin-text block text-sm font-medium mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editFormData.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div>
                    <label className="admin-text block text-sm font-medium mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editFormData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="admin-text text-lg font-medium mb-4">Shipping Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="admin-text block text-sm font-medium mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={editFormData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="admin-text block text-sm font-medium mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        value={editFormData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="admin-text block text-sm font-medium mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        value={editFormData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="admin-text block text-sm font-medium mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={editFormData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                    <div>
                      <label className="admin-text block text-sm font-medium mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={editFormData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        className="admin-input admin-field-bg w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items (Read-only) */}
              <div>
                <h3 className="admin-text text-lg font-medium mb-4">Order Items</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {editingOrder.items.map((item, index) => (
                    <div key={item.id} className={`flex items-center py-3 ${index !== editingOrder.items.length - 1 ? 'border-b border-gray-200' : ''}`}>
                      <img src={item.image} alt={item.name} className="h-12 w-12 rounded-lg object-cover" />
                      <div className="ml-4 flex-1">
                        <p className="admin-text font-medium text-sm">{item.name}</p>
                        <p className="admin-text-secondary text-sm">Qty: {item.quantity} × ₹{item.price} = ₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="admin-text font-medium">Total:</span>
                    <span className="admin-text font-bold text-lg">₹{editingOrder.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 p-6 border-t">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={isLoading}
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
