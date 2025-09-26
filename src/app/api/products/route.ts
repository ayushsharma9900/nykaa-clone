import { NextRequest, NextResponse } from 'next/server';
import { mapBackendToFrontend, mapFrontendToBackend } from '@/lib/dataMapper';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

interface BackendProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  sku: string;
  isActive: boolean;
  totalSold?: number;
  averageRating?: number;
  reviewCount?: number;
  tags?: string[];
  images?: Array<{ url: string; alt: string }>;
  createdAt: string;
  updatedAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // Forward the request to the backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/products${queryString ? `?${queryString}` : ''}`,
      {
        method: 'GET',
        headers: {
          // Forward authorization header if present
          ...(request.headers.get('authorization') && {
            authorization: request.headers.get('authorization')!,
          }),
        },
      }
    );

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(responseData, {
        status: backendResponse.status,
      });
    }

    // Map backend products to frontend format
    if (responseData.success && responseData.data) {
      const mappedProducts = (responseData.data as BackendProduct[]).map(mapBackendToFrontend);
      return NextResponse.json({
        ...responseData,
        data: mappedProducts
      });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error proxying products fetch request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // If this is frontend product data, map it to backend format
    let backendData = body;
    if (body.id !== undefined || body.stockCount !== undefined) {
      // This looks like frontend data, map it
      backendData = mapFrontendToBackend(body);
    }

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          authorization: request.headers.get('authorization')!,
        }),
      },
      body: JSON.stringify(backendData),
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(responseData, {
        status: backendResponse.status,
      });
    }

    // Map the created product back to frontend format
    if (responseData.success && responseData.data) {
      const mappedProduct = mapBackendToFrontend(responseData.data as BackendProduct);
      return NextResponse.json({
        ...responseData,
        data: mappedProduct
      });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error proxying product create request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
