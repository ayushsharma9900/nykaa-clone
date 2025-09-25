const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required']
  },
  category: {
    type: String,
    required: [true, 'Product category is required']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  costPrice: {
    type: Number,
    required: [true, 'Product cost price is required'],
    min: 0
  },
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    min: 0,
    default: 0
  },
  sku: {
    type: String,
    required: [true, 'Product SKU is required'],
    unique: true
  },
  images: [{
    url: String,
    alt: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  weight: {
    type: Number,
    default: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  totalSold: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ totalSold: -1 });

// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  return ((this.price - this.costPrice) / this.costPrice * 100).toFixed(2);
});

// Virtual for profit per unit
productSchema.virtual('profitPerUnit').get(function() {
  return this.price - this.costPrice;
});

module.exports = mongoose.model('Product', productSchema);
