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

// GET /api/territorial-access/summary - Get user's territorial access summary
export async function GET(request: NextRequest) {
  try {
    // This would typically get the user from the JWT token
    // For now, we'll return a mock response
    const departments = await prisma.utilisateurDepartement.findMany({
      include: {
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
    })

    const arrondissements = await prisma.utilisateurArrondissement.findMany({
      include: {
        arrondissement: {
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

    const bureauVotes = await prisma.utilisateurBureauVote.findMany({
      include: {
        bureauVote: {
          select: {
            code: true,
            designation: true,
            code_arrondissement: true,
            arrondissement: {
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
        }
      }
    })

    const territorialAccess = {
      departments: departments.map(d => ({
        code_departement: d.departement?.code,
        libelle_departement: d.departement?.libelle,
        code_region: d.departement?.code_region,
        libelle_region: d.departement?.region?.libelle,
        date_affectation: d.departement?.date_creation
      })),
      arrondissements: arrondissements.map(a => ({
        code_arrondissement: a.arrondissement?.code,
        libelle_arrondissement: a.arrondissement?.libelle,
        code_departement: a.arrondissement?.code_departement,
        libelle_departement: a.arrondissement?.departement?.libelle,
        code_region: a.arrondissement?.departement?.code_region,
        libelle_region: a.arrondissement?.departement?.region?.libelle,
        date_affectation: a.arrondissement?.date_creation
      })),
      bureauVotes: bureauVotes.map(bv => ({
        code_bureau_vote: bv.bureauVote?.code,
        designation: bv.bureauVote?.designation,
        code_arrondissement: bv.bureauVote?.code_arrondissement,
        libelle_arrondissement: bv.bureauVote?.arrondissement?.libelle,
        code_departement: bv.bureauVote?.arrondissement?.code_departement,
        libelle_departement: bv.bureauVote?.arrondissement?.departement?.libelle,
        code_region: bv.bureauVote?.arrondissement?.departement?.code_region,
        libelle_region: bv.bureauVote?.arrondissement?.departement?.region?.libelle,
        date_affectation: bv.bureauVote?.date_creation
      }))
    }

    const response = NextResponse.json(territorialAccess)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching territorial access summary:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch territorial access summary' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
