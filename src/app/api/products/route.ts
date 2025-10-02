import { NextRequest, NextResponse } from 'next/server';
import { getAllQuery, runQuery, generateId, generateSKU } from '@/lib/database';
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
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
