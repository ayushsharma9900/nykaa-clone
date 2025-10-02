import { NextRequest, NextResponse } from 'next/server';

// Admin credentials - in production, these should be in environment variables or database
const ADMIN_CREDENTIALS = {
  email: 'admin@dashtar.com',
  password: 'password123',
  name: 'Admin User',
  role: 'admin'
};

// Simple token secret
const TOKEN_SECRET = process.env.JWT_SECRET || 'kaayalife-admin-secret-key';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Login attempt for:', email);

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email and password are required' 
        },
        { status: 400 }
      );
    }

    // Check credentials
    if (email.toLowerCase() !== ADMIN_CREDENTIALS.email.toLowerCase()) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // For demo purposes, using simple password comparison
    // In production, use bcrypt.compare with hashed passwords
    if (password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email or password' 
        },
        { status: 401 }
      );
    }

    // Generate simple token for demo purposes
    const payload = {
      email: ADMIN_CREDENTIALS.email,
      name: ADMIN_CREDENTIALS.name,
      role: ADMIN_CREDENTIALS.role,
      userId: 'admin-1',
      exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      iat: Date.now()
    };
    
    // Create a simple base64 encoded token (for demo only)
    const token = 'kaaya.' + btoa(JSON.stringify(payload)) + '.' + btoa(TOKEN_SECRET);

    console.log('✅ Login successful for:', email);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        email: ADMIN_CREDENTIALS.email,
        name: ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role,
        userId: 'admin-1'
      },
      token
    });

  } catch (error) {
    console.error('❌ Login error:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
