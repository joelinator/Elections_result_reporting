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

// GET /api/territorial-access/can-edit-department/[code] - Check if user can edit department data
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const departmentCode = parseInt(params.code)
    
    // Check if user has access to this department
    const hasAccess = await prisma.utilisateurDepartement.findFirst({
      where: {
        code_departement: departmentCode
      }
    })

    // For now, we'll allow edit if user has access
    // In a real implementation, you'd check the user's role from JWT
    const canEdit = !!hasAccess

    const response = NextResponse.json({ canEdit })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error checking department edit access:', error)
    const response = NextResponse.json(
      { error: 'Failed to check department edit access' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
