'use client';

import { useState } from 'react';
import { 
  UserIcon,
  MapPinIcon,
  ShoppingBagIcon,
  HeartIcon,
  CogIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Mock user data
const userData = {
  id: '1',
  firstName: 'Sarah',
  lastName: 'Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+91 9876543210',
  joinDate: 'January 2024',
  addresses: [
    {
      id: '1',
      type: 'Home',
      street: '123 Beauty Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      isDefault: true
    },
    {
      id: '2',
      type: 'Work',
      street: '456 Office Complex',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400002',
      isDefault: false
    }
  ]
};

const orderHistory = [
  {
    id: '#ORD001',
    date: '2024-02-15',
    status: 'Delivered',
    total: 2125,
    items: 3,
    image: 'https://images.unsplash.com/photo-1556229010-aa1e4ece3c71?w=400'
  },
  {
    id: '#ORD002',
    date: '2024-02-10',
    status: 'Shipped',
    total: 1950,
    items: 1,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'
  },
  {
    id: '#ORD003',
    date: '2024-02-05',
    status: 'Processing',
    total: 3200,
    items: 2,
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'
  }
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(userData);

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'orders', name: 'My Orders', icon: ShoppingBagIcon },
    { id: 'addresses', name: 'Addresses', icon: MapPinIcon },
    { id: 'wishlist', name: 'Wishlist', icon: HeartIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    // TODO: Save profile changes to backend
    alert('Profile updated successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="h-10 w-10 text-pink-600" />
                </div>
                <h3 className="font-semibold text-gray-900">
                  {profileData.firstName} {profileData.lastName}
                </h3>
                <p className="text-sm text-gray-500">{profileData.email}</p>
                <p className="text-xs text-gray-400 mt-1">Member since {profileData.joinDate}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-pink-50 text-pink-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5" />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    <button
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span>{isEditing ? 'Save Changes' : 'Edit Profile'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        disabled={!isEditing}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <div className="mt-6 flex space-x-4">
                      <button
                        onClick={handleSaveProfile}
                        className="bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700 transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h2>
                  
                  <div className="space-y-4">
                    {orderHistory.map((order) => (
                      <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-4">
                            <img
                              src={order.image}
                              alt="Order"
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{order.id}</p>
                              <p className="text-sm text-gray-500">Placed on {order.date}</p>
                              <p className="text-sm text-gray-500">{order.items} items</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-4">
                          <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                            View Details
                          </button>
                          <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                            Track Order
                          </button>
                          {order.status === 'Delivered' && (
                            <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                              Reorder
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Saved Addresses</h2>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors">
                      <PlusIcon className="h-4 w-4" />
                      <span>Add New Address</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userData.addresses.map((address) => (
                      <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-gray-900">{address.type}</span>
                          {address.isDefault && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>{address.street}</p>
                          <p>{address.city}, {address.state} {address.zipCode}</p>
                        </div>
                        <div className="mt-4 flex space-x-3">
                          <button className="text-pink-600 hover:text-pink-700 text-sm font-medium">
                            Edit
                          </button>
                          <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Other tabs */}
              {(activeTab === 'wishlist' || activeTab === 'settings') && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {activeTab === 'wishlist' ? 'Your wishlist items will appear here.' : 'Account settings will be available here.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}