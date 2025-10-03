import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(_request: NextRequest) {
  const checks: Record<string, unknown> = {};
  const now = new Date().toISOString();
  
  try {
    // Environment checks
    checks.environment = {
      nodeEnv: process.env.NODE_ENV,
      vercel: !!process.env.VERCEL,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      timestamp: now
    };

    // Database availability check
    try {
      const { ensureDatabaseInitialized, getAllQuery } = await import('@/lib/database');
      
      // Try to initialize database
      await ensureDatabaseInitialized();
      checks.database = {
        status: 'available',
        type: process.env.POSTGRES_URL ? 'postgresql' : 'fallback',
        initialized: true
      };
      
      // Try a simple query
      try {
        const testQuery = await getAllQuery('SELECT 1 as test LIMIT 1', []);
        checks.database.queryTest = 'success';
        checks.database.queryResult = testQuery;
      } catch (queryError) {
        checks.database.queryTest = 'failed';
        checks.database.queryError = queryError instanceof Error ? queryError.message : 'Unknown error';
      }
      
    } catch (dbError) {
      checks.database = {
        status: 'error',
        error: dbError instanceof Error ? dbError.message : 'Unknown database error',
        fallbackMode: true
      };
    }

    // Fallback data check
    try {
      const { fallbackProducts, fallbackCategories } = await import('@/lib/fallback-data');
      checks.fallback = {
        status: 'available',
        productsCount: fallbackProducts.length,
        categoriesCount: fallbackCategories.length
      };
    } catch (fallbackError) {
      checks.fallback = {
        status: 'error',
        error: fallbackError instanceof Error ? fallbackError.message : 'Fallback data error'
      };
    }

    // API routes check
    checks.api = {
      status: 'healthy',
      timestamp: now,
      version: '1.0.0'
    };

    // Overall health status
    const isHealthy = checks.database?.status !== 'critical' && checks.fallback?.status === 'available';
    
    return NextResponse.json({
      success: true,
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: now,
      checks
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      timestamp: now,
      error: error instanceof Error ? error.message : 'Health check failed',
      checks
    }, { status: 500 });
  }
}
