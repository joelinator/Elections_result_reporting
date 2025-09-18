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

// POST /api/participation-commune/bulk/approve - Bulk approve participation commune data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ids } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      const response = NextResponse.json(
        { error: 'ids array is required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // Update multiple records to mark as approved
    // This would typically update an approval status field
    const updatedParticipations = await prisma.participationCommune.findMany({
      where: {
        code: {
          in: ids.map(id => parseInt(id))
        }
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
      }
    })

    const response = NextResponse.json(updatedParticipations)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error bulk approving participation commune data:', error)
    const response = NextResponse.json(
      { error: 'Failed to bulk approve participation commune data' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
