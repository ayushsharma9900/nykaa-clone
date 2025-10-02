import { NextRequest, NextResponse } from 'next/server';
import { getAllQuery, ensureDatabaseInitialized } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized (especially important for Vercel)
    await ensureDatabaseInitialized();
    
    console.log('🔍 Menu Items API - Fetching categories for menu');
    
    // Get categories that should be shown in menu
    const sql = `
      SELECT 
        id as _id,
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
        (SELECT COUNT(*) FROM products WHERE category = categories.name AND isActive = 1) as productCount
      FROM categories 
      WHERE showInMenu = 1 AND isActive = 1
      ORDER BY menuOrder ASC, sortOrder ASC, name ASC
    `;

    const categories = await getAllQuery(sql);
    console.log(`📊 Found ${categories.length} menu categories`);
    
    // Transform the data to match the expected MenuItem interface
    const menuItems = categories.map(category => ({
      _id: category._id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      isActive: Boolean(category.isActive),
      showInMenu: Boolean(category.showInMenu),
      menuOrder: category.menuOrder || 0,
      menuLevel: category.menuLevel || 0,
      parentId: category.parentId,
      productCount: category.productCount || 0,
      children: [] // For now, we'll keep it simple without hierarchical structure
    }));

    console.log('✅ Menu items prepared:', menuItems.map(m => ({ name: m.name, productCount: m.productCount })));

    return NextResponse.json({
      success: true,
      data: menuItems,
      message: `Found ${menuItems.length} menu items`
    });
  } catch (error) {
    console.error('❌ Error fetching menu items:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch menu items',
        error: error instanceof Error ? error.message : 'Unknown error',
        data: []
      },
      { status: 500 }
    );
  }
}
