import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { fallbackProducts } = await import('@/lib/fallback-data');
    return NextResponse.json({
      success: true,
      data: fallbackProducts,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalProducts: fallbackProducts.length,
        hasNextPage: false,
        hasPrevPage: false
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to load products',
      data: []
    }, { status: 500 });
  }
}