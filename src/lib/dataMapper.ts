import { Product } from '@/types';

// Backend product interface based on the API routes
interface BackendProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number; // Required by API validation
  stock: number;
  sku: string;
  weight?: number;
  tags?: string[];
  isActive: boolean;
  totalSold?: number;
  averageRating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt?: string;
  __v?: number;
}

// Frontend to Backend mapping
export function mapFrontendToBackend(frontendProduct: Product): Partial<BackendProduct> {
  // Ensure price is a valid number
  const price = Number(frontendProduct.price) || 0;
  
  // Calculate costPrice - always required by backend
  let costPrice: number;
  if (frontendProduct.originalPrice && Number(frontendProduct.originalPrice) > 0) {
    costPrice = Number(frontendProduct.originalPrice);
  } else {
    // Estimate cost price as 70% of selling price if not provided
    costPrice = Math.round(price * 0.7 * 100) / 100; // Round to 2 decimal places
  }

  // For updates, only send the fields that are actually being updated
  const backendData: Partial<BackendProduct> = {
    name: frontendProduct.name?.trim() || '',
    description: frontendProduct.description?.trim() || '',
    price: price,
    costPrice: costPrice,
    stock: Math.max(0, Math.floor(Number(frontendProduct.stockCount) || 0)), // Ensure non-negative integer
    isActive: frontendProduct.inStock !== false,
  };

  // Always include category - use fallback if mapping fails
  if (frontendProduct.category) {
    const mappedCategory = mapFrontendCategoryToBackend(frontendProduct.category);
    backendData.category = mappedCategory || frontendProduct.category;
  }
  
  if (frontendProduct.tags && frontendProduct.tags.length > 0) {
    backendData.tags = frontendProduct.tags;
  }

  // Include rating and review count if provided
  if (frontendProduct.rating !== undefined) {
    backendData.averageRating = Number(frontendProduct.rating);
  }
  
  if (frontendProduct.reviewCount !== undefined) {
    backendData.reviewCount = Number(frontendProduct.reviewCount);
  }

  // Handle SKU generation more carefully
  if (!frontendProduct.id) {
    // For new products, generate a unique SKU with timestamp
    backendData.sku = generateSKU(frontendProduct.name, frontendProduct.brand || 'UNKNOWN');
  } else {
    // For existing products, only regenerate SKU if it doesn't already have one
    // This prevents duplicate SKU issues on updates
    const existingProduct = frontendProduct as any;
    if (!existingProduct.sku) {
      backendData.sku = generateSKU(frontendProduct.name, frontendProduct.brand || 'UNKNOWN', frontendProduct.id);
    }
    // If updating an existing product, don't change the SKU unless explicitly provided
  }

  // Debug logging to help troubleshoot validation issues
  console.log('Data mapper - Frontend product:', {
    id: frontendProduct.id,
    name: frontendProduct.name,
    price: frontendProduct.price,
    originalPrice: frontendProduct.originalPrice,
    stockCount: frontendProduct.stockCount,
    category: frontendProduct.category
  });
  
  console.log('Data mapper - Backend data to send:', backendData);
  
  return backendData;
}

// Backend to Frontend mapping
export function mapBackendToFrontend(backendProduct: BackendProduct): Product {
  return {
    id: backendProduct._id,
    name: backendProduct.name,
    description: backendProduct.description,
    price: backendProduct.price,
    originalPrice: backendProduct.costPrice && backendProduct.costPrice > backendProduct.price 
      ? backendProduct.costPrice * 1.4 // Estimate original price
      : undefined,
    discount: calculateDiscount(backendProduct.price, backendProduct.costPrice),
    category: mapBackendCategoryToFrontend(backendProduct.category),
    subcategory: '', // Backend doesn't have subcategory
    brand: extractBrandFromName(backendProduct.name) || 'Unknown',
    image: generatePlaceholderImage(backendProduct.category),
    images: [generatePlaceholderImage(backendProduct.category)],
    inStock: backendProduct.isActive && backendProduct.stock > 0,
    stockCount: backendProduct.stock,
    rating: backendProduct.averageRating || 0, // Use actual stored rating
    reviewCount: backendProduct.reviewCount || 0, // Use actual stored review count
    tags: backendProduct.tags || [],
    createdAt: new Date(backendProduct.createdAt),
    updatedAt: backendProduct.updatedAt ? new Date(backendProduct.updatedAt) : new Date(backendProduct.createdAt),
  };
}

// Category mapping functions
function mapFrontendCategoryToBackend(frontendCategory: string): string | null {
  const categoryMap: Record<string, string> = {
    'Skincare': 'Mint',
    'Makeup': 'Head Shoulders Shampoo',
    'Hair Care': 'Pantene hair-care',
    'Haircare': 'Pantene hair-care',
    'Shampoo': 'Head Shoulders Shampoo',
    'Conditioner': 'Dark & Lovely Conditioner',
    'Fragrance': 'Dark & Lovely Conditioner',
    'Beauty': 'Mint',
    'Personal Care': 'Mint'
  };
  
  // Try exact match first, then case-insensitive match
  let mapped = categoryMap[frontendCategory];
  if (!mapped) {
    const lowerCategory = frontendCategory.toLowerCase();
    for (const [key, value] of Object.entries(categoryMap)) {
      if (key.toLowerCase() === lowerCategory) {
        mapped = value;
        break;
      }
    }
  }
  
  // Return the mapped category or the original category as fallback
  return mapped || frontendCategory;
}

function mapBackendCategoryToFrontend(backendCategory: string): string {
  const categoryMap: Record<string, string> = {
    'Head Shoulders Shampoo': 'Hair Care',
    'Mint': 'Skincare',
    'Pantene hair-care': 'Hair Care',
    'Dark & Lovely Conditioner': 'Hair Care',
  };
  
  return categoryMap[backendCategory] || 'Skincare';
}

// Helper functions
function generateSKU(name: string, brand: string, productId?: string): string {
  const namePrefix = name.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() || 'PRD';
  const brandPrefix = brand.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() || 'UNK';
  
  if (productId) {
    // For existing products, use a hash of the product ID for consistency
    const idHash = productId.slice(-6).toUpperCase();
    return `${brandPrefix}${namePrefix}${idHash}`;
  } else {
    // For new products, use timestamp + random to avoid duplicates
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${brandPrefix}${namePrefix}${timestamp}${random}`;
  }
}

function calculateDiscount(price: number, costPrice?: number): number | undefined {
  if (!costPrice || costPrice <= price) return undefined;
  const originalPrice = costPrice * 1.4; // Estimate original price
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

function extractBrandFromName(name: string): string | null {
  // Common brand patterns
  const brands = [
    'Lakme', 'Maybelline', 'The Ordinary', 'MAC', 'Neutrogena', 
    'Urban Decay', 'Cetaphil', 'Rare Beauty', 'La Roche-Posay',
    'L\'Oreal', 'Nivea', 'Olay', 'Garnier', 'Revlon'
  ];
  
  for (const brand of brands) {
    if (name.toLowerCase().includes(brand.toLowerCase())) {
      return brand;
    }
  }
  
  // Try to extract first word as brand
  const firstWord = name.split(' ')[0];
  if (firstWord.length > 2) {
    return firstWord;
  }
  
  return null;
}

function generatePlaceholderImage(category: string): string {
  const imageMap: Record<string, string> = {
    'Head Shoulders Shampoo': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    'Mint': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    'Pantene hair-care': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    'Dark & Lovely Conditioner': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  };
  
  return imageMap[category] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400';
}
