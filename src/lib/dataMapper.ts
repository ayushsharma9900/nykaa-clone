import { Product } from '@/types';

// Backend product interface based on the MySQL API routes
interface BackendProduct {
  id: string; // MySQL uses 'id', not '_id'
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number; // Required by API validation
  stock: number;
  sku: string;
  weight?: number;
  tags?: string[] | string; // Can be JSON string from MySQL
  isActive: boolean;
  totalSold?: number;
  averageRating?: number;
  reviewCount?: number;
  images?: string[]; // Array of image URLs from MySQL
  createdAt: string;
  updatedAt?: string;
}

// Frontend to Backend mapping
export function mapFrontendToBackend(frontendProduct: Product): Partial<BackendProduct> {
  // Ensure price is a valid number and greater than 0
  const price = Math.max(0, Number(frontendProduct.price) || 0);
  
  // Calculate costPrice - always required by backend
  let costPrice: number;
  if (frontendProduct.originalPrice && Number(frontendProduct.originalPrice) > 0) {
    costPrice = Number(frontendProduct.originalPrice);
  } else {
    // Estimate cost price as 70% of selling price if not provided
    costPrice = Math.round(price * 0.7 * 100) / 100; // Round to 2 decimal places
  }

  // Validate required fields
  if (!frontendProduct.name?.trim()) {
    throw new Error('Product name is required');
  }
  
  if (price <= 0) {
    throw new Error('Product price must be greater than 0');
  }
  
  if (!frontendProduct.category?.trim()) {
    throw new Error('Product category is required');
  }

  // For updates, only send the fields that are actually being updated
  const backendData: Partial<BackendProduct> = {
    name: frontendProduct.name.trim(),
    description: frontendProduct.description?.trim() || '',
    price: price,
    costPrice: costPrice,
    stock: Math.max(0, Math.floor(Number(frontendProduct.stockCount) || 0)), // Ensure non-negative integer
    // isActive should reflect both inStock status and stock availability
    isActive: Boolean(frontendProduct.inStock) && (Number(frontendProduct.stockCount) || 0) >= 0,
  };

  // Always include category - use fallback if mapping fails
  const mappedCategory = mapFrontendCategoryToBackend(frontendProduct.category.trim());
  backendData.category = mappedCategory || frontendProduct.category.trim();
  
  // Handle tags properly - ensure it's always an array of strings
  if (frontendProduct.tags && Array.isArray(frontendProduct.tags) && frontendProduct.tags.length > 0) {
    backendData.tags = frontendProduct.tags.filter(tag => tag.trim().length > 0);
  } else {
    backendData.tags = [];
  }

  // Include images if provided
  if (frontendProduct.images && Array.isArray(frontendProduct.images)) {
    const validImages = frontendProduct.images.filter(img => img && img.trim().length > 0);
    if (validImages.length > 0) {
      backendData.images = validImages;
    }
  }

  // Include rating and review count if provided
  if (frontendProduct.rating !== undefined && frontendProduct.rating >= 0) {
    backendData.averageRating = Math.min(5, Math.max(0, Number(frontendProduct.rating)));
  }
  
  if (frontendProduct.reviewCount !== undefined && frontendProduct.reviewCount >= 0) {
    backendData.reviewCount = Math.max(0, Math.floor(Number(frontendProduct.reviewCount)));
  }

  // Handle SKU generation more carefully
  if (!frontendProduct.id) {
    // For new products, generate a unique SKU with timestamp
    backendData.sku = generateSKU(frontendProduct.name, frontendProduct.brand || 'UNKNOWN');
  }
  // For existing products (updates), don't include SKU in the update data
  // Let the backend keep the existing SKU to avoid conflicts

  // Debug logging to help troubleshoot validation issues
  console.log('Data mapper - Frontend product:', {
    id: frontendProduct.id,
    name: frontendProduct.name,
    price: frontendProduct.price,
    originalPrice: frontendProduct.originalPrice,
    stockCount: frontendProduct.stockCount,
    category: frontendProduct.category,
    isUpdate: Boolean(frontendProduct.id)
  });
  
  console.log('Data mapper - Backend data to send:', backendData);
  
  return backendData;
}

