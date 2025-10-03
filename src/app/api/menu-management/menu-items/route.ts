import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
