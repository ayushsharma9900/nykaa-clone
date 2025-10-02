// Dynamic fallback data system for when database is unavailable
// This system tries to fetch from database first, then falls back to minimal static data

import { BRAND_POOLS, SUBCATEGORY_POOLS, IMAGE_POOLS, getRandomPrice, getRandomImage } from '@/data/products';

// Minimal fallback products - generated dynamically when needed
const generateFallbackProduct = (id: string, category: string, index: number) => {
  const brands = BRAND_POOLS[category] || ['Generic'];
  const subcats = SUBCATEGORY_POOLS[category] || ['Product'];
  const brand = brands[index % brands.length];
  const subcategory = subcats[index % subcats.length];
  const pricing = getRandomPrice(category);
  const image = getRandomImage(category);
  
  return {
    id: `fallback-${id}`,
    name: `${brand} ${subcategory} ${index + 1}`,
    category: category,
    subcategory: subcategory,
    brand: brand,
    ...pricing,
    image: image,
    images: [{ url: image, alt: `${brand} ${subcategory}` }],
    inStock: true,
    stock: Math.floor(Math.random() * 100) + 10,
    rating: Math.min(5, 3.8 + (Math.random() * 1.2)),
    reviewCount: Math.floor(Math.random() * 500) + 50,
    description: `High-quality ${subcategory.toLowerCase()} from ${brand} for your ${category.toLowerCase()} routine.`,
    tags: [subcategory.toLowerCase(), brand.toLowerCase(), category.toLowerCase()],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

// Generate dynamic fallback products
const generateFallbackProducts = () => {
  const products = [];
  const categories = ['Skincare', 'Makeup', 'Hair Care', 'Fragrance', 'Personal Care'];
  
  categories.forEach((category, catIndex) => {
    for (let i = 0; i < 16; i++) {
      products.push(generateFallbackProduct(`${catIndex + 1}-${i + 1}`, category, i));
    }
  });
  
  return products;
};

// Dynamic fallback products - generated on demand when database is unavailable
export const fallbackProducts = generateFallbackProducts();

// Dynamic fallback orders - minimal sample data
export const fallbackOrders = [
  {
    id: 'ord-001',
    invoiceNumber: 'INV-2024-001',
    customerId: 'cust-001',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    customerPhone: '+1234567890',
    subtotal: 1299.00,
    tax: 129.90,
    shipping: 50.00,
    discount: 0,
    total: 1478.90,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'card',
    shippingAddress: '123 Main St, City, State 12345',
    notes: 'Customer requested express delivery',
    orderDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ord-002',
    invoiceNumber: 'INV-2024-002',
    customerId: 'cust-002',
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    subtotal: 799.00,
    tax: 79.90,
    shipping: 30.00,
    discount: 50.00,
    total: 858.90,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    shippingAddress: '456 Oak Ave, City, State 67890',
    orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'ord-003',
    invoiceNumber: 'INV-2024-003',
    customerId: 'cust-003',
    customerName: 'Mike Johnson',
    customerEmail: 'mike@example.com',
    customerPhone: '+1987654321',
    subtotal: 2499.00,
    tax: 249.90,
    shipping: 0.00,
    discount: 100.00,
    total: 2648.90,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'credit',
    shippingAddress: '789 Pine St, City, State 54321',
    notes: 'Free shipping applied',
    orderDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

// Dynamic fallback categories
export const fallbackCategories = [
  {
    id: 'cat-skincare',
    name: 'Skincare',
    slug: 'skincare',
    description: 'Premium skincare products for all skin types including cleansers, serums, moisturizers, and sunscreens',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    isActive: 1,
    sortOrder: 1,
    menuOrder: 1,
    showInMenu: 1,
    menuLevel: 0,
    parentId: null,
    productCount: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-makeup',
    name: 'Makeup',
    slug: 'makeup',
    description: 'Complete makeup collection including foundations, lipsticks, eyeshadows, and more cosmetic products',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
    isActive: 1,
    sortOrder: 2,
    menuOrder: 2,
    showInMenu: 1,
    menuLevel: 0,
    parentId: null,
    productCount: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-haircare',
    name: 'Hair Care',
    slug: 'haircare',
    description: 'Professional hair care products including shampoos, conditioners, treatments, and styling products',
    image: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop',
    isActive: 1,
    sortOrder: 3,
    menuOrder: 3,
    showInMenu: 1,
    menuLevel: 0,
    parentId: null,
    productCount: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-fragrance',
    name: 'Fragrance',
    slug: 'fragrance',
    description: 'Luxury fragrances and perfumes from top international and local brands',
    image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop',
    isActive: 1,
    sortOrder: 4,
    menuOrder: 4,
    showInMenu: 1,
    menuLevel: 0,
    parentId: null,
    productCount: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-personal-care',
    name: 'Personal Care',
    slug: 'personal-care',
    description: 'Essential personal care products including body wash, soaps, lotions, and hygiene products',
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop',
    isActive: 1,
    sortOrder: 5,
    menuOrder: 5,
    showInMenu: 1,
    menuLevel: 0,
    parentId: null,
    productCount: 16,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-mens-grooming',
    name: "Men's Grooming",
    slug: 'mens-grooming',
    description: 'Grooming essentials for men including shaving products, skincare, and fragrances',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    isActive: 1,
    sortOrder: 6,
    menuOrder: 6,
    showInMenu: 1,
    menuLevel: 0,
    parentId: null,
    productCount: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-baby-care',
    name: 'Baby Care',
    slug: 'baby-care',
    description: 'Gentle and safe baby care products for your little ones',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=400&fit=crop',
    isActive: 1,
    sortOrder: 7,
    menuOrder: 7,
    showInMenu: 1,
    menuLevel: 0,
    parentId: null,
    productCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'cat-wellness',
    name: 'Wellness',
    slug: 'wellness',
    description: 'Health and wellness products for overall well-being',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop',
    isActive: 1,
    sortOrder: 8,
    menuOrder: 8,
    showInMenu: 1,
    menuLevel: 0,
    parentId: null,
    productCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Enhanced database-aware fallback data provider
export const getFallbackData = async (query: string, params: any[] = []): Promise<any[]> => {
  // Safety check for query parameter
  if (!query || typeof query !== 'string') {
    console.warn('⚠️ Invalid query provided to getFallbackData:', query);
    return [];
  }
  
  const lowerQuery = query.toLowerCase();
  
  console.log('🔄 Using dynamic fallback system for query:', query.substring(0, 100) + '...');
  
  // Handle menu items / categories for menu management
  if (lowerQuery.includes('categories') && (lowerQuery.includes('showinmenu') || lowerQuery.includes('menu'))) {
    return fallbackCategories.map(cat => ({
      _id: cat.id,
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      isActive: Boolean(cat.isActive),
      showInMenu: Boolean(cat.showInMenu),
      menuOrder: cat.menuOrder || 0,
      menuLevel: cat.menuLevel || 0,
      parentId: cat.parentId,
      productCount: cat.productCount || 0,
      children: []
    }));
  }
  
  // Handle categories queries
  if (lowerQuery.includes('select') && lowerQuery.includes('categories')) {
    return fallbackCategories;
  }
  
  // Handle products queries
  if (lowerQuery.includes('select') && lowerQuery.includes('products')) {
    let filteredProducts = [...fallbackProducts];
    
    // Apply category filter if present in params
    if (params.length > 0) {
      // Check for category parameter
      const categoryParam = params.find((p, i) => {
        const prevParam = query.split('?')[i - 1] || '';
        return prevParam.toLowerCase().includes('category');
      });
      
      if (categoryParam) {
        filteredProducts = filteredProducts.filter(p => 
          p.category.toLowerCase() === categoryParam.toLowerCase() ||
          p.category.toLowerCase().replace(' ', '') === categoryParam.toLowerCase().replace('-', '')
        );
      }
    }
    
    // Map to match expected structure
    return filteredProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      costPrice: product.originalPrice || product.price * 0.7,
      stock: product.stock,
      sku: `SKU-${product.id}`,
      isActive: product.inStock ? 1 : 0,
      tags: product.tags ? product.tags.join(',') : '',
      weight: 0,
      dimensions: null,
      totalSold: Math.floor(Math.random() * 100),
      averageRating: product.rating,
      reviewCount: product.reviewCount,
      brand: product.brand,
      rating: product.rating,
      sourceUrl: null,
      source: 'fallback-dynamic',
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    }));
  }
  
  // Handle product images queries
  if (lowerQuery.includes('product_images')) {
    const productId = params[0];
    const product = fallbackProducts.find(p => p.id === productId);
    if (product && product.images) {
      return product.images.map((img, index) => ({
        id: index + 1,
        productId: productId,
        url: img.url,
        alt: img.alt,
        sortOrder: index,
        createdAt: new Date().toISOString()
      }));
    }
    return [];
  }
  
  // Handle orders queries
  if (lowerQuery.includes('orders')) {
    // Transform orders to match expected structure
    return fallbackOrders.map(order => ({
      _id: order.id,
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      customer: {
        _id: order.customerId,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone
      },
      customerName: order.customerName,
      items: [],
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      shippingAddress: {
        street: order.shippingAddress,
        city: '',
        state: '',
        zipCode: '',
        country: ''
      },
      notes: order.notes,
      orderDate: order.orderDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));
  }
  
  // Handle count queries
  if (lowerQuery.includes('count(*)') || lowerQuery.includes('count') || lowerQuery.includes('total')) {
    if (lowerQuery.includes('products')) {
      return [{ 'COUNT(*)': fallbackProducts.length, count: fallbackProducts.length, total: fallbackProducts.length }];
    } else if (lowerQuery.includes('categories')) {
      return [{ 'COUNT(*)': fallbackCategories.length, count: fallbackCategories.length, total: fallbackCategories.length }];
    } else if (lowerQuery.includes('orders')) {
      return [{ 'COUNT(*)': fallbackOrders.length, count: fallbackOrders.length, total: fallbackOrders.length }];
    }
    return [{ 'COUNT(*)': 0, count: 0, total: 0 }];
  }
  
  // Default empty response
  console.log('⚠️ No fallback data found for query pattern');
  return [];
};
