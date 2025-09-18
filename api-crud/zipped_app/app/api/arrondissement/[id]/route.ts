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

// GET /api/arrondissement/[id] - Get arrondissement by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const arrondissementId = parseInt(id)

    if (isNaN(arrondissementId)) {
      const response = NextResponse.json(
        { error: 'Invalid arrondissement ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const arrondissement = await prisma.arrondissement.findUnique({
      where: { code: arrondissementId },
      include: {
        departement: {
          select: {
            code: true,
            libelle: true,
            abbreviation: true
          }
        },
        region: {
          select: {
            code: true,
            libelle: true,
            abbreviation: true
          }
        },
        bureauVotes: {
          select: {
            code: true,
            designation: true,
            description: true
          }
        },
        pvArrondissements: {
          select: {
            code: true,
            libelle: true,
            url_pv: true,
            hash_file: true,
            timestamp: true
          },
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    })

    if (!arrondissement) {
      const response = NextResponse.json(
        { error: 'Arrondissement not found' },
        { status: 404 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const response = NextResponse.json(arrondissement)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching arrondissement:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch arrondissement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// PUT /api/arrondissement/[id] - Update arrondissement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const arrondissementId = parseInt(id)

    if (isNaN(arrondissementId)) {
      const response = NextResponse.json(
        { error: 'Invalid arrondissement ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const body = await request.json()
    const { 
      code_departement, 
      code_region, 
      abbreviation, 
      libelle, 
      description,
      code_modificateur 
    } = body

    if (!libelle) {
      const response = NextResponse.json(
        { error: 'libelle is required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const arrondissement = await prisma.arrondissement.update({
      where: { code: arrondissementId },
      data: {
        code_departement: code_departement ? parseInt(code_departement) : null,
        code_region: code_region ? parseInt(code_region) : null,
        abbreviation,
        libelle,
        description,
        code_modificateur,
        date_modification: new Date().toISOString()
      },
      include: {
        departement: {
          select: {
            code: true,
            libelle: true,
            abbreviation: true
          }
        },
        region: {
          select: {
            code: true,
            libelle: true,
            abbreviation: true
          }
        }
      }
    })

    const response = NextResponse.json(arrondissement)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error updating arrondissement:', error)
    const response = NextResponse.json(
      { error: 'Failed to update arrondissement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// DELETE /api/arrondissement/[id] - Delete arrondissement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const arrondissementId = parseInt(id)

    if (isNaN(arrondissementId)) {
      const response = NextResponse.json(
        { error: 'Invalid arrondissement ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // Check if arrondissement has bureau votes
    const bureauVotesCount = await prisma.bureauVote.count({
      where: { code_arrondissement: arrondissementId }
    })

    if (bureauVotesCount > 0) {
      const response = NextResponse.json(
        { error: 'Cannot delete arrondissement with bureau votes. Remove bureau votes first.' },
        { status: 409 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // Check if arrondissement has documents
    const documentsCount = await prisma.pvArrondissement.count({
      where: { code_arrondissement: arrondissementId }
    })

    if (documentsCount > 0) {
      const response = NextResponse.json(
        { error: 'Cannot delete arrondissement with documents. Remove documents first.' },
        { status: 409 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    await prisma.arrondissement.delete({
      where: { code: arrondissementId }
    })

    const response = NextResponse.json({ message: 'Arrondissement deleted successfully' })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error deleting arrondissement:', error)
    const response = NextResponse.json(
      { error: 'Failed to delete arrondissement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
