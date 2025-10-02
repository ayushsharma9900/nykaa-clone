import { NextRequest, NextResponse } from 'next/server';
import { runQuery, getAllQuery, initializeDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Manual database initialization requested');
    
    // Force reinitialize the database
    await initializeDatabase();
    
    // Check if tables exist
    const tables = await getAllQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `);
    
    console.log('📋 Tables found:', tables);
    
    // Check categories count
    const categoryCount = await getAllQuery('SELECT COUNT(*) as count FROM categories');
    console.log('📊 Categories count:', categoryCount[0]?.count || 0);
    
    // Check products count  
    const productCount = await getAllQuery('SELECT COUNT(*) as count FROM products');
    console.log('📊 Products count:', productCount[0]?.count || 0);
    
    // Get sample data
    const sampleCategories = await getAllQuery('SELECT * FROM categories LIMIT 3');
    const sampleProducts = await getAllQuery('SELECT * FROM products LIMIT 3');
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      data: {
        tables: tables.map(t => t.name),
        counts: {
          categories: categoryCount[0]?.count || 0,
          products: productCount[0]?.count || 0
        },
        samples: {
          categories: sampleCategories,
          products: sampleProducts
        }
      }
    });
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database initialization failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Database status check requested');
    
    // Check if tables exist
    const tables = await getAllQuery(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).catch(() => []);
    
    console.log('📋 Tables found:', tables);
    
    if (tables.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No database tables found',
        data: {
          tables: [],
          counts: { categories: 0, products: 0 },
          suggestions: ['Run POST /api/admin/init-db to initialize database']
        }
      });
    }
    
    // Check data counts
    const categoryCount = await getAllQuery('SELECT COUNT(*) as count FROM categories').catch(() => [{ count: 0 }]);
    const productCount = await getAllQuery('SELECT COUNT(*) as count FROM products').catch(() => [{ count: 0 }]);
    
    // Get sample data
    const sampleCategories = await getAllQuery('SELECT id, name, isActive FROM categories LIMIT 5').catch(() => []);
    const sampleProducts = await getAllQuery('SELECT id, name, category, price, stock FROM products LIMIT 5').catch(() => []);
    
    return NextResponse.json({
      success: true,
      message: 'Database status retrieved',
      data: {
        tables: tables.map(t => t.name),
        counts: {
          categories: categoryCount[0]?.count || 0,
          products: productCount[0]?.count || 0
        },
        samples: {
          categories: sampleCategories,
          products: sampleProducts
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          platform: process.platform,
          cwd: process.cwd()
        }
      }
    });
  } catch (error) {
    console.error('❌ Database status check failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Database status check failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
