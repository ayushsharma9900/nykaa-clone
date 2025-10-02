import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Safe test endpoint called');
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'status';
    
    // Environment information
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      vercelUrl: process.env.VERCEL_URL || null,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      timestamp: new Date().toISOString()
    };
    
    if (type === 'products') {
      // Return sample products directly without database
      const sampleProducts = [
        {
          id: 'safe-prod-1',
          name: 'Sample Moisturizer',
          category: 'Skincare',
          price: 299,
          originalPrice: 399,
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop',
          inStock: true,
          rating: 4.5,
          reviewCount: 125
        },
        {
          id: 'safe-prod-2', 
          name: 'Sample Foundation',
          category: 'Makeup',
          price: 799,
          originalPrice: 999,
          image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=300&fit=crop',
          inStock: true,
          rating: 4.3,
          reviewCount: 89
        }
      ];
      
      return NextResponse.json({
        success: true,
        data: sampleProducts,
        message: 'Safe test products loaded',
        environment: envInfo,
        source: 'static-test-data'
      });
    }
    
    if (type === 'categories') {
      // Return sample categories directly without database
      const sampleCategories = [
        {
          id: 'safe-cat-1',
          name: 'Skincare',
          slug: 'skincare',
          description: 'Premium skincare products',
          isActive: true,
          productCount: 50
        },
        {
          id: 'safe-cat-2',
          name: 'Makeup', 
          slug: 'makeup',
          description: 'Complete makeup collection',
          isActive: true,
          productCount: 75
        }
      ];
      
      return NextResponse.json({
        success: true,
        data: sampleCategories,
        message: 'Safe test categories loaded',
        environment: envInfo,
        source: 'static-test-data'
      });
    }
    
    // Default status response
    return NextResponse.json({
      success: true,
      status: 'API is working',
      message: 'Safe test endpoint is operational',
      timestamp: new Date().toISOString(),
      environment: envInfo,
      availableTypes: ['status', 'products', 'categories'],
      usage: 'Add ?type=products or ?type=categories to test data endpoints'
    });
    
  } catch (error) {
    console.error('❌ Safe test endpoint error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Safe test endpoint encountered an error',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 200 }); // Return 200 even for errors to avoid 500
  }
}
