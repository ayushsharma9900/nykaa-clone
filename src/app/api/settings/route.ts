import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mockSettings = {
    siteName: 'KaayaLife',
    siteDescription: 'Premium Beauty & Wellness Products',
    currency: 'INR',
    taxRate: 18,
    shippingFee: 50
  };

  return NextResponse.json({
    success: true,
    data: mockSettings
  });
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Settings updated (demo mode)'
  });
}