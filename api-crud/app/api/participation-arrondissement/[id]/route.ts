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

// GET /api/participation-arrondissement/[id] - Get a specific participation arrondissement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const participation = await prisma.participationArrondissement.findUnique({
      where: { code: parseInt(params.id) },
      include: {
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
                chef_lieu: true,
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
    })

    if (!participation) {
      const response = NextResponse.json(
        { error: 'Participation arrondissement not found' },
        { status: 404 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const response = NextResponse.json(participation)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching participation arrondissement:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch participation arrondissement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// PUT /api/participation-arrondissement/[id] - Update a specific participation arrondissement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      nombre_bureau_vote,
      nombre_inscrit,
      nombre_enveloppe_urnes,
      nombre_enveloppe_bulletins_differents,
      nombre_bulletin_electeur_identifiable,
      nombre_bulletin_enveloppes_signes,
      nombre_enveloppe_non_elecam,
      nombre_bulletin_non_elecam,
      nombre_bulletin_sans_enveloppe,
      nombre_enveloppe_vide,
      nombre_suffrages_valable,
      nombre_votant,
      bulletin_nul,
      suffrage_exprime,
      taux_participation
    } = body

    const participation = await prisma.participationArrondissement.update({
      where: { code: parseInt(params.id) },
      data: {
        nombre_bureau_vote: nombre_bureau_vote ? parseInt(nombre_bureau_vote) : undefined,
        nombre_inscrit: nombre_inscrit ? parseInt(nombre_inscrit) : undefined,
        nombre_enveloppe_urnes: nombre_enveloppe_urnes ? parseInt(nombre_enveloppe_urnes) : undefined,
        nombre_enveloppe_bulletins_differents: nombre_enveloppe_bulletins_differents ? parseInt(nombre_enveloppe_bulletins_differents) : undefined,
        nombre_bulletin_electeur_identifiable: nombre_bulletin_electeur_identifiable ? parseInt(nombre_bulletin_electeur_identifiable) : undefined,
        nombre_bulletin_enveloppes_signes: nombre_bulletin_enveloppes_signes ? parseInt(nombre_bulletin_enveloppes_signes) : undefined,
        nombre_enveloppe_non_elecam: nombre_enveloppe_non_elecam ? parseInt(nombre_enveloppe_non_elecam) : undefined,
        nombre_bulletin_non_elecam: nombre_bulletin_non_elecam ? parseInt(nombre_bulletin_non_elecam) : undefined,
        nombre_bulletin_sans_enveloppe: nombre_bulletin_sans_enveloppe ? parseInt(nombre_bulletin_sans_enveloppe) : undefined,
        nombre_enveloppe_vide: nombre_enveloppe_vide ? parseInt(nombre_enveloppe_vide) : undefined,
        nombre_suffrages_valable: nombre_suffrages_valable ? parseInt(nombre_suffrages_valable) : undefined,
        nombre_votant: nombre_votant ? parseInt(nombre_votant) : undefined,
        bulletin_nul: bulletin_nul ? parseInt(bulletin_nul) : undefined,
        suffrage_exprime: suffrage_exprime ? parseFloat(suffrage_exprime) : undefined,
        taux_participation: taux_participation ? parseFloat(taux_participation) : undefined
      },
      include: {
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
    })

    const response = NextResponse.json(participation)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error updating participation arrondissement:', error)
    const response = NextResponse.json(
      { error: 'Failed to update participation arrondissement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// DELETE /api/participation-arrondissement/[id] - Delete a specific participation arrondissement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.participationArrondissement.delete({
      where: { code: parseInt(params.id) }
    })

    const response = NextResponse.json({ message: 'Participation arrondissement deleted successfully' })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error deleting participation arrondissement:', error)
    const response = NextResponse.json(
      { error: 'Failed to delete participation arrondissement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
