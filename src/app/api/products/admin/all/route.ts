import { NextRequest, NextResponse } from 'next/server';
import { getAllQuery, ensureDatabaseInitialized } from '@/lib/database';
import { mapBackendToFrontend } from '@/lib/dataMapper';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    
    // Parse query parameters (validation would go here in a real app)
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '25');
    const offset = (page - 1) * limit;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    
    console.log('🔍 Admin Products API - Parameters:', { page, limit, status, search, category });
    
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
      // Handle both category name and slug
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

    const products = await getAllQuery(sql, [...params, limit, offset]);
    console.log(`📊 Found ${products.length} admin products`);

    // Get images for each product
    const productsWithImages = await Promise.all(
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

    // Map to frontend format
    const mappedProducts = productsWithImages.map(product => {
      return mapBackendToFrontend({
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
        images: product.images ? product.images.map((url: string) => ({ url, alt: product.name })) : [],
        createdAt: product.createdAt,
        updatedAt: product.updatedAt
      });
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
    console.error('❌ Error fetching admin products:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch products',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
