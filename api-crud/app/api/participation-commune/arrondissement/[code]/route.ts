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

// GET /api/participation-commune/arrondissement/[code] - Get participation commune data for specific arrondissement
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const arrondissementCode = parseInt(params.code)

    const participations = await prisma.participationCommune.findMany({
      where: {
        codeCommune: arrondissementCode
      },
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
        { dateCreation: 'desc' }
      ]
    })

    const response = NextResponse.json(participations)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching participation commune data for arrondissement:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch participation commune data for arrondissement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
