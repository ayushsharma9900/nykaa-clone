import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mockOrders = [
    {
      id: 'ord-001',
      invoiceNumber: 'INV-001',
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      total: 1299.00,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    }
  ];

  return NextResponse.json({
    success: true,
    data: mockOrders
  });
}