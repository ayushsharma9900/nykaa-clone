import { NextRequest, NextResponse } from 'next/server';
import { getAllQuery, runQuery, ensureDatabaseInitialized, generateId } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Import fallback data directly
    const { fallbackCategories } = await import('@/lib/fallback-data');
    
    // Simple pagination
    const startIndex = (page - 1) * limit;
    const paginatedCategories = fallbackCategories.slice(startIndex, startIndex + limit);
    const totalCategories = fallbackCategories.length;
    const totalPages = Math.ceil(totalCategories / limit);
    
    return NextResponse.json({
      success: true,
      data: paginatedCategories,
      pagination: {
        currentPage: page,
        totalPages,
        totalCategories,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch categories',
      data: []
    }, { status: 500 });
  }
}

  }
}

export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized (especially important for Vercel)
    await ensureDatabaseInitialized();
    
    const body = await request.json();
    console.log('🚀 Creating new category:', body);

    // Validation
    if (!body.name || !body.slug || !body.description) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields: name, slug, description'
        },
        { status: 400 }
      );
    }

    // Generate ID if not provided
    const categoryId = body.id || generateId('cat');
    
    // Check if name or slug already exists
    const existingCategory = await getAllQuery(
      'SELECT id FROM categories WHERE (name = ? OR slug = ?) AND id != ?',
      [body.name, body.slug, categoryId]
    );

    if (existingCategory.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Category with this name or slug already exists'
        },
        { status: 400 }
      );
    }

    // Prepare category data
    const categoryData = {
      id: categoryId,
      name: body.name,
      slug: body.slug,
      description: body.description,
      image: body.image || null,
      isActive: body.isActive !== undefined ? (body.isActive ? 1 : 0) : 1,
      sortOrder: parseInt(body.sortOrder || '0'),
      menuOrder: parseInt(body.menuOrder || '0'),
      showInMenu: body.showInMenu !== undefined ? (body.showInMenu ? 1 : 0) : 1,
      menuLevel: parseInt(body.menuLevel || '0'),
      parentId: body.parentId || null
    };

    // Insert category
    await runQuery(`
      INSERT INTO categories (
        id, name, slug, description, image, isActive, sortOrder, 
        menuOrder, showInMenu, menuLevel, parentId, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      categoryData.id, categoryData.name, categoryData.slug, categoryData.description,
      categoryData.image, categoryData.isActive, categoryData.sortOrder,
      categoryData.menuOrder, categoryData.showInMenu, categoryData.menuLevel,
      categoryData.parentId, new Date().toISOString(), new Date().toISOString()
    ]);

    // Get the created category
    const [createdCategory] = await getAllQuery(
      'SELECT *, (SELECT COUNT(*) FROM products WHERE category = categories.name AND isActive = 1) as productCount FROM categories WHERE id = ?',
      [categoryData.id]
    );

    console.log('✅ Category created successfully:', createdCategory);

    return NextResponse.json({
      success: true,
      data: createdCategory,
      message: 'Category created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating category:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create category',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
