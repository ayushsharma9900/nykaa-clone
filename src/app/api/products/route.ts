import { NextRequest, NextResponse } from 'next/server';
import { getAllQuery, runQuery, generateId, generateSKU, ensureDatabaseInitialized } from '@/lib/database';
import { mapBackendToFrontend } from '@/lib/dataMapper';

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  sku: string;
  isActive: boolean;
  totalSold?: number;
  averageRating?: number;
  reviewCount?: number;
  tags?: string;
  weight?: number;
  dimensions?: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
}

// Helper function to get product images
const getProductImages = async (productId: string): Promise<string[]> => {
  const images = await getAllQuery(
    'SELECT url FROM product_images WHERE productId = ? ORDER BY sortOrder ASC',
    [productId]
  );
  return images.map((img: any) => img.url);
};

export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized (especially important for Vercel)
    await ensureDatabaseInitialized();
    
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    
    console.log('🔍 Products API - Parameters:', { page, limit, category, search, status });
    
    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (status === 'active') {
      whereClause += ' AND isActive = ?';
      params.push(1);
    } else if (status === 'inactive') {
      whereClause += ' AND isActive = ?';
      params.push(0);
    }
    
    if (category) {
      // Map common slugs to category names
      const slugToNameMap: Record<string, string> = {
        'makeup': 'Makeup',
        'skincare': 'Skincare', 
        'hair-care': 'Hair Care',
        'haircare': 'Hair Care',
        'fragrance': 'Fragrance',
        'personal-care': 'Personal Care',
        'mens-grooming': "Men's Grooming",
        'baby-care': 'Baby Care',
        'wellness': 'Wellness'
      };
      
      const categoryName = slugToNameMap[category.toLowerCase()] || category;
      whereClause += ' AND category = ?';
      params.push(categoryName);
    }
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ? OR sku LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Get products
    const sql = `
      SELECT 
        id,
        name,
        description,
        category,
        price,
        costPrice,
        stock,
        sku,
        isActive,
        tags,
        weight,
        dimensions,
        totalSold,
        averageRating,
        reviewCount,
        createdAt,
        updatedAt
      FROM products 
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `;

    console.log('📋 SQL Query:', sql);
    console.log('📋 Parameters:', [...params, limit, offset]);

    const products = await getAllQuery(sql, [...params, limit, offset]);
    console.log(`📊 Found ${products.length} products`);

    // Get images for each product
    const productsWithImages: DatabaseProduct[] = await Promise.all(
      products.map(async (product: any) => {
        const images = await getProductImages(product.id);
        return {
          ...product,
          images
        };
      })
    );

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM products ${whereClause}`;
    const [countResult] = await getAllQuery(countSql, params);
    const totalProducts = countResult?.total || 0;
    const totalPages = Math.ceil(totalProducts / limit);
    
    console.log('📊 Pagination:', { totalProducts, totalPages, currentPage: page });

    // Map to frontend format
    const mappedProducts = productsWithImages.map(product => {
      const frontendProduct = mapBackendToFrontend({
        _id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        costPrice: product.costPrice,
        stock: product.stock,
        sku: product.sku,
        isActive: product.isActive,
        totalSold: product.totalSold || 0,
        averageRating: product.averageRating || 0,
        reviewCount: product.reviewCount || 0,
        tags: product.tags ? [product.tags] : [],
        images: product.images ? product.images.map(url => ({ url, alt: product.name })) : [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      });
      
      return frontendProduct;
    });

    return NextResponse.json({
      success: true,
      data: mappedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    
    // Fallback to static data for Vercel deployment
    const fallbackProducts = [
      {
        id: 'prod-1',
        _id: 'prod-1',
        name: 'Hydrating Face Serum',
        description: 'A deeply hydrating face serum with hyaluronic acid for plump, moisturized skin.',
        category: 'Skincare',
        price: 29.99,
        originalPrice: 39.99,
        costPrice: 20.00,
        stock: 50,
        sku: 'SER-HYD-001',
        isActive: true,
        rating: 4.5,
        reviewCount: 234,
        totalSold: 150,
        averageRating: 4.5,
        tags: ['hydrating', 'anti-aging', 'sensitive-skin'],
        images: [{ url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop', alt: 'Hydrating Face Serum' }],
        createdAt: new Date('2024-01-15').toISOString(),
        updatedAt: new Date('2024-01-15').toISOString()
      },
      {
        id: 'prod-2',
        _id: 'prod-2',
        name: 'Matte Lipstick - Ruby Red',
        description: 'Long-lasting matte lipstick in a bold ruby red shade. Comfortable wear all day.',
        category: 'Makeup',
        price: 18.99,
        originalPrice: 24.99,
        costPrice: 12.00,
        stock: 75,
        sku: 'LIP-MAT-002',
        isActive: true,
        rating: 4.7,
        reviewCount: 189,
        totalSold: 89,
        averageRating: 4.7,
        tags: ['matte', 'long-lasting', 'bold'],
        images: [{ url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop', alt: 'Matte Lipstick - Ruby Red' }],
        createdAt: new Date('2024-01-10').toISOString(),
        updatedAt: new Date('2024-01-10').toISOString()
      },
      {
        id: 'prod-3',
        _id: 'prod-3',
        name: 'Vitamin C Brightening Mask',
        description: 'Brightening face mask infused with vitamin C to revitalize dull skin.',
        category: 'Skincare',
        price: 35.99,
        originalPrice: 45.99,
        costPrice: 25.00,
        stock: 30,
        sku: 'MSK-VIC-003',
        isActive: true,
        rating: 4.3,
        reviewCount: 156,
        totalSold: 67,
        averageRating: 4.3,
        tags: ['brightening', 'vitamin-c', 'weekly-treatment'],
        images: [{ url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', alt: 'Vitamin C Brightening Mask' }],
        createdAt: new Date('2024-01-12').toISOString(),
        updatedAt: new Date('2024-01-12').toISOString()
      },
      {
        id: 'prod-4',
        _id: 'prod-4',
        name: 'Waterproof Mascara',
        description: 'Volumizing waterproof mascara that lasts all day without smudging.',
        category: 'Makeup',
        price: 22.99,
        originalPrice: 28.99,
        costPrice: 15.00,
        stock: 60,
        sku: 'MSC-WAT-004',
        isActive: true,
        rating: 4.6,
        reviewCount: 298,
        totalSold: 145,
        averageRating: 4.6,
        tags: ['waterproof', 'volumizing', 'long-lasting'],
        images: [{ url: 'https://images.unsplash.com/photo-1631214540359-e5c3c5ec1ea8?w=400&h=400&fit=crop', alt: 'Waterproof Mascara' }],
        createdAt: new Date('2024-01-08').toISOString(),
        updatedAt: new Date('2024-01-08').toISOString()
      },
      {
        id: 'prod-5',
        _id: 'prod-5',
        name: 'Rose Perfume',
        description: 'Elegant rose fragrance for special occasions with long-lasting scent.',
        category: 'Fragrance',
        price: 59.99,
        originalPrice: 75.99,
        costPrice: 40.00,
        stock: 25,
        sku: 'PRF-ROS-005',
        isActive: true,
        rating: 4.4,
        reviewCount: 167,
        totalSold: 78,
        averageRating: 4.4,
        tags: ['rose', 'luxury', 'long-lasting'],
        images: [{ url: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop', alt: 'Rose Perfume' }],
        createdAt: new Date('2024-01-14').toISOString(),
        updatedAt: new Date('2024-01-14').toISOString()
      },
      {
        id: 'prod-6',
        _id: 'prod-6',
        name: 'Nourishing Shampoo',
        description: 'Gentle nourishing shampoo for all hair types with natural ingredients.',
        category: 'Hair Care',
        price: 19.99,
        originalPrice: 25.99,
        costPrice: 12.00,
        stock: 45,
        sku: 'SHP-NOU-006',
        isActive: true,
        rating: 4.2,
        reviewCount: 203,
        totalSold: 123,
        averageRating: 4.2,
        tags: ['nourishing', 'natural', 'all-hair-types'],
        images: [{ url: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400&h=400&fit=crop', alt: 'Nourishing Shampoo' }],
        createdAt: new Date('2024-01-07').toISOString(),
        updatedAt: new Date('2024-01-07').toISOString()
      }
    ];
    
    // Filter products based on request parameters if possible
    let filteredProducts = [...fallbackProducts];
    
    try {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');
      const search = searchParams.get('search');
      
      if (category) {
        const slugToNameMap: Record<string, string> = {
          'makeup': 'Makeup',
          'skincare': 'Skincare', 
          'hair-care': 'Hair Care',
          'haircare': 'Hair Care',
          'fragrance': 'Fragrance'
        };
        const categoryName = slugToNameMap[category.toLowerCase()] || category;
        filteredProducts = filteredProducts.filter(p => 
          p.category.toLowerCase() === categoryName.toLowerCase()
        );
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }
    } catch (e) {
      // If URL parsing fails, use all fallback products
    }
    
    // Map to frontend format
    const mappedProducts = filteredProducts.map(product => {
      try {
        // Convert to backend format first for proper mapping
        const backendProduct = {
          id: product.id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          costPrice: product.costPrice || product.price * 0.8,
          stock: product.stock,
          sku: product.sku,
          isActive: product.isActive,
          totalSold: product.totalSold || 0,
          averageRating: product.averageRating || product.rating || 0,
          reviewCount: product.reviewCount || 0,
          tags: Array.isArray(product.tags) ? product.tags : [],
          images: Array.isArray(product.images) ? product.images.map(img => typeof img === 'string' ? img : img.url) : [],
          createdAt: product.createdAt || new Date().toISOString(),
          updatedAt: product.updatedAt || new Date().toISOString()
        };
        
        return mapBackendToFrontend(backendProduct);
      } catch (error) {
        console.error('Mapping error for product:', product.name, error);
        // If mapping fails, return product in a compatible format
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          originalPrice: product.originalPrice,
          category: product.category,
          brand: 'kaayalife',
          image: Array.isArray(product.images) && product.images.length > 0 
            ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
            : 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop',
          images: Array.isArray(product.images) 
            ? product.images.map(img => typeof img === 'string' ? img : img.url)
            : ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop'],
          inStock: product.isActive && product.stock > 0,
          stockCount: product.stock,
          rating: product.rating || product.averageRating || 0,
          reviewCount: product.reviewCount || 0,
          tags: Array.isArray(product.tags) ? product.tags : [],
          createdAt: new Date(product.createdAt || Date.now()),
          updatedAt: new Date(product.updatedAt || Date.now()),
          isFeatured: true,
          variants: [],
          specifications: {},
          seoTitle: product.name,
          seoDescription: product.description,
          slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          subcategory: ''
        };
      }
    });
    
    console.log('🔄 Using fallback products data, count:', mappedProducts.length);
    return NextResponse.json({
      success: true,
      data: mappedProducts,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: mappedProducts.length,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized (especially important for Vercel)
    await ensureDatabaseInitialized();
    
    const body = await request.json();
    console.log('🚀 Creating new product:', body);

    // Validation
    if (!body.name || !body.description || !body.category || !body.price) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: name, description, category, price'
        },
        { status: 400 }
      );
    }

    // Generate ID and SKU if not provided
    const productId = body.id || generateId('prod');
    const productSKU = body.sku || generateSKU(body.name, body.category);
    
    console.log('Generated ID:', productId, 'SKU:', productSKU);

    // Check if SKU already exists
    const existingProduct = await getAllQuery(
      'SELECT id FROM products WHERE sku = ? AND id != ?',
      [productSKU, productId]
    );

    if (existingProduct.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'A product with this SKU already exists'
        },
        { status: 400 }
      );
    }

    // Prepare product data
    const productData = {
      id: productId,
      name: body.name,
      description: body.description,
      category: body.category,
      price: parseFloat(body.price),
      costPrice: parseFloat(body.costPrice || body.price),
      stock: parseInt(body.stock || body.stockCount || '0'),
      sku: productSKU,
      isActive: body.isActive !== undefined ? (body.isActive ? 1 : 0) : 1,
      tags: body.tags ? (Array.isArray(body.tags) ? body.tags.join(',') : body.tags) : null,
      weight: body.weight ? parseFloat(body.weight) : 0,
      dimensions: body.dimensions || null,
      totalSold: 0,
      averageRating: 0,
      reviewCount: 0
    };

    // Insert product
    await runQuery(`
      INSERT INTO products (
        id, name, description, category, price, costPrice, stock, sku, 
        isActive, tags, weight, dimensions, totalSold, averageRating, reviewCount,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      productData.id, productData.name, productData.description, productData.category,
      productData.price, productData.costPrice, productData.stock, productData.sku,
      productData.isActive, productData.tags, productData.weight, productData.dimensions,
      productData.totalSold, productData.averageRating, productData.reviewCount,
      new Date().toISOString(), new Date().toISOString()
    ]);

    // Add product images if provided
    if (body.images && Array.isArray(body.images)) {
      for (let i = 0; i < body.images.length; i++) {
        const image = body.images[i];
        const imageUrl = typeof image === 'string' ? image : image.url;
        const imageAlt = typeof image === 'string' ? body.name : (image.alt || body.name);
        
        await runQuery(`
          INSERT INTO product_images (productId, url, alt, sortOrder)
          VALUES (?, ?, ?, ?)
        `, [productData.id, imageUrl, imageAlt, i]);
      }
    } else if (body.image) {
      // Single image fallback
      await runQuery(`
        INSERT INTO product_images (productId, url, alt, sortOrder)
        VALUES (?, ?, ?, ?)
      `, [productData.id, body.image, body.name, 0]);
    }

    // Get the created product with images
    const [createdProduct] = await getAllQuery(
      'SELECT * FROM products WHERE id = ?',
      [productData.id]
    );
    
    const images = await getProductImages(productData.id);
    const productWithImages = {
      ...createdProduct,
      images
    };

    // Map to frontend format
    const mappedProduct = mapBackendToFrontend({
      _id: productWithImages.id,
      name: productWithImages.name,
      description: productWithImages.description,
      category: productWithImages.category,
      price: productWithImages.price,
      costPrice: productWithImages.costPrice,
      stock: productWithImages.stock,
      sku: productWithImages.sku,
      isActive: productWithImages.isActive,
      totalSold: productWithImages.totalSold || 0,
      averageRating: productWithImages.averageRating || 0,
      reviewCount: productWithImages.reviewCount || 0,
      tags: productWithImages.tags ? [productWithImages.tags] : [],
      images: images.map(url => ({ url, alt: productWithImages.name })),
      createdAt: productWithImages.createdAt,
      updatedAt: productWithImages.updatedAt
    });

    console.log('✅ Product created successfully:', mappedProduct);

    return NextResponse.json({
      success: true,
      data: mappedProduct,
      message: 'Product created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create product',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
