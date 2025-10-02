import { NextRequest, NextResponse } from 'next/server';
import { getAllQuery, ensureDatabaseInitialized } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Ensure database is initialized (especially important for Vercel)
    await ensureDatabaseInitialized();
    
    console.log('🔍 Orders API - Fetching orders');
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const offset = (page - 1) * limit;
    
    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    
    if (status && status !== 'all') {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    
    if (search) {
      whereClause += ' AND (invoiceNumber LIKE ? OR customerName LIKE ? OR customerEmail LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    // Get orders
    const sql = `
      SELECT 
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
      ${whereClause}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `;
    
    const orders = await getAllQuery(sql, [...params, limit, offset]);
    console.log(`📊 Found ${orders.length} orders`);
    
    // Get total count for pagination
    const countSql = `SELECT COUNT(*) as total FROM orders ${whereClause}`;
    const [countResult] = await getAllQuery(countSql, params);
    const totalOrders = countResult?.total || 0;
    const totalPages = Math.ceil(totalOrders / limit);
    
    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
