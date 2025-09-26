require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Sample Users (Admin, Manager, Staff)
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@dashtar.com',
    password: 'password123',
    role: 'admin'
  },
  {
    name: 'Manager User',
    email: 'manager@dashtar.com', 
    password: 'password123',
    role: 'manager'
  },
  {
    name: 'Staff User',
    email: 'staff@dashtar.com',
    password: 'password123',
    role: 'staff'
  }
];

// Sample Customers
const sampleCustomers = [
  {
    name: 'ahmed yassine',
    email: 'ahmed.yassine@email.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    gender: 'male',
    preferredPaymentMethod: 'cash',
    totalOrders: 3,
    totalSpent: 1023.43,
    averageOrderValue: 341.14,
    lastOrderDate: new Date('2025-09-23'),
    loyaltyPoints: 120
  },
  {
    name: 'Sierra Brooks',
    email: 'sierra.brooks@email.com',
    phone: '+1234567891',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles', 
      state: 'CA',
      country: 'USA',
      zipCode: '90001'
    },
    gender: 'female',
    preferredPaymentMethod: 'cash',
    totalOrders: 4,
    totalSpent: 937.16,
    averageOrderValue: 234.29,
    lastOrderDate: new Date('2025-09-23'),
    loyaltyPoints: 95
  },
  {
    name: 'Ibukunoluwa Adeyoju',
    email: 'ibukun.adeyoju@email.com',
    phone: '+1234567892',
    address: {
      street: '789 Pine St',
      city: 'Chicago',
      state: 'IL',
      country: 'USA',
      zipCode: '60601'
    },
    gender: 'male',
    preferredPaymentMethod: 'card',
    totalOrders: 1,
    totalSpent: 77.46,
    averageOrderValue: 77.46,
    lastOrderDate: new Date('2025-09-22'),
    loyaltyPoints: 8
  },
  {
    name: '00 000',
    email: 'customer@email.com',
    phone: '+1234567893',
    preferredPaymentMethod: 'cash',
    totalOrders: 2,
    totalSpent: 1017.19,
    averageOrderValue: 508.60,
    lastOrderDate: new Date('2025-09-22'),
    loyaltyPoints: 102
  },
  {
    name: 'jsijl njknmas',
    email: 'jsijl.njknmas@email.com',
    phone: '+1234567894',
    preferredPaymentMethod: 'cash',
    totalOrders: 1,
    totalSpent: 1129.80,
    averageOrderValue: 1129.80,
    lastOrderDate: new Date('2025-09-22'),
    loyaltyPoints: 113
  }
];

// Enhanced Beauty Categories
const sampleCategories = [
  {
    name: 'Skincare',
    slug: 'skincare',
    description: 'Complete range of facial and body skincare products including cleansers, moisturizers, serums, and treatments',
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Makeup',
    slug: 'makeup',
    description: 'Professional makeup products including foundations, lipsticks, eyeshadows, and beauty tools',
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Hair Care',
    slug: 'hair-care',
    description: 'Complete hair care solutions including shampoos, conditioners, styling products, and treatments',
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Fragrance',
    slug: 'fragrance',
    description: 'Premium fragrances including perfumes, eau de toilettes, and body sprays for men and women',
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Essential personal care products including bath & body, oral care, and hygiene products',
    isActive: true,
    sortOrder: 5
  },
  {
    name: 'Men\'s Grooming',
    slug: 'mens-grooming',
    description: 'Specialized grooming products for men including beard care, shaving essentials, and skincare',
    isActive: true,
    sortOrder: 6
  },
  {
    name: 'Baby Care',
    slug: 'baby-care',
    description: 'Gentle and safe products for babies including skincare, bath products, and essentials',
    isActive: true,
    sortOrder: 7
  },
  {
    name: 'Wellness',
    slug: 'wellness',
    description: 'Health and wellness products including vitamins, supplements, and health essentials',
    isActive: true,
    sortOrder: 8
  }
];

