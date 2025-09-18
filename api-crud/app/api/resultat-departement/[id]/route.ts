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

// GET /api/resultat-departement/[id] - Get resultat departement by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    const resultat = await prisma.resultatDepartement.findUnique({
      where: { code: id },
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
        },
        parti: {
          select: {
            code: true,
            designation: true,
            abbreviation: true
          }
        }
      }
    })

    if (!resultat) {
      const response = NextResponse.json(
        { error: 'Resultat departement not found' },
        { status: 404 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const response = NextResponse.json(resultat)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching resultat departement:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch resultat departement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// PUT /api/resultat-departement/[id] - Update resultat departement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { 
      code_departement,
      code_parti,
      nombre_vote,
      pourcentage
    } = body

    const resultat = await prisma.resultatDepartement.update({
      where: { code: id },
      data: {
        code_departement: code_departement ? parseInt(code_departement) : undefined,
        code_parti: code_parti ? parseInt(code_parti) : undefined,
        nombre_vote: nombre_vote !== undefined ? parseInt(nombre_vote) : undefined,
        pourcentage: pourcentage !== undefined ? parseFloat(pourcentage) : undefined
      },
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
        },
        parti: {
          select: {
            code: true,
            designation: true,
            abbreviation: true
          }
        }
      }
    })

    const response = NextResponse.json(resultat)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error updating resultat departement:', error)
    const response = NextResponse.json(
      { error: 'Failed to update resultat departement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// DELETE /api/resultat-departement/[id] - Delete resultat departement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    await prisma.resultatDepartement.delete({
      where: { code: id }
    })

    const response = NextResponse.json({ message: 'Resultat departement deleted successfully' })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error deleting resultat departement:', error)
    const response = NextResponse.json(
      { error: 'Failed to delete resultat departement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
