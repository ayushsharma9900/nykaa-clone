import { NextResponse } from 'next/server';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { fallbackCategories } = await import('@/lib/fallback-data');
    return NextResponse.json({
      success: true,
      data: fallbackCategories
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: []
    }, { status: 500 });
  }
}

  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Category created (demo mode)'
  });
}
