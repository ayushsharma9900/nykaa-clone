import { NextRequest, NextResponse } from 'next/server';
import { runQuery, getQuery, ensureDatabaseInitialized } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Ensure database is initialized (especially important for Vercel)
    await ensureDatabaseInitialized();
    
    const { id: itemId } = await params;
    const body = await request.json();
    
    console.log(`🔄 Menu Management - Updating item ${itemId}:`, body);
    
    // Validate the item exists
    const existingItem = await getQuery(
      'SELECT id FROM categories WHERE id = ?',
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
    
    // Build update query based on provided fields
    const updateFields = [];
    const updateValues = [];
    
    if (body.name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(body.name);
    }
    
    if (body.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(body.description);
    }
    
    if (body.showInMenu !== undefined) {
      updateFields.push('showInMenu = ?');
      updateValues.push(body.showInMenu ? 1 : 0);
    }
    
    if (body.menuOrder !== undefined) {
      updateFields.push('menuOrder = ?');
      updateValues.push(body.menuOrder);
    }
    
    if (body.menuLevel !== undefined) {
      updateFields.push('menuLevel = ?');
      updateValues.push(body.menuLevel);
    }
    
    if (body.isActive !== undefined) {
      updateFields.push('isActive = ?');
      updateValues.push(body.isActive ? 1 : 0);
    }
    
    // Always update the updatedAt timestamp
    updateFields.push('updatedAt = ?');
    updateValues.push(new Date().toISOString());
    
    // Add the item ID for the WHERE clause
    updateValues.push(itemId);
    
    if (updateFields.length === 1) { // Only updatedAt
      return NextResponse.json({
        success: true,
        message: 'No changes to update'
      });
    }
    
    // Execute the update
    const updateSql = `UPDATE categories SET ${updateFields.join(', ')} WHERE id = ?`;
    await runQuery(updateSql, updateValues);
    
    console.log(`✅ Menu item ${itemId} updated successfully`);
    
    return NextResponse.json({
      success: true,
      message: 'Menu item updated successfully',
      data: {
        id: itemId,
        ...body,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error updating menu item:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update menu item',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
