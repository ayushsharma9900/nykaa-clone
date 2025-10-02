import { NextRequest, NextResponse } from 'next/server';
import { getAllQuery, runQuery, generateId } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;
    const active = searchParams.get('active');
    const search = searchParams.get('search');
    const showAll = searchParams.get('showAll');
    
    console.log('🔍 Categories API - Parameters:', { page, limit, active, search, showAll });
    
    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (active !== undefined) {
      whereClause += ' AND isActive = ?';
      params.push(active === 'true' ? 1 : 0);
    }
    
    if (search) {
      whereClause += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get categories with product counts
    const sql = `
      SELECT 
        id,
        name,
        slug,
        description,
        image,
        isActive,
        sortOrder,
        menuOrder,
        showInMenu,
        menuLevel,
        parentId,
        createdAt,
        updatedAt,
        (SELECT COUNT(*) FROM products WHERE category = categories.name AND isActive = 1) as productCount
      FROM categories 
      ${whereClause}
      ORDER BY sortOrder ASC, createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const categories = await getAllQuery(sql, [...params, limit, offset]);
    console.log(`📊 Found ${categories.length} categories`);

    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM categories ${whereClause}`;
    const [countResult] = await getAllQuery(countSql, params);
    const totalCategories = countResult?.total || 0;
    const totalPages = Math.ceil(totalCategories / limit);

    return NextResponse.json({
      success: true,
      data: categories,
      pagination: {
        currentPage: page,
        totalPages,
        totalCategories,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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
