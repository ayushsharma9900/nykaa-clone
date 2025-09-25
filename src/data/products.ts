import { Product } from '@/types';

const baseProducts: Product[] = [
  {
    id: '1',
    name: 'Lakme Absolute Perfect Radiance Skin Lightening Facewash',
    description: 'A gentle facewash that brightens and lightens skin tone with regular use.',
    price: 175,
    originalPrice: 200,
    discount: 12,
    category: 'Skincare',
    subcategory: 'Face Wash',
    brand: 'Lakme',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400'
    ],
    inStock: true,
    stockCount: 50,
    rating: 4.2,
    reviewCount: 128,
    tags: ['face wash', 'brightening', 'skincare'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Maybelline New York Fit Me Matte Foundation',
    description: 'Full coverage matte foundation that lasts up to 12 hours.',
    price: 599,
    originalPrice: 650,
    discount: 8,
    category: 'Makeup',
    subcategory: 'Foundation',
    brand: 'Maybelline',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'
    ],
    inStock: true,
    stockCount: 75,
    rating: 4.5,
    reviewCount: 256,
    tags: ['foundation', 'matte', 'full coverage'],
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: '3',
    name: 'The Ordinary Niacinamide 10% + Zinc 1%',
    description: 'A high-strength vitamin and mineral blemish formula.',
    price: 700,
    category: 'Skincare',
    subcategory: 'Serum',
    brand: 'The Ordinary',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'
    ],
    inStock: true,
    stockCount: 30,
    rating: 4.7,
    reviewCount: 189,
    tags: ['serum', 'niacinamide', 'acne treatment'],
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17')
  },
  {
    id: '4',
    name: 'MAC Lipstick - Ruby Woo',
    description: 'Iconic matte red lipstick with intense color payoff.',
    price: 1950,
    category: 'Makeup',
    subcategory: 'Lipstick',
    brand: 'MAC',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'
    ],
    inStock: true,
    stockCount: 25,
    rating: 4.8,
    reviewCount: 342,
    tags: ['lipstick', 'matte', 'red'],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: '5',
    name: 'Neutrogena Ultra Gentle Daily Cleanser',
    description: 'Gentle daily cleanser suitable for sensitive skin.',
    price: 395,
    originalPrice: 450,
    discount: 12,
    category: 'Skincare',
    subcategory: 'Cleanser',
    brand: 'Neutrogena',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400'
    ],
    inStock: true,
    stockCount: 40,
    rating: 4.3,
    reviewCount: 167,
    tags: ['cleanser', 'gentle', 'sensitive skin'],
    createdAt: new Date('2024-01-19'),
    updatedAt: new Date('2024-01-19')
  },
  {
    id: '6',
    name: 'Urban Decay Naked3 Eyeshadow Palette',
    description: '12 rose-hued neutral eyeshadows in matte and shimmer finishes.',
    price: 3200,
    originalPrice: 3500,
    discount: 9,
    category: 'Makeup',
    subcategory: 'Eyeshadow',
    brand: 'Urban Decay',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
    images: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'
    ],
    inStock: true,
    stockCount: 15,
    rating: 4.9,
    reviewCount: 289,
    tags: ['eyeshadow', 'palette', 'neutral'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: '7',
    name: 'Cetaphil Daily Facial Cleanser',
    description: 'Gentle cleanser for normal to oily skin.',
    price: 550,
    category: 'Skincare',
    subcategory: 'Cleanser',
    brand: 'Cetaphil',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
    ],
    inStock: true,
    stockCount: 60,
    rating: 4.4,
    reviewCount: 198,
    tags: ['cleanser', 'daily', 'oily skin'],
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21')
  },
  {
    id: '8',
    name: 'Rare Beauty Liquid Blush',
    description: 'Weightless liquid blush for a natural flush.',
    price: 1800,
    category: 'Makeup',
    subcategory: 'Blush',
    brand: 'Rare Beauty',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400'
    ],
    inStock: true,
    stockCount: 35,
    rating: 4.6,
    reviewCount: 145,
    tags: ['blush', 'liquid', 'natural'],
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22')
  },
  {
    id: '9',
    name: 'La Roche-Posay Anthelios Sunscreen SPF 50',
    description: 'Broad spectrum protection with antioxidants.',
    price: 1250,
    originalPrice: 1400,
    discount: 11,
    category: 'Skincare',
    subcategory: 'Sunscreen',
    brand: 'La Roche-Posay',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'
    ],
    inStock: true,
    stockCount: 45,
    rating: 4.7,
    reviewCount: 234,
    tags: ['sunscreen', 'spf 50', 'protection'],
    createdAt: new Date('2024-01-23'),
    updatedAt: new Date('2024-01-23')
  },
  {
    id: '10',
    name: 'Charlotte Tilbury Magic Cream',
    description: 'Luxury moisturizer for radiant, youthful-looking skin.',
    price: 4500,
    category: 'Skincare',
    subcategory: 'Moisturizer',
    brand: 'Charlotte Tilbury',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400'
    ],
    inStock: true,
    stockCount: 20,
    rating: 4.8,
    reviewCount: 156,
    tags: ['moisturizer', 'luxury', 'anti-aging'],
    createdAt: new Date('2024-01-24'),
    updatedAt: new Date('2024-01-24')
  },
  {
    id: '11',
    name: 'Benefit Brow Precisely My Brow Pencil',
    description: 'Ultra-fine tip brow pencil for precise definition.',
    price: 2200,
    category: 'Makeup',
    subcategory: 'Brow',
    brand: 'Benefit',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400'
    ],
    inStock: true,
    stockCount: 28,
    rating: 4.5,
    reviewCount: 187,
    tags: ['brow pencil', 'precise', 'definition'],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25')
  },
  {
    id: '12',
    name: 'Tarte Shape Tape Concealer',
    description: 'Full coverage concealer that lasts up to 16 hours.',
    price: 2400,
    originalPrice: 2600,
    discount: 8,
    category: 'Makeup',
    subcategory: 'Concealer',
    brand: 'Tarte',
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400'
    ],
    inStock: true,
    stockCount: 42,
    rating: 4.7,
    reviewCount: 298,
    tags: ['concealer', 'full coverage', 'long wear'],
    createdAt: new Date('2024-01-26'),
    updatedAt: new Date('2024-01-26')
  },
  {
    id: '13',
    name: 'Paula\'s Choice 2% BHA Liquid Exfoliant',
    description: 'Gentle salicylic acid exfoliant for clearer skin.',
    price: 2800,
    category: 'Skincare',
    subcategory: 'Exfoliant',
    brand: 'Paula\'s Choice',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'
    ],
    inStock: true,
    stockCount: 33,
    rating: 4.9,
    reviewCount: 267,
    tags: ['exfoliant', 'bha', 'salicylic acid'],
    createdAt: new Date('2024-01-27'),
    updatedAt: new Date('2024-01-27')
  },
  {
    id: '14',
    name: 'Fenty Beauty Gloss Bomb Universal Lip Luminizer',
    description: 'Explosive shine that feels as good as it looks.',
    price: 1600,
    category: 'Makeup',
    subcategory: 'Lip Gloss',
    brand: 'Fenty Beauty',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    images: [
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'
    ],
    inStock: true,
    stockCount: 38,
    rating: 4.6,
    reviewCount: 203,
    tags: ['lip gloss', 'shine', 'universal'],
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-01-28')
  },
  {
    id: '15',
    name: 'CeraVe Hydrating Facial Cleanser',
    description: 'Non-foaming cleanser for normal to dry skin.',
    price: 650,
    originalPrice: 750,
    discount: 13,
    category: 'Skincare',
    subcategory: 'Cleanser',
    brand: 'CeraVe',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'
    ],
    inStock: true,
    stockCount: 55,
    rating: 4.4,
    reviewCount: 178,
    tags: ['cleanser', 'hydrating', 'dry skin'],
    createdAt: new Date('2024-01-29'),
    updatedAt: new Date('2024-01-29')
  },
  {
    id: '16',
    name: 'NARS Radiant Creamy Concealer',
    description: 'Multi-use concealer with medium to full buildable coverage.',
    price: 2200,
    category: 'Makeup',
    subcategory: 'Concealer',
    brand: 'NARS',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'
    ],
    inStock: true,
    stockCount: 29,
    rating: 4.5,
    reviewCount: 215,
    tags: ['concealer', 'radiant', 'buildable'],
    createdAt: new Date('2024-01-30'),
    updatedAt: new Date('2024-01-30')
  },
  {
    id: '17',
    name: 'Drunk Elephant C-Firma Day Serum',
    description: 'Vitamin C day serum for firmer, brighter skin.',
    price: 6800,
    category: 'Skincare',
    subcategory: 'Serum',
    brand: 'Drunk Elephant',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    images: [
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'
    ],
    inStock: true,
    stockCount: 18,
    rating: 4.8,
    reviewCount: 142,
    tags: ['vitamin c', 'serum', 'brightening'],
    createdAt: new Date('2024-01-31'),
    updatedAt: new Date('2024-01-31')
  },
  {
    id: '18',
    name: 'Too Faced Better Than Sex Mascara',
    description: 'Volumizing mascara for dramatic lashes.',
    price: 2100,
    originalPrice: 2300,
    discount: 9,
    category: 'Makeup',
    subcategory: 'Mascara',
    brand: 'Too Faced',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
    images: [
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'
    ],
    inStock: true,
    stockCount: 47,
    rating: 4.6,
    reviewCount: 324,
    tags: ['mascara', 'volumizing', 'dramatic'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  },
  {
    id: '19',
    name: 'Glossier Cloud Paint',
    description: 'Gel-cream blush for a dewy, natural flush.',
    price: 1400,
    category: 'Makeup',
    subcategory: 'Blush',
    brand: 'Glossier',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400'
    ],
    inStock: true,
    stockCount: 31,
    rating: 4.7,
    reviewCount: 189,
    tags: ['blush', 'gel-cream', 'dewy'],
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-02-02')
  },
  {
    id: '20',
    name: 'Olaplex No. 3 Hair Perfector',
    description: 'At-home treatment to repair damaged hair.',
    price: 2800,
    originalPrice: 3200,
    discount: 12,
    category: 'Hair Care',
    subcategory: 'Treatment',
    brand: 'Olaplex',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400'
    ],
    inStock: true,
    stockCount: 22,
    rating: 4.9,
    reviewCount: 456,
    tags: ['hair treatment', 'repair', 'damaged hair'],
    createdAt: new Date('2024-02-03'),
    updatedAt: new Date('2024-02-03')
  },
  {
    id: '21',
    name: 'Chanel Coco Mademoiselle Eau de Parfum',
    description: 'Elegant and sensual fragrance with oriental notes.',
    price: 8500,
    originalPrice: 9500,
    discount: 11,
    category: 'Fragrance',
    subcategory: 'Eau de Parfum',
    brand: 'Chanel',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'
    ],
    inStock: true,
    stockCount: 15,
    rating: 4.9,
    reviewCount: 567,
    tags: ['perfume', 'luxury', 'oriental'],
    createdAt: new Date('2024-02-04'),
    updatedAt: new Date('2024-02-04')
  },
  {
    id: '22',
    name: 'Dove Deeply Nourishing Body Wash',
    description: 'Moisturizing body wash with 1/4 moisturizing cream.',
    price: 285,
    originalPrice: 320,
    discount: 11,
    category: 'Personal Care',
    subcategory: 'Body Wash',
    brand: 'Dove',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    images: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
      'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400'
    ],
    inStock: true,
    stockCount: 78,
    rating: 4.3,
    reviewCount: 234,
    tags: ['body wash', 'moisturizing', 'nourishing'],
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: '23',
    name: 'L\'Oreal Paris Revitalift Serum',
    description: 'Anti-aging serum with hyaluronic acid and vitamin C.',
    price: 1450,
    category: 'Skincare',
    subcategory: 'Serum',
    brand: 'L\'Oreal Paris',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'
    ],
    inStock: true,
    stockCount: 45,
    rating: 4.5,
    reviewCount: 289,
    tags: ['anti-aging', 'hyaluronic acid', 'vitamin c'],
    createdAt: new Date('2024-02-06'),
    updatedAt: new Date('2024-02-06')
  },
  {
    id: '24',
    name: 'Calvin Klein Euphoria Eau de Parfum',
    description: 'Captivating floral fragrance for modern women.',
    price: 4200,
    originalPrice: 4800,
    discount: 12,
    category: 'Fragrance',
    subcategory: 'Eau de Parfum',
    brand: 'Calvin Klein',
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
    images: [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'
    ],
    inStock: true,
    stockCount: 28,
    rating: 4.6,
    reviewCount: 178,
    tags: ['floral', 'modern', 'captivating'],
    createdAt: new Date('2024-02-07'),
    updatedAt: new Date('2024-02-07')
  }
];

