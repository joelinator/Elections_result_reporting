import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the origin from the request
  const origin = request.headers.get('origin')
  
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
        'Vary': 'Origin',
      },
    })
  }

  // Continue with the request for non-OPTIONS methods
  const response = NextResponse.next()
  
  // Add comprehensive CORS headers to all API responses
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Vary', 'Origin')
  
  return response
}

// Apply middleware only to API routes
export const config = {
  matcher: '/api/:path*',
}
