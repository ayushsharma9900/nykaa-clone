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

// Sample Categories
const sampleCategories = [
  {
    name: 'Head Shoulders Shampoo',
    slug: 'head-shoulders-shampoo',
    description: 'Professional anti-dandruff shampoo products for healthy hair care',
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Mint',
    slug: 'mint',
    description: 'Refreshing mint-based hair and scalp treatment products',
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Pantene hair-care',
    slug: 'pantene-hair-care',
    description: 'Professional hair care products from Pantene brand',
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Dark & Lovely Conditioner',
    slug: 'dark-lovely-conditioner',
    description: 'Specialized conditioning products for textured hair',
    isActive: true,
    sortOrder: 4
  }
];

// Sample Products - Extended set from frontend fallback data
const sampleProducts = [
  // Skincare Products
  {
    name: 'Lakme Absolute Perfect Radiance Skin Lightening Facewash',
    description: 'A gentle facewash that brightens and lightens skin tone with regular use.',
    category: 'Mint', // Map to backend category
    price: 175,
    costPrice: 145,
    stock: 50,
    sku: 'LAK001',
    totalSold: 89,
    averageRating: 4.2,
    reviewCount: 128,
    tags: ['face wash', 'brightening', 'skincare']
  },
  {
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    description: 'A high-strength vitamin and mineral blemish formula.',
    category: 'Mint',
    price: 700,
    costPrice: 480,
    stock: 30,
    sku: 'ORD001',
    totalSold: 67,
    averageRating: 4.7,
    reviewCount: 189,
    tags: ['serum', 'niacinamide', 'acne treatment']
  },
  {
    name: 'Neutrogena Ultra Gentle Daily Cleanser',
    description: 'Gentle daily cleanser suitable for sensitive skin.',
    category: 'Mint',
    price: 395,
    costPrice: 275,
    stock: 40,
    sku: 'NEU001',
    totalSold: 43,
    averageRating: 4.3,
    reviewCount: 167,
    tags: ['cleanser', 'gentle', 'sensitive skin']
  },
  {
    name: 'Cetaphil Daily Facial Cleanser',
    description: 'Gentle cleanser for normal to oily skin.',
    category: 'Mint',
    price: 550,
    costPrice: 385,
    stock: 60,
    sku: 'CET001',
    totalSold: 31,
    averageRating: 4.4,
    reviewCount: 198,
    tags: ['cleanser', 'daily', 'oily skin']
  },
  {
    name: 'La Roche-Posay Anthelios Sunscreen SPF 50',
    description: 'Broad spectrum protection with antioxidants.',
    category: 'Mint',
    price: 1250,
    costPrice: 875,
    stock: 45,
    sku: 'LRP001',
    totalSold: 112,
    averageRating: 4.7,
    reviewCount: 234,
    tags: ['sunscreen', 'spf 50', 'protection']
  },
  
  // Makeup Products (mapped to Head Shoulders Shampoo category)
  {
    name: 'Maybelline New York Fit Me Matte Foundation',
    description: 'Full coverage matte foundation that lasts up to 12 hours.',
    category: 'Head Shoulders Shampoo',
    price: 599,
    costPrice: 419,
    stock: 75,
    sku: 'MAY001',
    totalSold: 58,
    averageRating: 4.5,
    reviewCount: 256,
    tags: ['foundation', 'matte', 'full coverage']
  },
  {
    name: 'MAC Lipstick - Ruby Woo',
    description: 'Iconic matte red lipstick with intense color payoff.',
    category: 'Head Shoulders Shampoo',
    price: 1950,
    costPrice: 1365,
    stock: 25,
    sku: 'MAC001',
    totalSold: 43,
    averageRating: 4.8,
    reviewCount: 342,
    tags: ['lipstick', 'matte', 'red']
  },
  {
    name: 'Urban Decay Naked3 Eyeshadow Palette',
    description: '12 rose-hued neutral eyeshadows in matte and shimmer finishes.',
    category: 'Head Shoulders Shampoo',
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
    category: 'Head Shoulders Shampoo',
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
    category: 'Head Shoulders Shampoo',
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
    category: 'Pantene hair-care',
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
    category: 'Pantene hair-care',
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
    category: 'Pantene hair-care',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Mint',
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
    category: 'Mint',
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
    category: 'Mint',
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
    category: 'Mint',
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
    category: 'Mint',
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
    category: 'Mint',
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
    category: 'Mint',
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
    category: 'Head Shoulders Shampoo',
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
    category: 'Head Shoulders Shampoo',
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
    category: 'Head Shoulders Shampoo',
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
    category: 'Head Shoulders Shampoo',
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
    category: 'Head Shoulders Shampoo',
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
    category: 'Head Shoulders Shampoo',
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
    category: 'Head Shoulders Shampoo',
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
    category: 'Pantene hair-care',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Pantene hair-care',
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
    category: 'Pantene hair-care',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Pantene hair-care',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Mint',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
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
    name: 'Listerine Cool Mint Mouthwash',
    description: 'Antiseptic mouthwash that kills 99.9% of germs.',
    category: 'Dark & Lovely Conditioner',
    price: 199,
    costPrice: 139,
    stock: 89,
    sku: 'LIS001',
    totalSold: 156,
    averageRating: 4.2,
    reviewCount: 234,
    tags: ['mouthwash', 'antiseptic', 'cool mint']
  },

  // Deodorants
  {
    name: 'Axe Dark Temptation Deodorant Spray',
    description: 'Long-lasting deodorant spray with dark chocolate fragrance.',
    category: 'Dark & Lovely Conditioner',
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
    category: 'Dark & Lovely Conditioner',
    price: 349,
    costPrice: 244,
    stock: 45,
    sku: 'REX001',
    totalSold: 89,
    averageRating: 4.3,
    reviewCount: 156,
    tags: ['antiperspirant', '96-hour protection', 'women']
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
