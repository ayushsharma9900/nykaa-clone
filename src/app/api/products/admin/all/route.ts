import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { fallbackProducts } = await import('@/lib/fallback-data');
    return NextResponse.json({
      success: true,
      data: fallbackProducts
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: []
    }, { status: 500 });
  }
}