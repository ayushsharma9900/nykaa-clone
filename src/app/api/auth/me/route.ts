import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Simple token validation for demo
    if (token.startsWith('kaaya.')) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          
          // Check if token is expired
          if (payload.exp && payload.exp < Date.now()) {
            return NextResponse.json(
              { success: false, message: 'Token expired' },
              { status: 401 }
            );
          }
          
          // Return user info
          return NextResponse.json({
            success: true,
            data: {
              user: {
                email: payload.email,
                name: payload.name,
                role: payload.role,
                userId: payload.userId
              }
            }
          });
        }
      } catch (error) {
        console.error('Token validation error:', error);
      }
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    );

  } catch (error) {
    console.error('❌ Auth validation error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
