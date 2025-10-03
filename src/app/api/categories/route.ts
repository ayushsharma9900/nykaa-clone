import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { fallbackCategories } = await import('@/lib/fallback-data');
    return NextResponse.json({
      success: true,
      data: fallbackCategories,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCategories: fallbackCategories.length,
        hasNextPage: false,
        hasPrevPage: false
      },
      message: 'Categories loaded successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to load categories',
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCategories: 0,
        hasNextPage: false,
        hasPrevPage: false
      }
    }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Category created (demo mode)'
  });
}
