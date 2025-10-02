import { NextRequest, NextResponse } from 'next/server';
import { runQuery, getQuery, ensureDatabaseInitialized } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Ensure database is initialized (especially important for Vercel)
    await ensureDatabaseInitialized();
    
    const itemId = params.id;
    const body = await request.json();
    const { showInMenu } = body;
    
    console.log(`🔄 Menu Management - Toggling visibility for item ${itemId}:`, { showInMenu });
    
    // Validate the item exists
    const existingItem = await getQuery(
      'SELECT id, name FROM categories WHERE id = ?',
      [itemId]
    );
    
    if (!existingItem) {
      return NextResponse.json(
        {
          success: false,
          message: 'Menu item not found',
        },
        { status: 404 }
      );
    }
    
    // Update the showInMenu status
    await runQuery(
      'UPDATE categories SET showInMenu = ?, updatedAt = ? WHERE id = ?',
      [showInMenu ? 1 : 0, new Date().toISOString(), itemId]
    );
    
    console.log(`✅ Menu item ${itemId} visibility updated successfully`);
    
    return NextResponse.json({
      success: true,
      message: `Menu item ${showInMenu ? 'shown in' : 'hidden from'} menu successfully`,
      data: {
        id: itemId,
        name: existingItem.name,
        showInMenu: Boolean(showInMenu),
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error updating menu item visibility:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update menu item visibility',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
