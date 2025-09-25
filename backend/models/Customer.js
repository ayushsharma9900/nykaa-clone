const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Customer email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  averageOrderValue: {
    type: Number,
    default: 0
  },
  lastOrderDate: {
    type: Date
  },
  customerSince: {
    type: Date,
    default: Date.now
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  preferredPaymentMethod: {
    type: String,
    enum: ['cash', 'card', 'credit'],
    default: 'card'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
customerSchema.index({ email: 1 });
customerSchema.index({ totalSpent: -1 });
customerSchema.index({ totalOrders: -1 });
customerSchema.index({ lastOrderDate: -1 });

// Virtual for customer lifetime value
customerSchema.virtual('lifetimeValue').get(function() {
  return this.totalSpent;
});

// Virtual for customer status based on spending
customerSchema.virtual('customerTier').get(function() {
  if (this.totalSpent >= 5000) return 'Premium';
  if (this.totalSpent >= 1000) return 'Gold';
  if (this.totalSpent >= 500) return 'Silver';
  return 'Bronze';
});

module.exports = mongoose.model('Customer', customerSchema);
