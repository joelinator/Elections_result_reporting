import { NextRequest, NextResponse } from 'next/server'

// Helper function to add CORS headers to responses
export function addCorsHeaders(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get('origin')
  
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Vary', 'Origin')
  
  return response
}

// Helper function to create CORS preflight response
export function createCorsPreflightResponse(request: NextRequest): NextResponse {
  const origin = request.headers.get('origin')
  
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
