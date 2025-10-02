import { NextRequest, NextResponse } from 'next/server';
import { getQuery, runQuery, ensureDatabaseInitialized } from '@/lib/database';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Ensure database is initialized (especially important for Vercel)
    await ensureDatabaseInitialized();
    
    const orderId = params.id;
    console.log(`🔍 Orders API - Fetching order ${orderId}`);
    
    // Get specific order
    const order = await getQuery(
      `SELECT 
        id,
        invoiceNumber,
        customerId,
        customerName,
        customerEmail,
        customerPhone,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        status,
        paymentStatus,
        paymentMethod,
        shippingAddress,
        notes,
        orderDate,
        createdAt,
        updatedAt
      FROM orders 
      WHERE id = ?`,
      [orderId]
    );
    
    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
        },
        { status: 404 }
      );
    }
    
    // Transform order to match expected structure with customer object
    const transformedOrder = {
      _id: order.id,
      id: order.id,
      invoiceNumber: order.invoiceNumber,
      customer: {
        _id: order.customerId,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone
      },
      customerName: order.customerName,
      items: [], // TODO: Implement order items if needed
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      discount: order.discount,
      total: order.total,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      shippingAddress: typeof order.shippingAddress === 'string' 
        ? {
            street: order.shippingAddress,
            city: '',
            state: '',
            zipCode: '',
            country: ''
          }
        : order.shippingAddress,
      notes: order.notes,
      orderDate: order.orderDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    };
    
    console.log(`📊 Found order: ${order.invoiceNumber}`);
    
    return NextResponse.json({
      success: true,
      data: transformedOrder
    });
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Ensure database is initialized (especially important for Vercel)
    await ensureDatabaseInitialized();
    
    const orderId = params.id;
    const body = await request.json();
    
    console.log(`🔄 Orders API - Updating order ${orderId}:`, body);
    
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
    
    // Build update query based on provided fields
    const updateFields = [];
    const updateValues = [];
    
    if (body.status !== undefined) {
      updateFields.push('status = ?');
      updateValues.push(body.status);
    }
    
    if (body.paymentStatus !== undefined) {
      updateFields.push('paymentStatus = ?');
      updateValues.push(body.paymentStatus);
    }
    
    if (body.customerName !== undefined) {
      updateFields.push('customerName = ?');
      updateValues.push(body.customerName);
    }
    
    if (body.customerEmail !== undefined) {
      updateFields.push('customerEmail = ?');
      updateValues.push(body.customerEmail);
    }
    
    if (body.customerPhone !== undefined) {
      updateFields.push('customerPhone = ?');
      updateValues.push(body.customerPhone);
    }
    
    if (body.shippingAddress !== undefined) {
      const addressString = typeof body.shippingAddress === 'object' 
        ? body.shippingAddress.street || JSON.stringify(body.shippingAddress)
        : body.shippingAddress;
      updateFields.push('shippingAddress = ?');
      updateValues.push(addressString);
    }
    
    if (body.notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(body.notes);
    }
    
    // Always update the updatedAt timestamp
    updateFields.push('updatedAt = ?');
    updateValues.push(new Date().toISOString());
    
    // Add the order ID for the WHERE clause
    updateValues.push(orderId);
    
    if (updateFields.length === 1) { // Only updatedAt
      return NextResponse.json({
        success: true,
        message: 'No changes to update'
      });
    }
    
    // Execute the update
    const updateSql = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`;
    await runQuery(updateSql, updateValues);
    
    console.log(`✅ Order ${orderId} updated successfully`);
    
    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      data: {
        id: orderId,
        ...body,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update order',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