// Auto-generate synthetic products to reach 10 items per category
const PER_CATEGORY_TARGET = 10;
const CATEGORY_LIST = ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Personal Care'] as const;

const brandPools: Record<string, string[]> = {
  'Skincare': [
    'Lakme','Neutrogena','Cetaphil','CeraVe','La Roche-Posay',
    'The Ordinary','Paula\'s Choice','Drunk Elephant','Olay','L\'Oreal Paris'
  ],
  'Makeup': [
    'Maybelline','MAC','Fenty Beauty','NARS','Tarte',
    'Too Faced','Rare Beauty','Huda Beauty','NYX','Lakme'
  ],
  'Hair Care': [
    'Olaplex','L\'Oreal Professionnel','Schwarzkopf','Matrix','WOW Skin Science',
    'Mamaearth','Dove','Tresemme','Herbal Essences','Kerastase'
  ],
  'Fragrance': [
    'Calvin Klein','Dior','Chanel','Gucci','Versace',
    'Hugo Boss','Burberry','Tom Ford','Paco Rabanne','Armaf'
  ],
  'Personal Care': [
    'Dove','Nivea','Himalaya','Mamaearth','Pears',
    'Dettol','Lifebuoy','Palmolive','Colgate','Sensodyne'
  ]
};

const subcatPools: Record<string, string[]> = {
  'Skincare': ['Cleanser','Serum','Moisturizer','Sunscreen','Toner','Face Wash','Exfoliant','Mask'],
  'Makeup': ['Foundation','Concealer','Lipstick','Blush','Mascara','Eyeshadow','Brow','Highlighter'],
  'Hair Care': ['Shampoo','Conditioner','Hair Oil','Serum','Mask','Treatment','Styling'],
  'Fragrance': ['Eau de Parfum','Eau de Toilette','Body Mist'],
  'Personal Care': ['Body Wash','Soap','Deodorant','Toothpaste','Mouthwash','Handwash','Lotion']
};