// Backend to Frontend mapping
export function mapBackendToFrontend(backendProduct: any): Product {
  // Normalize id and images from varied backends
  const normalizedId: string = backendProduct.id || backendProduct._id;

  // Normalize images to string[]
  let normalizedImages: string[] = [];
  if (Array.isArray(backendProduct.images) && backendProduct.images.length > 0) {
    const first = backendProduct.images[0];
    if (typeof first === 'string') {
      normalizedImages = backendProduct.images as string[];
    } else if (first && typeof first === 'object') {
      normalizedImages = (backendProduct.images as any[])
        .map((img) => (typeof img === 'string' ? img : img.url))
        .filter((url: any) => typeof url === 'string' && url.length > 0);
    }
  }

  // Handle tags - MySQL might return as JSON string
  let tags: string[] = [];
  if (backendProduct.tags) {
    if (typeof backendProduct.tags === 'string') {
      try {
        tags = JSON.parse(backendProduct.tags);
      } catch (e) {
        tags = [backendProduct.tags]; // Fallback to single tag
      }
    } else if (Array.isArray(backendProduct.tags)) {
      tags = backendProduct.tags;
    }
  }

  // Use images from backend if available, otherwise generate placeholder
  const images = normalizedImages.length > 0 
    ? normalizedImages 
    : [generatePlaceholderImage(backendProduct.category)];
  
  return {
    id: normalizedId, // Prefer normalized id
    _id: normalizedId, // Frontend may expect '_id' for admin
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
    image: images[0], // Use first image as main image
    images: images, // Use actual images from backend
    inStock: Boolean(backendProduct.isActive) && Number(backendProduct.stock) > 0,
    stockCount: Number(backendProduct.stock) || 0,
    rating: Number(backendProduct.averageRating) || 0, // Use actual stored rating
    reviewCount: Number(backendProduct.reviewCount) || 0, // Use actual stored review count
    tags: tags,
    createdAt: new Date(backendProduct.createdAt),
    updatedAt: backendProduct.updatedAt ? new Date(backendProduct.updatedAt) : new Date(backendProduct.createdAt),
  };
}

// Category mapping functions - Updated for new category structure
function mapFrontendCategoryToBackend(frontendCategory: string): string | null {
  // Since our backend now uses proper category names, we can do direct mapping
  const categoryMap: Record<string, string> = {
    'Beauty': 'Skincare',
    'Cosmetics': 'Makeup',
    'Hair': 'Hair Care',
    'Haircare': 'Hair Care',
    'Perfume': 'Fragrance',
    'Grooming': 'Men\'s Grooming',
    'Baby': 'Baby Care',
    'Health': 'Wellness',
    'Personal': 'Personal Care'
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
  // Since our backend categories are now proper names, return them directly
  const categoryMap: Record<string, string> = {
    'Men\'s Grooming': 'Men\'s Grooming',
    'Baby Care': 'Baby Care',
    'Hair Care': 'Hair Care',
    'Personal Care': 'Personal Care',
    'Skincare': 'Skincare',
    'Makeup': 'Makeup',
    'Fragrance': 'Fragrance',
    'Wellness': 'Wellness'
  };
  
  return categoryMap[backendCategory] || backendCategory;
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
    'Makeup': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=500&fit=crop&auto=format',
    'Skincare': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format',
    'Hair Care': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format',
    'Fragrance': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=500&h=500&fit=crop&auto=format',
    'Personal Care': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
    "Men's Grooming": 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
    'Baby Care': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format',
    'Wellness': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop&auto=format'
  };
  
  return imageMap[category] || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop&auto=format';
}

// Default export for easier imports
export default {
  mapFrontendToBackend,
  mapBackendToFrontend
};
