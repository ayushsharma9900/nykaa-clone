import { Product } from '@/types';

// Dynamic product configuration - all products and settings are now loaded from database
// This file only contains fallback configuration for when the settings API is unavailable

// Categories configuration for dynamic product management (fallback only)
export const DYNAMIC_CATEGORIES = [
  { id: 'skincare', name: 'Skincare', slug: 'skincare' },
  { id: 'makeup', name: 'Makeup', slug: 'makeup' },
  { id: 'hair-care', name: 'Hair Care', slug: 'hair-care' },
  { id: 'fragrance', name: 'Fragrance', slug: 'fragrance' },
  { id: 'personal-care', name: 'Personal Care', slug: 'personal-care' },
  { id: 'mens-grooming', name: "Men's Grooming", slug: 'mens-grooming' },
  { id: 'baby-care', name: 'Baby Care', slug: 'baby-care' },
  { id: 'wellness', name: 'Wellness', slug: 'wellness' }
] as const;

// Note: In production, these configurations should be managed through the admin settings panel
// This file serves as a fallback when the dynamic settings system is not available

// Brand pools for dynamic product seeding and validation
export const BRAND_POOLS: Record<string, string[]> = {
  'Skincare': [
    'Lakme', 'Neutrogena', 'Cetaphil', 'CeraVe', 'La Roche-Posay',
    'The Ordinary', 'Paula\'s Choice', 'Drunk Elephant', 'Olay', 'L\'Oreal Paris',
    'Himalaya', 'Plum', 'Minimalist', 'Mamaearth'
  ],
  'Makeup': [
    'Maybelline', 'MAC', 'Fenty Beauty', 'NARS', 'Tarte',
    'Too Faced', 'Rare Beauty', 'Huda Beauty', 'NYX', 'Lakme',
    'Urban Decay', 'Benefit', 'Glossier', 'Charlotte Tilbury'
  ],
  'Hair Care': [
    'Olaplex', 'L\'Oreal Professionnel', 'Schwarzkopf', 'Matrix', 'WOW Skin Science',
    'Mamaearth', 'Dove', 'Tresemme', 'Herbal Essences', 'Kerastase',
    'Pantene', 'Moroccanoil', 'Himalaya', 'Aussie', 'Wella'
  ],
  'Fragrance': [
    'Calvin Klein', 'Dior', 'Chanel', 'Gucci', 'Versace',
    'Hugo Boss', 'Burberry', 'Tom Ford', 'Paco Rabanne', 'Armaf',
    'YSL', 'Giorgio Armani', 'Lancôme', 'Dolce & Gabbana', 'Issey Miyake'
  ],
  'Personal Care': [
    'Dove', 'Nivea', 'Himalaya', 'Mamaearth', 'Pears',
    'Dettol', 'Lifebuoy', 'Palmolive', 'Colgate', 'Sensodyne',
    'Johnson\'s', 'Vaseline', 'Rexona', 'Listerine', 'Fiama', 'Biotique'
  ],
  "Men's Grooming": [
    'Gillette', 'Old Spice', 'Axe', 'The Man Company', 'Ustraa',
    'Beardo', 'Park Avenue', 'Wild Stone', 'Nivea Men', 'L\'Oreal Men Expert'
  ],
  'Baby Care': [
    'Johnson\'s Baby', 'Himalaya Baby', 'Mamaearth', 'Sebamed Baby',
    'Chicco', 'Pigeon', 'Mee Mee', 'Pampers'
  ],
  'Wellness': [
    'Himalaya', 'Dabur', 'Patanjali', 'Baidyanath', 'Zandu',
    'HealthKart', 'Neurobion', 'Revital', 'Centrum'
  ]
};

