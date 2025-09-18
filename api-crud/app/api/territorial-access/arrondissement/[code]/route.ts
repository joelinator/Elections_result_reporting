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

// GET /api/territorial-access/arrondissement/[code] - Check if user has access to arrondissement
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const arrondissementCode = parseInt(params.code)
    
    // Check if user has direct access to this arrondissement
    const directAccess = await prisma.utilisateurArrondissement.findFirst({
      where: {
        code_arrondissement: arrondissementCode
      }
    })

    // Check if user has access through department
    const arrondissement = await prisma.arrondissement.findUnique({
      where: { code: arrondissementCode },
      select: { code_departement: true }
    })

    let departmentAccess = false
    if (arrondissement?.code_departement) {
      departmentAccess = !!(await prisma.utilisateurDepartement.findFirst({
        where: {
          code_departement: arrondissement.code_departement
        }
      }))
    }

    const hasAccess = !!directAccess || departmentAccess

    const response = NextResponse.json({ hasAccess })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error checking arrondissement access:', error)
    const response = NextResponse.json(
      { error: 'Failed to check arrondissement access' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
