import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// GET /api/territorial-access/department/[code] - Check if user has access to department
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const departmentCode = parseInt(params.code)
    
    // Check if user has access to this department
    // This would typically check against the JWT token
    const hasAccess = await prisma.utilisateurDepartement.findFirst({
      where: {
        code_departement: departmentCode
      }
    })

    const response = NextResponse.json({ hasAccess: !!hasAccess })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error checking department access:', error)
    const response = NextResponse.json(
      { error: 'Failed to check department access' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
