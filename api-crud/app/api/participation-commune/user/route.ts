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

// GET /api/participation-commune/user - Get participation commune data for user's assigned territories
export async function GET(request: NextRequest) {
  try {
    // This would typically get the user from the JWT token
    // For now, we'll return all data as a mock implementation
    
    const participations = await prisma.participationCommune.findMany({
      include: {
        commune: {
          select: {
            code: true,
            libelle: true,
            code_departement: true,
            departement: {
              select: {
                code: true,
                libelle: true,
                code_region: true,
                region: {
                  select: {
                    code: true,
                    libelle: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: [
        { commune: { departement: { region: { libelle: 'asc' } } } },
        { commune: { departement: { libelle: 'asc' } } },
        { commune: { libelle: 'asc' } }
      ]
    })

    const response = NextResponse.json(participations)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching user participation commune data:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch user participation commune data' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
