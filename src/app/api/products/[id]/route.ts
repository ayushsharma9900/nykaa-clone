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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
      method: 'GET',
      headers: {
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          authorization: request.headers.get('authorization')!,
        }),
      },
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(responseData, {
        status: backendResponse.status,
      });
    }

    // Map backend product to frontend format
    if (responseData.success && responseData.data) {
      const raw = responseData.data as any;
      const normalized = {
        ...raw,
        id: raw.id || raw._id,
        images: Array.isArray(raw.images)
          ? (typeof raw.images[0] === 'string' ? raw.images : raw.images.map((i: any) => i?.url).filter((u: any) => typeof u === 'string'))
          : []
      };
      const mappedProduct = mapBackendToFrontend(normalized);
      return NextResponse.json({
        ...responseData,
        data: mappedProduct
      });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error proxying product fetch request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id: productId } = await params;

    // If this is frontend product data, map it to backend format
    let backendData = body;
    if (body.id !== undefined || body.stockCount !== undefined) {
      // This looks like frontend data, map it
      backendData = mapFrontendToBackend(body);
    }

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
      method: 'PUT',
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

    // Map the updated product back to frontend format
    if (responseData.success && responseData.data) {
      const mappedProduct = mapBackendToFrontend(responseData.data as BackendProduct);
      return NextResponse.json({
        ...responseData,
        data: mappedProduct
      });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error proxying product update request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // Forward the request to the backend
    const backendResponse = await fetch(`${BACKEND_URL}/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        // Forward authorization header if present
        ...(request.headers.get('authorization') && {
          authorization: request.headers.get('authorization')!,
        }),
      },
    });

    const responseData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(responseData, {
        status: backendResponse.status,
      });
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error proxying product delete request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
