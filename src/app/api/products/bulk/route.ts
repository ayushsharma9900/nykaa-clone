import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  return NextResponse.json({
    success: true,
    message: 'Products deleted (demo mode)'
  });
}

export async function PATCH() {
  return NextResponse.json({
    success: true,
    message: 'Products updated (demo mode)'
  });
}