// Comprehensive Beauty Products
const sampleProducts = [
  // Skincare Products
  {
    name: 'Lakme Absolute Perfect Radiance Skin Lightening Facewash',
    description: 'A gentle facewash that brightens and lightens skin tone with regular use.',
    category: 'Skincare',
    price: 175,
    costPrice: 145,
    stock: 50,
    sku: 'LAK001',
    totalSold: 89,
    averageRating: 4.2,
    reviewCount: 128,
    tags: ['face wash', 'brightening', 'skincare'],
    images: [{ url: '/images/lakme-facewash.jpg', alt: 'Lakme Facewash' }]
  },
  {
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    description: 'A high-strength vitamin and mineral blemish formula.',
    category: 'Skincare',
    price: 700,
    costPrice: 480,
    stock: 30,
    sku: 'ORD001',
    totalSold: 67,
    averageRating: 4.7,
    reviewCount: 189,
    tags: ['serum', 'niacinamide', 'acne treatment'],
    images: [{ url: '/images/ordinary-niacinamide.jpg', alt: 'The Ordinary Niacinamide' }]
  },
  {
    name: 'Neutrogena Ultra Gentle Daily Cleanser',
    description: 'Gentle daily cleanser suitable for sensitive skin.',
    category: 'Skincare',
    price: 395,
    costPrice: 275,
    stock: 40,
    sku: 'NEU001',
    totalSold: 43,
    averageRating: 4.3,
    reviewCount: 167,
    tags: ['cleanser', 'gentle', 'sensitive skin'],
    images: [{ url: '/images/neutrogena-cleanser.jpg', alt: 'Neutrogena Cleanser' }]
  },
  {
    name: 'Cetaphil Daily Facial Cleanser',
    description: 'Gentle cleanser for normal to oily skin.',
    category: 'Skincare',
    price: 550,
    costPrice: 385,
    stock: 60,
    sku: 'CET001',
    totalSold: 31,
    averageRating: 4.4,
    reviewCount: 198,
    tags: ['cleanser', 'daily', 'oily skin'],
    images: [{ url: '/images/cetaphil-cleanser.jpg', alt: 'Cetaphil Cleanser' }]
  },
  {
    name: 'La Roche-Posay Anthelios Sunscreen SPF 50',
    description: 'Broad spectrum protection with antioxidants.',
    category: 'Skincare',
    price: 1250,
    costPrice: 875,
    stock: 45,
    sku: 'LRP001',
    totalSold: 112,
    averageRating: 4.7,
    reviewCount: 234,
    tags: ['sunscreen', 'spf 50', 'protection'],
    images: [{ url: '/images/laroche-sunscreen.jpg', alt: 'La Roche Posay Sunscreen' }]
  },
  
  // Makeup Products
  {
    name: 'Maybelline New York Fit Me Matte Foundation',
    description: 'Full coverage matte foundation that lasts up to 12 hours.',
    category: 'Makeup',
    price: 599,
    costPrice: 419,
    stock: 75,
    sku: 'MAY001',
    totalSold: 58,
    averageRating: 4.5,
    reviewCount: 256,
    tags: ['foundation', 'matte', 'full coverage'],
    images: [{ url: '/images/maybelline-foundation.jpg', alt: 'Maybelline Foundation' }]
  },
  {
    name: 'MAC Lipstick - Ruby Woo',
    description: 'Iconic matte red lipstick with intense color payoff.',
    category: 'Makeup',
    price: 1950,
    costPrice: 1365,
    stock: 25,
    sku: 'MAC001',
    totalSold: 43,
    averageRating: 4.8,
    reviewCount: 342,
    tags: ['lipstick', 'matte', 'red'],
    images: [{ url: '/images/mac-ruby-woo.jpg', alt: 'MAC Ruby Woo Lipstick' }]
  },
  {
    name: 'Urban Decay Naked3 Eyeshadow Palette',
    description: '12 rose-hued neutral eyeshadows in matte and shimmer finishes.',
    category: 'Makeup',
    price: 3200,
    costPrice: 2240,
    stock: 15,
    sku: 'URB001',
    totalSold: 31,
    averageRating: 4.9,
    reviewCount: 289,
    tags: ['eyeshadow', 'palette', 'neutral']
  },
  {
    name: 'Rare Beauty Liquid Blush',
    description: 'Weightless liquid blush for a natural flush.',
    category: 'Makeup',
    price: 1800,
    costPrice: 1260,
    stock: 35,
    sku: 'RAR001',
    totalSold: 112,
    averageRating: 4.6,
    reviewCount: 145,
    tags: ['blush', 'liquid', 'natural']
  },
  {
    name: 'Too Faced Better Than Sex Mascara',
    description: 'Volumizing mascara for dramatic lashes.',
    category: 'Makeup',
    price: 2100,
    costPrice: 1470,
    stock: 47,
    sku: 'TOO001',
    totalSold: 58,
    averageRating: 4.6,
    reviewCount: 324,
    tags: ['mascara', 'volumizing', 'dramatic']
  },
  
  // Hair Care Products
  {
    name: 'Olaplex No. 3 Hair Perfector',
    description: 'At-home treatment to repair damaged hair.',
    category: 'Hair Care',
    price: 2800,
    costPrice: 1960,
    stock: 22,
    sku: 'OLA001',
    totalSold: 43,
    averageRating: 4.9,
    reviewCount: 456,
    tags: ['hair treatment', 'repair', 'damaged hair']
  },
  {
    name: 'Pantene Pro-V Daily Moisture Renewal Shampoo',
    description: 'Nourishing shampoo with Pro-Vitamin B5 for daily moisture',
    category: 'Hair Care',
    price: 11.99,
    costPrice: 7.25,
    stock: 200,
    sku: 'PT001',
    totalSold: 112,
    averageRating: 4.2,
    reviewCount: 34,
    tags: ['pantene', 'shampoo', 'moisture', 'pro-vitamin']
  },
  {
    name: 'Pantene Gold Series Sulfate-Free Shampoo',
    description: 'Gentle sulfate-free shampoo for textured hair',
    category: 'Hair Care',
    price: 15.99,
    costPrice: 9.50,
    stock: 90,
    sku: 'PT002',
    totalSold: 58,
    averageRating: 4.4,
    reviewCount: 21,
    tags: ['pantene', 'sulfate-free', 'textured-hair']
  },
  
  // Conditioner Products
  {
    name: 'Dark & Lovely Moisture Plus Conditioner',
    description: 'Rich conditioning formula for dry, damaged hair',
    category: 'Personal Care',
    price: 9.99,
    costPrice: 5.75,
    stock: 110,
    sku: 'DL001',
    totalSold: 76,
    averageRating: 4.0,
    reviewCount: 19,
    tags: ['dark-lovely', 'conditioner', 'moisture', 'damaged-hair']
  },
  {
    name: 'Dark & Lovely Healthy Gloss 5-in-1 Conditioner',
    description: 'Multi-benefit conditioner with 5 hair care benefits in one',
    category: 'Personal Care',
    price: 12.49,
    costPrice: 7.25,
    stock: 85,
    sku: 'DL002',
    totalSold: 52,
    averageRating: 4.1,
    reviewCount: 14,
    tags: ['dark-lovely', 'conditioner', '5-in-1', 'gloss']
  },
  
  // Personal Care / Body Wash Products  
  {
    name: 'Dove Deeply Nourishing Body Wash',
    description: 'Moisturizing body wash with 1/4 moisturizing cream.',
    category: 'Personal Care',
    price: 285,
    costPrice: 200,
    stock: 78,
    sku: 'DOV001',
    totalSold: 31,
    averageRating: 4.3,
    reviewCount: 234,
    tags: ['body wash', 'moisturizing', 'nourishing']
  },
  
  // Fragrance Products
  {
    name: 'Calvin Klein Euphoria Eau de Parfum',
    description: 'Captivating floral fragrance for modern women.',
    category: 'Personal Care',
    price: 4200,
    costPrice: 2940,
    stock: 28,
    sku: 'CK001',
    totalSold: 112,
    averageRating: 4.6,
    reviewCount: 178,
    tags: ['floral', 'modern', 'captivating']
  },
  {
    name: 'Chanel Coco Mademoiselle Eau de Parfum',
    description: 'Elegant and sensual fragrance with oriental notes.',
    category: 'Personal Care',
    price: 8500,
    costPrice: 5950,
    stock: 15,
    sku: 'CHA001',
    totalSold: 58,
    averageRating: 4.9,
    reviewCount: 567,
    tags: ['perfume', 'luxury', 'oriental']
  },
  
  // Anti-aging Products
  {
    name: 'Charlotte Tilbury Magic Cream',
    description: 'Luxury moisturizer for radiant, youthful-looking skin.',
    category: 'Skincare',
    price: 4500,
    costPrice: 3150,
    stock: 20,
    sku: 'CT001',
    totalSold: 43,
    averageRating: 4.8,
    reviewCount: 156,
    tags: ['moisturizer', 'luxury', 'anti-aging']
  },
  {
    name: 'Paula\'s Choice 2% BHA Liquid Exfoliant',
    description: 'Gentle salicylic acid exfoliant for clearer skin.',
    category: 'Skincare',
    price: 2800,
    costPrice: 1960,
    stock: 33,
    sku: 'PC001',
    totalSold: 31,
    averageRating: 4.9,
    reviewCount: 267,
    tags: ['exfoliant', 'bha', 'salicylic acid']
  },

  // Additional Skincare Products
  {
    name: 'CeraVe Hydrating Facial Cleanser',
    description: 'Non-foaming cleanser for normal to dry skin with ceramides.',
    category: 'Skincare',
    price: 650,
    costPrice: 455,
    stock: 55,
    sku: 'CER001',
    totalSold: 78,
    averageRating: 4.4,
    reviewCount: 178,
    tags: ['cleanser', 'hydrating', 'ceramides']
  },
  {
    name: 'Drunk Elephant C-Firma Day Serum',
    description: 'Vitamin C day serum for firmer, brighter skin.',
    category: 'Skincare',
    price: 6800,
    costPrice: 4760,
    stock: 18,
    sku: 'DE001',
    totalSold: 42,
    averageRating: 4.8,
    reviewCount: 142,
    tags: ['vitamin c', 'serum', 'brightening']
  },
  {
    name: 'Olay Regenerist Micro-Sculpting Cream',
    description: 'Anti-aging moisturizer with amino-peptides and hyaluronic acid.',
    category: 'Skincare',
    price: 1299,
    costPrice: 909,
    stock: 67,
    sku: 'OLY001',
    totalSold: 89,
    averageRating: 4.3,
    reviewCount: 234,
    tags: ['anti-aging', 'moisturizer', 'peptides']
  },
  {
    name: 'Garnier Micellar Water',
    description: 'All-in-1 cleanser and makeup remover for sensitive skin.',
    category: 'Skincare',
    price: 399,
    costPrice: 279,
    stock: 120,
    sku: 'GAR001',
    totalSold: 156,
    averageRating: 4.1,
    reviewCount: 289,
    tags: ['micellar water', 'makeup remover', 'sensitive skin']
  },
  {
    name: 'Nivea Creme',
    description: 'Classic moisturizing cream for face, hands and body.',
    category: 'Skincare',
    price: 299,
    costPrice: 209,
    stock: 89,
    sku: 'NIV001',
    totalSold: 234,
    averageRating: 4.2,
    reviewCount: 567,
    tags: ['moisturizer', 'classic', 'multi-use']
  },

  // Additional Makeup Products
  {
    name: 'NARS Radiant Creamy Concealer',
    description: 'Multi-use concealer with medium to full buildable coverage.',
    category: 'Makeup',
    price: 2200,
    costPrice: 1540,
    stock: 29,
    sku: 'NAR001',
    totalSold: 67,
    averageRating: 4.5,
    reviewCount: 215,
    tags: ['concealer', 'radiant', 'buildable']
  },
  {
    name: 'Tarte Shape Tape Concealer',
    description: 'Full coverage concealer that lasts up to 16 hours.',
    category: 'Makeup',
    price: 2400,
    costPrice: 1680,
    stock: 42,
    sku: 'TAR001',
    totalSold: 89,
    averageRating: 4.7,
    reviewCount: 298,
    tags: ['concealer', 'full coverage', 'long wear']
  },
  {
    name: 'Benefit Brow Precisely My Brow Pencil',
    description: 'Ultra-fine tip brow pencil for precise definition.',
    category: 'Makeup',
    price: 2200,
    costPrice: 1540,
    stock: 28,
    sku: 'BEN001',
    totalSold: 45,
    averageRating: 4.5,
    reviewCount: 187,
    tags: ['brow pencil', 'precise', 'definition']
  },
  {
    name: 'Fenty Beauty Gloss Bomb Universal Lip Luminizer',
    description: 'Explosive shine that feels as good as it looks.',
    category: 'Makeup',
    price: 1600,
    costPrice: 1120,
    stock: 38,
    sku: 'FEN001',
    totalSold: 78,
    averageRating: 4.6,
    reviewCount: 203,
    tags: ['lip gloss', 'shine', 'universal']
  },
  {
    name: 'Glossier Cloud Paint',
    description: 'Gel-cream blush for a dewy, natural flush.',
    category: 'Makeup',
    price: 1400,
    costPrice: 980,
    stock: 31,
    sku: 'GLO001',
    totalSold: 56,
    averageRating: 4.7,
    reviewCount: 189,
    tags: ['blush', 'gel-cream', 'dewy']
  },
  {
    name: 'L\'Oreal Paris True Match Foundation',
    description: 'Matches skin tone and undertone with buildable coverage.',
    category: 'Makeup',
    price: 799,
    costPrice: 559,
    stock: 67,
    sku: 'LOR001',
    totalSold: 123,
    averageRating: 4.3,
    reviewCount: 345,
    tags: ['foundation', 'true match', 'buildable']
  },
  {
    name: 'NYX Professional Makeup Butter Gloss',
    description: 'Buttery soft lip gloss with intense color payoff.',
    category: 'Makeup',
    price: 450,
    costPrice: 315,
    stock: 89,
    sku: 'NYX001',
    totalSold: 234,
    averageRating: 4.4,
    reviewCount: 156,
    tags: ['lip gloss', 'buttery', 'intense color']
  },

  // Additional Hair Care Products
  {
    name: 'L\'Oreal Professionnel Serie Expert Vitamino Color Shampoo',
    description: 'Color-protecting shampoo for color-treated hair.',
    category: 'Hair Care',
    price: 1299,
    costPrice: 909,
    stock: 45,
    sku: 'LPR001',
    totalSold: 67,
    averageRating: 4.2,
    reviewCount: 89,
    tags: ['color protection', 'shampoo', 'professional']
  },
  {
    name: 'Matrix Biolage Hydrasource Conditioner',
    description: 'Moisturizing conditioner for dry hair with aloe extract.',
    category: 'Personal Care',
    price: 1199,
    costPrice: 839,
    stock: 56,
    sku: 'MAT001',
    totalSold: 78,
    averageRating: 4.3,
    reviewCount: 123,
    tags: ['moisturizing', 'conditioner', 'aloe']
  },
  {
    name: 'Schwarzkopf Professional BC Bonacure Repair Rescue Shampoo',
    description: 'Reconstructing shampoo for damaged and over-processed hair.',
    category: 'Hair Care',
    price: 1399,
    costPrice: 979,
    stock: 34,
    sku: 'SCH001',
    totalSold: 45,
    averageRating: 4.4,
    reviewCount: 67,
    tags: ['repair', 'damaged hair', 'professional']
  },
  {
    name: 'WOW Skin Science Red Onion Hair Oil',
    description: 'Hair growth oil with red onion extract and essential oils.',
    category: 'Hair Care',
    price: 599,
    costPrice: 419,
    stock: 78,
    sku: 'WOW001',
    totalSold: 156,
    averageRating: 4.1,
    reviewCount: 289,
    tags: ['hair oil', 'red onion', 'hair growth']
  },
  {
    name: 'Mamaearth Onion Hair Mask',
    description: 'Deep conditioning hair mask with onion oil and organic bamboo vinegar.',
    category: 'Personal Care',
    price: 399,
    costPrice: 279,
    stock: 67,
    sku: 'MAM001',
    totalSold: 89,
    averageRating: 4.2,
    reviewCount: 167,
    tags: ['hair mask', 'onion', 'deep conditioning']
  },
  {
    name: 'Tresemme Keratin Smooth Shampoo',
    description: 'Smoothing shampoo with keratin for frizz control.',
    category: 'Hair Care',
    price: 349,
    costPrice: 244,
    stock: 89,
    sku: 'TRE001',
    totalSold: 234,
    averageRating: 4.0,
    reviewCount: 345,
    tags: ['keratin', 'smooth', 'frizz control']
  },
  {
    name: 'Herbal Essences Bio Renew Argan Oil Conditioner',
    description: 'Nourishing conditioner with argan oil for dry hair.',
    category: 'Personal Care',
    price: 299,
    costPrice: 209,
    stock: 78,
    sku: 'HER001',
    totalSold: 123,
    averageRating: 4.1,
    reviewCount: 234,
    tags: ['argan oil', 'conditioner', 'nourishing']
  },

  // Fragrance Products
  {
    name: 'Dior Sauvage Eau de Toilette',
    description: 'Fresh and woody fragrance with bergamot and pepper notes.',
    category: 'Personal Care',
    price: 6500,
    costPrice: 4550,
    stock: 22,
    sku: 'DIO001',
    totalSold: 45,
    averageRating: 4.8,
    reviewCount: 234,
    tags: ['woody', 'fresh', 'bergamot']
  },
  {
    name: 'Versace Bright Crystal Eau de Toilette',
    description: 'Floral fruity fragrance with pomegranate and peony.',
    category: 'Personal Care',
    price: 4800,
    costPrice: 3360,
    stock: 18,
    sku: 'VER001',
    totalSold: 34,
    averageRating: 4.6,
    reviewCount: 156,
    tags: ['floral', 'fruity', 'pomegranate']
  },
  {
    name: 'Hugo Boss Bottled Eau de Toilette',
    description: 'Sophisticated masculine fragrance with apple and cinnamon.',
    category: 'Personal Care',
    price: 3200,
    costPrice: 2240,
    stock: 26,
    sku: 'HUG001',
    totalSold: 67,
    averageRating: 4.4,
    reviewCount: 189,
    tags: ['masculine', 'apple', 'sophisticated']
  },
  {
    name: 'Gucci Bloom Eau de Parfum',
    description: 'Contemporary floral fragrance with tuberose and jasmine.',
    category: 'Personal Care',
    price: 7200,
    costPrice: 5040,
    stock: 15,
    sku: 'GUC001',
    totalSold: 23,
    averageRating: 4.9,
    reviewCount: 87,
    tags: ['floral', 'tuberose', 'contemporary']
  },
  {
    name: 'Tom Ford Black Orchid Eau de Parfum',
    description: 'Luxurious oriental fragrance with black orchid and dark chocolate.',
    category: 'Personal Care',
    price: 12500,
    costPrice: 8750,
    stock: 8,
    sku: 'TOM001',
    totalSold: 12,
    averageRating: 5.0,
    reviewCount: 34,
    tags: ['luxury', 'oriental', 'black orchid']
  },

  // Personal Care Products
  {
    name: 'Himalaya Neem Face Wash',
    description: 'Purifying face wash with neem and turmeric for acne-prone skin.',
    category: 'Skincare',
    price: 150,
    costPrice: 105,
    stock: 156,
    sku: 'HIM001',
    totalSold: 345,
    averageRating: 4.2,
    reviewCount: 567,
    tags: ['neem', 'purifying', 'acne']
  },
  {
    name: 'Pears Transparent Soap',
    description: 'Gentle transparent soap with glycerin and natural oils.',
    category: 'Personal Care',
    price: 45,
    costPrice: 32,
    stock: 234,
    sku: 'PEA001',
    totalSold: 567,
    averageRating: 4.0,
    reviewCount: 789,
    tags: ['transparent', 'gentle', 'glycerin']
  },
  {
    name: 'Dettol Original Antiseptic Liquid',
    description: 'Multi-use antiseptic liquid for wound care and household cleaning.',
    category: 'Personal Care',
    price: 189,
    costPrice: 132,
    stock: 123,
    sku: 'DET001',
    totalSold: 234,
    averageRating: 4.3,
    reviewCount: 456,
    tags: ['antiseptic', 'multi-use', 'protection']
  },
  {
    name: 'Lifebuoy Total 10 Hand Sanitizer',
    description: 'Advanced protection hand sanitizer with silver formula.',
    category: 'Personal Care',
    price: 89,
    costPrice: 62,
    stock: 189,
    sku: 'LIF001',
    totalSold: 456,
    averageRating: 4.1,
    reviewCount: 234,
    tags: ['hand sanitizer', 'protection', 'silver formula']
  },
  {
    name: 'Palmolive Naturals Milk & Honey Shower Gel',
    description: 'Moisturizing shower gel with milk proteins and honey extracts.',
    category: 'Personal Care',
    price: 195,
    costPrice: 137,
    stock: 89,
    sku: 'PAL001',
    totalSold: 156,
    averageRating: 4.2,
    reviewCount: 189,
    tags: ['shower gel', 'milk', 'honey']
  },

  // Oral Care Products
  {
    name: 'Colgate Total Advanced Health Toothpaste',
    description: 'Complete oral care toothpaste with 12-hour protection.',
    category: 'Personal Care',
    price: 85,
    costPrice: 60,
    stock: 234,
    sku: 'COL001',
    totalSold: 567,
    averageRating: 4.3,
    reviewCount: 789,
    tags: ['toothpaste', 'complete care', '12-hour protection']
  },
  {
    name: 'Sensodyne Rapid Relief Toothpaste',
    description: 'Fast relief toothpaste for sensitive teeth with stannous fluoride.',
    category: 'Personal Care',
    price: 125,
    costPrice: 88,
    stock: 156,
    sku: 'SEN001',
    totalSold: 234,
    averageRating: 4.4,
    reviewCount: 345,
    tags: ['sensitive teeth', 'rapid relief', 'fluoride']
  },
  {
    name: 'Listerine Cool Skincare Mouthwash',
    description: 'Antiseptic mouthwash that kills 99.9% of germs.',
    category: 'Personal Care',
    price: 199,
    costPrice: 139,
    stock: 89,
    sku: 'LIS001',
    totalSold: 156,
    averageRating: 4.2,
    reviewCount: 234,
    tags: ['mouthwash', 'antiseptic', 'cool Skincare']
  },

  // Deodorants
  {
    name: 'Axe Dark Temptation Deodorant Spray',
    description: 'Long-lasting deodorant spray with dark chocolate fragrance.',
    category: 'Personal Care',
    price: 299,
    costPrice: 209,
    stock: 67,
    sku: 'AXE001',
    totalSold: 189,
    averageRating: 4.1,
    reviewCount: 234,
    tags: ['deodorant', 'long-lasting', 'chocolate']
  },
  {
    name: 'Rexona Women Maximum Protection Antiperspirant',
    description: '96-hour protection antiperspirant deodorant for women.',
    category: 'Personal Care',
    price: 349,
    costPrice: 244,
    stock: 45,
    sku: 'REX001',
    totalSold: 89,
    averageRating: 4.3,
    reviewCount: 156,
    tags: ['antiperspirant', '96-hour protection', 'women'],
    images: [{ url: '/images/rexona-antiperspirant.jpg', alt: 'Rexona Antiperspirant' }]
  },

  // Men's Grooming Products
  {
    name: 'Gillette Fusion5 Razor',
    description: 'Advanced 5-blade razor for a close and comfortable shave.',
    category: 'Men\'s Grooming',
    price: 599,
    costPrice: 419,
    stock: 45,
    sku: 'GIL001',
    totalSold: 123,
    averageRating: 4.5,
    reviewCount: 234,
    tags: ['razor', '5-blade', 'men', 'shaving'],
    images: [{ url: '/images/gillette-fusion5.jpg', alt: 'Gillette Fusion5 Razor' }]
  },
  {
    name: 'The Man Company Charcoal Face Wash',
    description: 'Deep cleansing charcoal face wash for men.',
    category: 'Men\'s Grooming',
    price: 299,
    costPrice: 209,
    stock: 67,
    sku: 'TMC001',
    totalSold: 89,
    averageRating: 4.2,
    reviewCount: 156,
    tags: ['charcoal', 'face wash', 'men', 'cleansing'],
    images: [{ url: '/images/man-company-charcoal.jpg', alt: 'The Man Company Charcoal Face Wash' }]
  },
  {
    name: 'Beardo Beard Growth Oil',
    description: 'Natural beard growth oil with essential nutrients.',
    category: 'Men\'s Grooming',
    price: 449,
    costPrice: 314,
    stock: 34,
    sku: 'BRD001',
    totalSold: 67,
    averageRating: 4.3,
    reviewCount: 189,
    tags: ['beard oil', 'growth', 'men', 'natural'],
    images: [{ url: '/images/beardo-beard-oil.jpg', alt: 'Beardo Beard Growth Oil' }]
  },

  // Baby Care Products
  {
    name: 'Johnson\'s Baby Shampoo',
    description: 'Gentle, no more tears formula for baby\'s delicate hair.',
    category: 'Baby Care',
    price: 189,
    costPrice: 132,
    stock: 89,
    sku: 'JOH001',
    totalSold: 234,
    averageRating: 4.6,
    reviewCount: 345,
    tags: ['baby', 'shampoo', 'gentle', 'no tears'],
    images: [{ url: '/images/johnsons-baby-shampoo.jpg', alt: 'Johnson Baby Shampoo' }]
  },
  {
    name: 'Himalaya Baby Lotion',
    description: 'Nourishing baby lotion with natural ingredients.',
    category: 'Baby Care',
    price: 145,
    costPrice: 102,
    stock: 78,
    sku: 'HIM002',
    totalSold: 156,
    averageRating: 4.4,
    reviewCount: 234,
    tags: ['baby', 'lotion', 'natural', 'nourishing'],
    images: [{ url: '/images/himalaya-baby-lotion.jpg', alt: 'Himalaya Baby Lotion' }]
  },
  {
    name: 'Pampers Baby Dry Diapers',
    description: 'All-night protection with 3 Extra Absorb Channels.',
    category: 'Baby Care',
    price: 999,
    costPrice: 699,
    stock: 45,
    sku: 'PAM001',
    totalSold: 89,
    averageRating: 4.3,
    reviewCount: 167,
    tags: ['diapers', 'baby', 'protection', 'dry'],
    images: [{ url: '/images/pampers-baby-dry.jpg', alt: 'Pampers Baby Dry Diapers' }]
  },

  // Wellness Products
  {
    name: 'HealthKart Multivitamin',
    description: 'Complete multivitamin with 24 essential nutrients.',
    category: 'Wellness',
    price: 799,
    costPrice: 559,
    stock: 56,
    sku: 'HK001',
    totalSold: 78,
    averageRating: 4.1,
    reviewCount: 234,
    tags: ['multivitamin', 'wellness', 'nutrients', 'health'],
    images: [{ url: '/images/healthkart-multivitamin.jpg', alt: 'HealthKart Multivitamin' }]
  },
  {
    name: 'Dabur Chyawanprash',
    description: 'Ayurvedic immunity booster with 40+ herbs and spices.',
    category: 'Wellness',
    price: 299,
    costPrice: 209,
    stock: 89,
    sku: 'DAB001',
    totalSold: 156,
    averageRating: 4.4,
    reviewCount: 345,
    tags: ['ayurvedic', 'immunity', 'herbs', 'traditional'],
    images: [{ url: '/images/dabur-chyawanprash.jpg', alt: 'Dabur Chyawanprash' }]
  },
  {
    name: 'Neurobion Forte Tablets',
    description: 'Vitamin B complex supplement for nerve health.',
    category: 'Wellness',
    price: 45,
    costPrice: 32,
    stock: 234,
    sku: 'NEU002',
    totalSold: 567,
    averageRating: 4.2,
    reviewCount: 189,
    tags: ['vitamin b', 'supplement', 'nerve health', 'tablets'],
    images: [{ url: '/images/neurobion-forte.jpg', alt: 'Neurobion Forte Tablets' }]
  },

  // Additional Fragrance Products
  {
    name: 'Bombay Shaving Company Perfume',
    description: 'Fresh and woody fragrance for the modern man.',
    category: 'Fragrance',
    price: 899,
    costPrice: 629,
    stock: 34,
    sku: 'BSC001',
    totalSold: 67,
    averageRating: 4.0,
    reviewCount: 123,
    tags: ['perfume', 'woody', 'fresh', 'men'],
    images: [{ url: '/images/bombay-shaving-perfume.jpg', alt: 'Bombay Shaving Company Perfume' }]
  },
  {
    name: 'Engage Cologne Spray',
    description: 'Long-lasting cologne spray with captivating fragrance.',
    category: 'Fragrance',
    price: 299,
    costPrice: 209,
    stock: 78,
    sku: 'ENG001',
    totalSold: 189,
    averageRating: 3.9,
    reviewCount: 234,
    tags: ['cologne', 'spray', 'long-lasting', 'captivating'],
    images: [{ url: '/images/engage-cologne.jpg', alt: 'Engage Cologne Spray' }]
  },
  {
    name: 'Wild Stone Body Perfume',
    description: 'Refreshing body perfume with long-lasting fragrance.',
    category: 'Fragrance',
    price: 199,
    costPrice: 139,
    stock: 89,
    sku: 'WS001',
    totalSold: 234,
    averageRating: 3.8,
    reviewCount: 167,
    tags: ['body perfume', 'refreshing', 'long-lasting', 'affordable'],
    images: [{ url: '/images/wildstone-perfume.jpg', alt: 'Wild Stone Body Perfume' }]
  },

  // Additional Skincare Products
  {
    name: 'Bio-Oil Skincare Oil',
    description: 'Multi-use skincare oil for scars, stretch marks, and uneven skin tone.',
    category: 'Skincare',
    price: 899,
    costPrice: 629,
    stock: 45,
    sku: 'BIO001',
    totalSold: 123,
    averageRating: 4.5,
    reviewCount: 298,
    tags: ['bio-oil', 'scars', 'stretch marks', 'skincare oil'],
    images: [{ url: '/images/bio-oil.jpg', alt: 'Bio-Oil Skincare Oil' }]
  },
  {
    name: 'Forest Essentials Facial Cleanser',
    description: 'Ayurvedic facial cleanser with sandalwood and saffron.',
    category: 'Skincare',
    price: 1250,
    costPrice: 875,
    stock: 30,
    sku: 'FE001',
    totalSold: 67,
    averageRating: 4.7,
    reviewCount: 145,
    tags: ['ayurvedic', 'sandalwood', 'saffron', 'luxury'],
    images: [{ url: '/images/forest-essentials-cleanser.jpg', alt: 'Forest Essentials Facial Cleanser' }]
  },
  {
    name: 'Minimalist Hyaluronic Acid Serum',
    description: '2% Hyaluronic Acid serum for intense hydration and plumping.',
    category: 'Skincare',
    price: 599,
    costPrice: 419,
    stock: 78,
    sku: 'MIN001',
    totalSold: 189,
    averageRating: 4.6,
    reviewCount: 234,
    tags: ['hyaluronic acid', 'hydration', 'plumping', 'serum'],
    images: [{ url: '/images/minimalist-ha-serum.jpg', alt: 'Minimalist Hyaluronic Acid Serum' }]
  },

  // Additional Makeup Products
  {
    name: 'Huda Beauty Liquid Matte Lipstick',
    description: 'Long-wearing liquid lipstick with intense color payoff.',
    category: 'Makeup',
    price: 1650,
    costPrice: 1155,
    stock: 34,
    sku: 'HB001',
    totalSold: 89,
    averageRating: 4.7,
    reviewCount: 178,
    tags: ['liquid lipstick', 'matte', 'long-wearing', 'huda beauty'],
    images: [{ url: '/images/huda-liquid-lipstick.jpg', alt: 'Huda Beauty Liquid Matte Lipstick' }]
  },
  {
    name: 'Colorbar Perfect Match Concealer',
    description: 'Full coverage concealer that matches Indian skin tones perfectly.',
    category: 'Makeup',
    price: 699,
    costPrice: 489,
    stock: 56,
    sku: 'CB001',
    totalSold: 134,
    averageRating: 4.3,
    reviewCount: 267,
    tags: ['concealer', 'indian skin tones', 'full coverage', 'colorbar'],
    images: [{ url: '/images/colorbar-concealer.jpg', alt: 'Colorbar Perfect Match Concealer' }]
  },
  {
    name: 'Lakme Eyeconic Kajal',
    description: 'Intense black kajal with 22-hour stay power.',
    category: 'Makeup',
    price: 275,
    costPrice: 193,
    stock: 123,
    sku: 'LAK002',
    totalSold: 445,
    averageRating: 4.2,
    reviewCount: 567,
    tags: ['kajal', 'black', '22-hour', 'lakme'],
    images: [{ url: '/images/lakme-kajal.jpg', alt: 'Lakme Eyeconic Kajal' }]
  },

  // Additional Hair Care Products
  {
    name: 'Moroccanoil Treatment',
    description: 'Original hair treatment with argan oil for all hair types.',
    category: 'Hair Care',
    price: 3200,
    costPrice: 2240,
    stock: 25,
    sku: 'MOR001',
    totalSold: 78,
    averageRating: 4.8,
    reviewCount: 189,
    tags: ['argan oil', 'hair treatment', 'moroccan', 'luxury'],
    images: [{ url: '/images/moroccanoil-treatment.jpg', alt: 'Moroccanoil Treatment' }]
  },
  {
    name: 'Khadi Natural Hair Oil',
    description: 'Ayurvedic hair oil with 18 herbs for hair growth and nourishment.',
    category: 'Hair Care',
    price: 349,
    costPrice: 244,
    stock: 89,
    sku: 'KH001',
    totalSold: 234,
    averageRating: 4.1,
    reviewCount: 345,
    tags: ['ayurvedic', '18 herbs', 'hair growth', 'natural'],
    images: [{ url: '/images/khadi-hair-oil.jpg', alt: 'Khadi Natural Hair Oil' }]
  },

  // Additional Men's Grooming Products
  {
    name: 'Ustraa Beard Growth Oil',
    description: 'Premium beard growth oil with 8 natural oils.',
    category: 'Men\'s Grooming',
    price: 549,
    costPrice: 384,
    stock: 67,
    sku: 'UST001',
    totalSold: 156,
    averageRating: 4.4,
    reviewCount: 234,
    tags: ['beard growth', '8 oils', 'premium', 'men'],
    images: [{ url: '/images/ustraa-beard-oil.jpg', alt: 'Ustraa Beard Growth Oil' }]
  },
  {
    name: 'Park Avenue Deodorant Spray',
    description: 'Long-lasting deodorant spray with sophisticated fragrance.',
    category: 'Men\'s Grooming',
    price: 199,
    costPrice: 139,
    stock: 123,
    sku: 'PA001',
    totalSold: 345,
    averageRating: 4.0,
    reviewCount: 456,
    tags: ['deodorant', 'long-lasting', 'sophisticated', 'men'],
    images: [{ url: '/images/park-avenue-deo.jpg', alt: 'Park Avenue Deodorant Spray' }]
  },

  // Additional Baby Care Products
  {
    name: 'Mamaearth Baby Lotion',
    description: 'Natural baby lotion with oats, milk and calendula.',
    category: 'Baby Care',
    price: 299,
    costPrice: 209,
    stock: 89,
    sku: 'ME002',
    totalSold: 189,
    averageRating: 4.5,
    reviewCount: 267,
    tags: ['baby lotion', 'oats', 'milk', 'calendula', 'natural'],
    images: [{ url: '/images/mamaearth-baby-lotion.jpg', alt: 'Mamaearth Baby Lotion' }]
  },
  {
    name: 'Sebamed Baby Cleansing Bar',
    description: 'Extra mild cleansing bar with pH 5.5 for baby\'s delicate skin.',
    category: 'Baby Care',
    price: 195,
    costPrice: 137,
    stock: 67,
    sku: 'SB001',
    totalSold: 123,
    averageRating: 4.4,
    reviewCount: 178,
    tags: ['cleansing bar', 'pH 5.5', 'mild', 'baby'],
    images: [{ url: '/images/sebamed-baby-bar.jpg', alt: 'Sebamed Baby Cleansing Bar' }]
  },

  // Additional Wellness Products
  {
    name: 'Himalaya Ashwagandha Tablets',
    description: 'Pure ashwagandha tablets for stress relief and energy boost.',
    category: 'Wellness',
    price: 399,
    costPrice: 279,
    stock: 156,
    sku: 'HIM003',
    totalSold: 234,
    averageRating: 4.3,
    reviewCount: 345,
    tags: ['ashwagandha', 'stress relief', 'energy', 'ayurvedic'],
    images: [{ url: '/images/himalaya-ashwagandha.jpg', alt: 'Himalaya Ashwagandha Tablets' }]
  },
  {
    name: 'Patanjali Honey',
    description: 'Pure and natural honey for health and wellness.',
    category: 'Wellness',
    price: 189,
    costPrice: 132,
    stock: 234,
    sku: 'PAT001',
    totalSold: 567,
    averageRating: 4.1,
    reviewCount: 678,
    tags: ['honey', 'pure', 'natural', 'patanjali'],
    images: [{ url: '/images/patanjali-honey.jpg', alt: 'Patanjali Honey' }]
  }
];

