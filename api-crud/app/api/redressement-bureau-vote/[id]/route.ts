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

// GET /api/redressement-bureau-vote/[id] - Get redressement bureau vote by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const redressementId = parseInt(id)

    if (isNaN(redressementId)) {
      const response = NextResponse.json(
        { error: 'Invalid redressement ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const redressement = await prisma.redressementBureauVote.findUnique({
      where: { code: redressementId },
      include: {
        bureauVote: {
          select: {
            code: true,
            designation: true,
            description: true,
            arrondissement: {
              select: {
                code: true,
                libelle: true,
                abbreviation: true,
                departement: {
                  select: {
                    code: true,
                    libelle: true,
                    abbreviation: true,
                    region: {
                      select: {
                        code: true,
                        libelle: true,
                        abbreviation: true
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

    if (!redressement) {
      const response = NextResponse.json(
        { error: 'Redressement not found' },
        { status: 404 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const response = NextResponse.json(redressement)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching redressement bureau vote:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch redressement bureau vote' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// PUT /api/redressement-bureau-vote/[id] - Update redressement bureau vote
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const redressementId = parseInt(id)

    if (isNaN(redressementId)) {
      const response = NextResponse.json(
        { error: 'Invalid redressement ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const body = await request.json()
    const {
      nombre_inscrit_initial,
      nombre_inscrit_redresse,
      nombre_votant_initial,
      nombre_votant_redresse,
      taux_participation_initial,
      taux_participation_redresse,
      bulletin_nul_initial,
      bulletin_nul_redresse,
      suffrage_exprime_valables_initial,
      suffrage_exprime_valables_redresse,
      erreurs_materielles_initiales,
      erreurs_materielles_initiales_redresse,
      raison_redressement
    } = body

    const redressement = await prisma.redressementBureauVote.update({
      where: { code: redressementId },
      data: {
        nombre_inscrit_initial: nombre_inscrit_initial ? parseInt(nombre_inscrit_initial) : null,
        nombre_inscrit_redresse: nombre_inscrit_redresse ? parseInt(nombre_inscrit_redresse) : null,
        nombre_votant_initial: nombre_votant_initial ? parseInt(nombre_votant_initial) : null,
        nombre_votant_redresse: nombre_votant_redresse ? parseInt(nombre_votant_redresse) : null,
        taux_participation_initial: taux_participation_initial ? parseFloat(taux_participation_initial) : null,
        taux_participation_redresse: taux_participation_redresse ? parseFloat(taux_participation_redresse) : null,
        bulletin_nul_initial: bulletin_nul_initial ? parseInt(bulletin_nul_initial) : null,
        bulletin_nul_redresse: bulletin_nul_redresse ? parseInt(bulletin_nul_redresse) : null,
        suffrage_exprime_valables_initial: suffrage_exprime_valables_initial ? parseInt(suffrage_exprime_valables_initial) : null,
        suffrage_exprime_valables_redresse: suffrage_exprime_valables_redresse ? parseInt(suffrage_exprime_valables_redresse) : null,
        erreurs_materielles_initiales,
        erreurs_materielles_initiales_redresse,
        raison_redressement,
        date_redressement: new Date()
      },
      include: {
        bureauVote: {
          select: {
            code: true,
            designation: true,
            description: true,
            arrondissement: {
              select: {
                code: true,
                libelle: true,
                abbreviation: true
              }
            }
          }
        }
      }
    })

    const response = NextResponse.json(redressement)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error updating redressement bureau vote:', error)
    const response = NextResponse.json(
      { error: 'Failed to update redressement bureau vote' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// DELETE /api/redressement-bureau-vote/[id] - Delete redressement bureau vote
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const redressementId = parseInt(id)

    if (isNaN(redressementId)) {
      const response = NextResponse.json(
        { error: 'Invalid redressement ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    await prisma.redressementBureauVote.delete({
      where: { code: redressementId }
    })

    const response = NextResponse.json({ message: 'Redressement bureau vote deleted successfully' })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error deleting redressement bureau vote:', error)
    const response = NextResponse.json(
      { error: 'Failed to delete redressement bureau vote' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}