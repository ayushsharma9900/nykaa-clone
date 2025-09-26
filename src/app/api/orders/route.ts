import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    
    // Forward the request to the backend
    const backendResponse = await fetch(
      `${BACKEND_URL}/api/orders${queryString ? `?${queryString}` : ''}`,
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

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error proxying orders fetch request:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
