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

// GET /api/participation-commune - Get all participation commune data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const arrondissementCode = searchParams.get('arrondissement')
    const departementCode = searchParams.get('departement')
    const regionCode = searchParams.get('region')
    
    const where: any = {}
    
    if (arrondissementCode) {
      where.codeCommune = parseInt(arrondissementCode)
    }
    
    if (departementCode) {
      where.commune = {
        code_departement: parseInt(departementCode)
      }
    }
    
    if (regionCode) {
      where.commune = {
        ...where.commune,
        code_region: parseInt(regionCode)
      }
    }

    const participations = await prisma.participationCommune.findMany({
      where,
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
    console.error('Error fetching participation commune data:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch participation commune data' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// POST /api/participation-commune - Create new participation commune data
export async function POST(request: NextRequest) {
  try {
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

    if (!codeCommune) {
      const response = NextResponse.json(
        { error: 'codeCommune is required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // Calculate rates if not provided
    let calculatedTauxParticipation = tauxParticipation
    let calculatedTauxAbstention = tauxAbstention

    if (nombreInscrits && nombreVotants && !tauxParticipation) {
      calculatedTauxParticipation = Number(((nombreVotants / nombreInscrits) * 100).toFixed(2))
    }

    if (nombreInscrits && nombreVotants && !tauxAbstention) {
      calculatedTauxAbstention = Number((((nombreInscrits - nombreVotants) / nombreInscrits) * 100).toFixed(2))
    }

    const participation = await prisma.participationCommune.create({
      data: {
        codeCommune: parseInt(codeCommune),
        nombreBureaux: nombreBureaux ? parseInt(nombreBureaux) : null,
        nombreInscrits: nombreInscrits ? parseInt(nombreInscrits) : null,
        nombreVotants: nombreVotants ? parseInt(nombreVotants) : null,
        tauxParticipation: calculatedTauxParticipation ? Number(calculatedTauxParticipation) : null,
        bulletinsNuls: bulletinsNuls ? parseInt(bulletinsNuls) : null,
        suffragesValables: suffragesValables ? parseInt(suffragesValables) : null,
        tauxAbstention: calculatedTauxAbstention ? Number(calculatedTauxAbstention) : null
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

    const response = NextResponse.json(participation, { status: 201 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error creating participation commune data:', error)
    const response = NextResponse.json(
      { error: 'Failed to create participation commune data' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
