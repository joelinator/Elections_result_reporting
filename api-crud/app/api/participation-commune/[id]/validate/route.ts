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

// POST /api/participation-commune/[id]/validate - Validate participation commune data
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const participationId = parseInt(id)

    // Find the participation commune record
    const participation = await prisma.participationCommune.findUnique({
      where: { code: participationId },
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

    if (!participation) {
      const response = NextResponse.json(
        { error: 'Participation commune not found' },
        { status: 404 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // In a real implementation, you would update a validation status field
    // For now, we'll just return the record as validated
    const response = NextResponse.json(participation)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error validating participation commune:', error)
    const response = NextResponse.json(
      { error: 'Failed to validate participation commune' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
