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

// GET /api/participation-commune/[id] - Get participation commune by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    const participation = await prisma.participationCommune.findUnique({
      where: { code: id },
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

    const response = NextResponse.json(participation)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching participation commune:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch participation commune' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// PUT /api/participation-commune/[id] - Update participation commune
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { 
      codeCommune,
      nombreBureaux,
      nombreInscrits,
      nombreVotants,
      tauxParticipation,
      bulletinsNuls,
      suffragesValables,
      tauxAbstention
    } = body

    // Calculate rates if not provided
    let calculatedTauxParticipation = tauxParticipation
    let calculatedTauxAbstention = tauxAbstention

    if (nombreInscrits && nombreVotants && !tauxParticipation) {
      calculatedTauxParticipation = Number(((nombreVotants / nombreInscrits) * 100).toFixed(2))
    }

    if (nombreInscrits && nombreVotants && !tauxAbstention) {
      calculatedTauxAbstention = Number((((nombreInscrits - nombreVotants) / nombreInscrits) * 100).toFixed(2))
    }

    const participation = await prisma.participationCommune.update({
      where: { code: id },
      data: {
        codeCommune: codeCommune ? parseInt(codeCommune) : undefined,
        nombreBureaux: nombreBureaux !== undefined ? parseInt(nombreBureaux) : undefined,
        nombreInscrits: nombreInscrits !== undefined ? parseInt(nombreInscrits) : undefined,
        nombreVotants: nombreVotants !== undefined ? parseInt(nombreVotants) : undefined,
        tauxParticipation: calculatedTauxParticipation !== undefined ? Number(calculatedTauxParticipation) : undefined,
        bulletinsNuls: bulletinsNuls !== undefined ? parseInt(bulletinsNuls) : undefined,
        suffragesValables: suffragesValables !== undefined ? parseInt(suffragesValables) : undefined,
        tauxAbstention: calculatedTauxAbstention !== undefined ? Number(calculatedTauxAbstention) : undefined
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

    const response = NextResponse.json(participation)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error updating participation commune:', error)
    const response = NextResponse.json(
      { error: 'Failed to update participation commune' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// DELETE /api/participation-commune/[id] - Delete participation commune
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    await prisma.participationCommune.delete({
      where: { code: id }
    })

    const response = NextResponse.json({ message: 'Participation commune deleted successfully' })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error deleting participation commune:', error)
    const response = NextResponse.json(
      { error: 'Failed to delete participation commune' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