// Subcategory pools for dynamic product creation
export const SUBCATEGORY_POOLS: Record<string, string[]> = {
  'Skincare': ['Cleanser','Serum','Moisturizer','Sunscreen','Toner','Face Wash','Exfoliant','Mask'],
  'Makeup': ['Foundation','Concealer','Lipstick','Blush','Mascara','Eyeshadow','Brow','Highlighter','Kajal','Setting Spray'],
  'Hair Care': ['Shampoo','Conditioner','Hair Oil','Serum','Mask','Treatment','Styling'],
  'Fragrance': ['Eau de Parfum','Eau de Toilette','Body Mist'],
  'Personal Care': ['Body Wash','Soap','Deodorant','Toothpaste','Mouthwash','Handwash','Body Lotion','Antiseptic'],
  "Men's Grooming": ['Razor','Shaving Cream','Aftershave','Face Wash','Beard Oil','Hair Gel','Deodorant'],
  'Baby Care': ['Baby Lotion','Baby Shampoo','Baby Soap','Diaper','Baby Oil','Baby Powder'],
  'Wellness': ['Multivitamin','Protein','Supplement','Ayurvedic','Health Drink','Immunity Booster']
};

// Dynamic image pools for fallback scenarios
export const IMAGE_POOLS: Record<string, string[]> = {
  'Skincare': [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'
  ],
  'Makeup': [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'
  ],
  'Hair Care': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
    'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400'
  ],
  'Fragrance': [
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400'
  ],
  'Personal Care': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400'
  ],
  "Men's Grooming": [
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
  ],
  'Baby Care': [
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
  ],
  'Wellness': [
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
  ]
};

// Price ranges for different categories (used for dynamic pricing)
export const PRICE_RANGES: Record<string, { min: number; max: number }> = {
  'Skincare': { min: 99, max: 8000 },
  'Makeup': { min: 199, max: 5000 },
  'Hair Care': { min: 149, max: 4000 },
  'Fragrance': { min: 999, max: 15000 },
  'Personal Care': { min: 35, max: 800 },
  "Men's Grooming": { min: 99, max: 2500 },
  'Baby Care': { min: 49, max: 1500 },
  'Wellness': { min: 199, max: 3000 }
};

// Dynamic product configuration utilities
export const getRandomBrand = (category: string): string => {
  const brands = BRAND_POOLS[category] || [];
  return brands[Math.floor(Math.random() * brands.length)] || 'Generic';
};

export const getRandomSubcategory = (category: string): string => {
  const subcats = SUBCATEGORY_POOLS[category] || [];
  return subcats[Math.floor(Math.random() * subcats.length)] || 'Product';
};

export const getRandomImage = (category: string): string => {
  const images = IMAGE_POOLS[category] || IMAGE_POOLS['Skincare'];
  return images[Math.floor(Math.random() * images.length)];
};

export const getRandomPrice = (category: string): { price: number; originalPrice?: number; discount?: number } => {
  const range = PRICE_RANGES[category] || PRICE_RANGES['Personal Care'];
  const price = Math.floor(Math.random() * (range.max - range.min) + range.min);
  
  // 30% chance of having a discount
  if (Math.random() < 0.3) {
    const discountPercent = Math.floor(Math.random() * 25) + 5; // 5-30% discount
    const originalPrice = Math.floor(price / (1 - discountPercent / 100));
    return { price, originalPrice, discount: discountPercent };
  }
  
  return { price };
};

// Legacy exports for backward compatibility - now empty arrays since all data is dynamic
export const products: Product[] = [];
export const categories = DYNAMIC_CATEGORIES.map((cat, index) => ({ 
  id: (index + 1).toString(), 
  name: cat.name, 
  slug: cat.slug 
}));

// Default export for easier imports
export default {
  products: [], // Now empty - all products loaded dynamically
  categories,
  DYNAMIC_CATEGORIES,
  BRAND_POOLS,
  SUBCATEGORY_POOLS,
  IMAGE_POOLS,
  PRICE_RANGES,
  getRandomBrand,
  getRandomSubcategory,
  getRandomImage,
  getRandomPrice
};