// Function to create sample orders
const createSampleOrders = async (customers, products) => {
  const orders = [];
  
  // Generate orders for the past week to match dashboard data
  const orderDates = [
    new Date('2025-09-23T15:30:00'), // Today
    new Date('2025-09-23T15:29:00'), // Today
    new Date('2025-09-23T07:41:00'), // Today
    new Date('2025-09-22T23:59:00'), // Yesterday
    new Date('2025-09-22T19:44:00'), // Yesterday
    new Date('2025-09-22T10:02:00'), // Yesterday
    new Date('2025-09-20T08:59:00'), // 3 days ago
  ];

  const orderData = [
    {
      customerIndex: 0, // ahmed yassine
      products: [{ productIndex: 0, quantity: 2 }, { productIndex: 4, quantity: 1 }],
      paymentMethod: 'cash',
      status: 'pending',
      total: 259.79,
      dateIndex: 0
    },
    {
      customerIndex: 1, // Sierra Brooks  
      products: [{ productIndex: 1, quantity: 1 }, { productIndex: 6, quantity: 2 }],
      paymentMethod: 'cash',
      status: 'pending',
      total: 284.04,
      dateIndex: 1
    },
    {
      customerIndex: 1, // Sierra Brooks
      products: [{ productIndex: 2, quantity: 1 }, { productIndex: 5, quantity: 3 }],
      paymentMethod: 'cash',
      status: 'delivered',
      total: 470.00,
      dateIndex: 2
    },
    {
      customerIndex: 2, // Ibukunoluwa Adeyoju
      products: [{ productIndex: 7, quantity: 1 }],
      paymentMethod: 'card',
      status: 'pending',
      total: 77.46,
      dateIndex: 3
    },
    {
      customerIndex: 3, // 00 000
      products: [{ productIndex: 3, quantity: 2 }, { productIndex: 4, quantity: 4 }],
      paymentMethod: 'cash',
      status: 'processing',
      total: 821.94,
      dateIndex: 4
    },
    {
      customerIndex: 3, // 00 000
      products: [{ productIndex: 0, quantity: 1 }],
      paymentMethod: 'cash',
      status: 'processing',
      total: 195.65,
      dateIndex: 4
    },
    {
      customerIndex: 4, // jsijl njknmas
      products: [{ productIndex: 2, quantity: 5 }, { productIndex: 1, quantity: 8 }],
      paymentMethod: 'cash',
      status: 'pending',
      total: 1129.80,
      dateIndex: 4
    },
    {
      customerIndex: 1, // Sierra Brooks
      products: [{ productIndex: 6, quantity: 1 }],
      paymentMethod: 'cash',
      status: 'delivered',
      total: 183.12,
      dateIndex: 6
    }
  ];

  let invoiceCounter = 12240;

  for (const orderInfo of orderData) {
    const customer = customers[orderInfo.customerIndex];
    const orderItems = [];
    let subtotal = 0;

    for (const item of orderInfo.products) {
      const product = products[item.productIndex];
      const itemTotal = product.price * item.quantity;
      
      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal
      });
      
      subtotal += itemTotal;
    }

    const order = {
      invoiceNumber: (invoiceCounter++).toString(),
      customer: customer._id,
      customerName: customer.name,
      items: orderItems,
      subtotal: subtotal,
      tax: subtotal * 0.08, // 8% tax
      shipping: 0,
      discount: 0,
      total: orderInfo.total,
      paymentMethod: orderInfo.paymentMethod,
      status: orderInfo.status,
      orderDate: orderDates[orderInfo.dateIndex],
      paymentStatus: orderInfo.status === 'delivered' ? 'paid' : 'pending'
    };

    orders.push(order);
  }

  return orders;
};

// Main seed function
const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Category.deleteMany({});

    console.log('Creating users...');
    const users = await User.create(sampleUsers);
    console.log(`✓ Created ${users.length} users`);

    console.log('Creating categories...');
    const categories = await Category.create(sampleCategories);
    console.log(`✓ Created ${categories.length} categories`);

    console.log('Creating customers...');
    const customers = await Customer.create(sampleCustomers);
    console.log(`✓ Created ${customers.length} customers`);

    console.log('Creating products...');
    const products = await Product.create(sampleProducts);
    console.log(`✓ Created ${products.length} products`);

    console.log('Creating orders...');
    const sampleOrders = await createSampleOrders(customers, products);
    const orders = await Order.create(sampleOrders);
    console.log(`✓ Created ${orders.length} orders`);

    console.log('\n🎉 Sample data seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@dashtar.com / password123');
    console.log('Manager: manager@dashtar.com / password123');
    console.log('Staff: staff@dashtar.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
if (require.main === module) {
  seedData();
}

module.exports = { seedData };
