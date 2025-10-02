import { NextRequest, NextResponse } from 'next/server';
import { runQuery, ensureDatabaseInitialized } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PUT(request: NextRequest) {
  try {
    // Ensure database is initialized
    await ensureDatabaseInitialized();

    const body = await request.json();
    const items: Array<{
      id: string;
      menuOrder: number;
      level?: number;
      parentId?: string | null;
      showInMenu?: boolean;
    }> = body?.items || [];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No items provided' },
        { status: 400 }
      );
    }

    // Update each item
    for (const item of items) {
      if (!item.id) continue;

      const fields: string[] = [];
      const values: any[] = [];

      if (typeof item.menuOrder === 'number') {
        fields.push('menuOrder = ?');
        values.push(item.menuOrder);
      }
      if (typeof item.level === 'number') {
        fields.push('menuLevel = ?');
        values.push(item.level);
      }
      if (item.parentId !== undefined) {
        fields.push('parentId = ?');
        values.push(item.parentId || null);
      }
      if (typeof item.showInMenu === 'boolean') {
        fields.push('showInMenu = ?');
        values.push(item.showInMenu ? 1 : 0);
      }

      // Always update updatedAt
      fields.push('updatedAt = ?');
      values.push(new Date().toISOString());

      // WHERE id
      values.push(item.id);

      if (fields.length > 1) {
        const sql = `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`;
        await runQuery(sql, values);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Menu order updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating menu order:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update menu order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}