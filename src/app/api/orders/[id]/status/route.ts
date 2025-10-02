import { NextRequest, NextResponse } from 'next/server';
import { runQuery, getQuery, ensureDatabaseInitialized } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Ensure database is initialized (especially important for Vercel)
    await ensureDatabaseInitialized();
    
    const { status } = await request.json();
    const orderId = params.id;
    
    console.log(`🔄 Order Status Update - Order ID: ${orderId}, New Status: ${status}`);
    
    // Validate status value
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        },
        { status: 400 }
      );
    }
    
    // Check if order exists
    const existingOrder = await getQuery(
      'SELECT id FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (!existingOrder) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
        },
        { status: 404 }
      );
    }
    
    // Update order status
    await runQuery(
      'UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?',
      [status, new Date().toISOString(), orderId]
    );
    
    console.log('✅ Order status updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      data: {
        orderId,
        status,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update order status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
