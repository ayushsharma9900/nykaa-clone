import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    
    const { fallbackProducts } = await import('@/lib/fallback-data');
    
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
      },
      message: 'Products loaded successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to load products',
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Product created (demo mode)'
  });
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
