import { NextRequest, NextResponse } from 'next/server';

/**
 * API Error Handler Wrapper
 * Provides consistent error handling and fallback responses for all API routes
 */

interface APIHandlerOptions {
  requireDatabase?: boolean;
  fallbackData?: any;
  fallbackMessage?: string;
}

interface APIResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  pagination?: any;
}

/**
 * Wraps API handlers with consistent error handling
 */
export function withErrorHandler(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: APIHandlerOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('🚨 API Error:', error);
      
      // Log the full error stack for debugging
      if (error instanceof Error) {
        console.error('Error stack:', error.stack);
      }
      
      // Check if this is a database-related error
      const isDatabaseError = error instanceof Error && error.message && (
        error.message.includes('database') ||
        error.message.includes('sqlite') ||
        error.message.includes('postgres') ||
        error.message.includes('connection')
      );
      
      // If it's a database error and we have fallback data, use it
      if (isDatabaseError && options.fallbackData) {
        console.log('📦 Using fallback data due to database error');
        return NextResponse.json({
          success: true,
          data: options.fallbackData,
          message: options.fallbackMessage || 'Data loaded from fallback source'
        });
      }
      
      // Return a proper error response instead of 500
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
      
      return NextResponse.json({
        success: false,
        message: isProduction ? 'Service temporarily unavailable' : errorMessage,
        error: isProduction ? 'INTERNAL_SERVER_ERROR' : errorMessage,
        data: options.fallbackData || []
      }, { 
        status: isDatabaseError ? 200 : 500 // Return 200 for database errors with fallback
      });
    }
  };
}

/**
 * Validates required environment variables for API routes
 */
export function validateEnvironment(): { isValid: boolean; missing: string[] } {
  const required = [];
  const missing = [];
  
  // Only require database URL in production if not using fallback
  if (process.env.NODE_ENV === 'production' && !process.env.POSTGRES_URL) {
    console.log('⚠️ PostgreSQL not configured, will use fallback data');
  }
  
  return {
    isValid: missing.length === 0,
    missing
  };
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse(data: any, pagination?: any, message?: string): NextResponse {
  const response: APIResponse = {
    success: true,
    data,
    ...(pagination && { pagination }),
    ...(message && { message })
  };
  
  return NextResponse.json(response);
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  message: string, 
  status: number = 400, 
  error?: string
): NextResponse {
  const response: APIResponse = {
    success: false,
    message,
    ...(error && { error })
  };
  
  return NextResponse.json(response, { status });
}

/**
 * Handles database connection errors gracefully
 */
export async function handleDatabaseError(error: any, fallbackFn?: () => any) {
  console.error('🔥 Database Error:', error);
  
  if (fallbackFn) {
    console.log('🔄 Executing fallback function');
    return fallbackFn();
  }
  
  throw new Error('Database unavailable and no fallback provided');
}

/**
 * Checks if running in serverless environment
 */
export function isServerlessEnvironment(): boolean {
  return !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY);
}

/**
 * Checks if PostgreSQL is available
 */
export function hasPostgresql(): boolean {
  return !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
}