const imagePools: Record<string, string[]> = {
  'Skincare': [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
  ],
  'Makeup': [
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
    'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'
  ],
  'Hair Care': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'
  ],
  'Fragrance': [
    'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400'
  ],
  'Personal Care': [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400'
  ]
};

function pick<T>(arr: T[], idx: number): T {
  return arr[idx % arr.length];
}

// Count existing per category
const existingCount: Record<string, number> = CATEGORY_LIST.reduce((acc, cat) => {
  acc[cat] = baseProducts.filter(p => p.category === cat).length;
  return acc;
}, {} as Record<string, number>);

// Determine starting id
let idCounter = baseProducts.reduce((max, p) => {
  const n = parseInt(p.id, 10);
  return Number.isFinite(n) ? Math.max(max, n) : max;
}, 0);

const synthetic: Product[] = [];

for (const cat of CATEGORY_LIST) {
  const need = Math.max(0, PER_CATEGORY_TARGET - (existingCount[cat] || 0));
  for (let j = 1; j <= need; j++) {
    idCounter += 1;
    const n = idCounter;
    const brand = pick(brandPools[cat], n);
    const subcategory = pick(subcatPools[cat], n);
    const img1 = pick(imagePools[cat], n);
    const img2 = pick(imagePools[cat], n + 1);

    // Deterministic price by category
    const basePrice = cat === 'Skincare' ? 199
      : cat === 'Makeup' ? 299
      : cat === 'Hair Care' ? 249
      : cat === 'Fragrance' ? 999
      : 99; // Personal Care
    const price = basePrice + (n % 50) * (cat === 'Fragrance' ? 25 : 10);
    const hasDiscount = n % 3 !== 0;
    const originalPrice = hasDiscount ? Math.round(price * (1 + ((n % 7) + 5) / 100)) : undefined;
    const discount = hasDiscount && originalPrice ? Math.max(1, Math.round(((originalPrice - price) / originalPrice) * 100)) : undefined;

    const created = new Date(2024, 1, 15 + (n % 28)); // Feb 2024
    const updated = new Date(created.getTime() + (n % 7) * 24 * 60 * 60 * 1000);

    synthetic.push({
      id: String(n),
      name: `${brand} ${subcategory} ${j}`,
      description: `High-quality ${subcategory.toLowerCase()} from ${brand} in our ${cat} range.`,
      price,
      originalPrice,
      discount,
      category: cat,
      subcategory,
      brand,
      image: img1,
      images: [img1, img2],
      inStock: true,
      stockCount: 10 + (n % 60),
      rating: Math.min(5, 3.8 + ((n % 13) / 10)),
      reviewCount: 50 + (n % 400),
      tags: [cat.toLowerCase(), subcategory.toLowerCase(), brand.toLowerCase()],
      createdAt: created,
      updatedAt: updated
    });
  }
}

export const products: Product[] = [...baseProducts, ...synthetic];

export const categories = [
  { id: '1', name: 'Skincare', slug: 'skincare' },
  { id: '2', name: 'Makeup', slug: 'makeup' },
  { id: '3', name: 'Hair Care', slug: 'hair-care' },
  { id: '4', name: 'Fragrance', slug: 'fragrance' },
  { id: '5', name: 'Personal Care', slug: 'personal-care' }
];
