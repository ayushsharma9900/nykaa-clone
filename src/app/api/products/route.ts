import { NextRequest, NextResponse } from 'next/server';
import { getAllQuery, runQuery, ensureDatabaseInitialized, generateId, generateSKU } from '@/lib/database';
import { mapBackendToFrontend } from '@/lib/dataMapper';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

export async function GET() {
  try {
    const { fallbackProducts } = await import('@/lib/fallback-data');
    return NextResponse.json({
      success: true,
      data: fallbackProducts
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: []
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Product created (demo mode)'
  });
}
    
    // Apply category filter
    let filteredProducts = fallbackProducts;
    if (category) {
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
      filteredProducts = fallbackProducts.filter(p => p.category === categoryName);
    }
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) || 
        p.description.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply pagination
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);
    
    return NextResponse.json({
      success: true,
      data: paginatedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch products',
      data: []
    }, { status: 500 });
  }
}

export async function PUT() {
  return NextResponse.json({
    success: true,
    message: 'Product updated (demo mode)'
  });
}

export async function DELETE() {
  return NextResponse.json({
    success: true,
    message: 'Product deleted (demo mode)'
  });
}

function _POST(request: NextRequest) {
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
