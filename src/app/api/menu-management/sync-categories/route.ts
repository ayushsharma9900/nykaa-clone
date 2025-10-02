import { NextRequest, NextResponse } from 'next/server';
import { getAllQuery, runQuery, ensureDatabaseInitialized } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    // Ensure database is initialized (especially important for Vercel)
    await ensureDatabaseInitialized();
    
    console.log('🔄 Menu Management - Syncing categories with menu settings');
    
    // Get all active categories
    const categories = await getAllQuery(
      'SELECT id, name, slug, description, image, isActive FROM categories WHERE isActive = 1'
    );
    
    console.log(`📊 Found ${categories.length} active categories to sync`);
    
    let syncedCount = 0;
    
    // Update each category to ensure menu settings are proper
    for (const category of categories) {
      await runQuery(
        `UPDATE categories SET 
         showInMenu = ?, 
         menuOrder = ?, 
         menuLevel = ?, 
         updatedAt = ?
         WHERE id = ?`,
        [1, syncedCount + 1, 0, new Date().toISOString(), category.id]
      );
      syncedCount++;
    }
    
    console.log(`✅ Successfully synced ${syncedCount} categories`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} categories with menu settings`,
      synced: syncedCount
    });
  } catch (error) {
    console.error('❌ Error syncing categories:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to sync categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
