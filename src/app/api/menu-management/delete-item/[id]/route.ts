import { NextRequest, NextResponse } from 'next/server';
import { runQuery, getQuery, ensureDatabaseInitialized } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Ensure database is initialized (especially important for Vercel)
    await ensureDatabaseInitialized();
    
    const { id: itemId } = await params;
    
    console.log(`🗑️ Menu Management - Deleting item ${itemId}`);
    
    // Check if the item exists
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
    
    // Check if there are products associated with this category
    const productCount = await getQuery(
      'SELECT COUNT(*) as count FROM products WHERE category = ?',
      [existingItem.name]
    );
    
    if (productCount && productCount.count > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete category "${existingItem.name}" because it has ${productCount.count} products associated with it. Please move or delete these products first.`,
        },
        { status: 400 }
      );
    }
    
    // Delete the category
    await runQuery('DELETE FROM categories WHERE id = ?', [itemId]);
    
    console.log(`✅ Menu item ${itemId} deleted successfully`);
    
    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
      data: {
        id: itemId,
        name: existingItem.name
      }
    });
  } catch (error) {
    console.error('❌ Error deleting menu item:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to delete menu item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
