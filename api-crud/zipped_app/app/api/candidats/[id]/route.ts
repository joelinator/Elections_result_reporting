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

// GET /api/candidats/[id] - Get a specific candidat
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const candidat = await prisma.candidat.findUnique({
      where: { code: parseInt(params.id) },
      include: {
        partiPolitiques: {
          select: {
            code: true,
            designation: true,
            abbreviation: true,
            coloration_bulletin: true,
            image: true
          }
        }
      }
    })

    if (!candidat) {
      const response = NextResponse.json(
        { error: 'Candidat not found' },
        { status: 404 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const response = NextResponse.json(candidat)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching candidat:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch candidat' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// PUT /api/candidats/[id] - Update a specific candidat
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { noms_prenoms, photo, code_modificateur } = body

    if (!noms_prenoms) {
      const response = NextResponse.json(
        { error: 'noms_prenoms is required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const candidat = await prisma.candidat.update({
      where: { code: parseInt(params.id) },
      data: {
        noms_prenoms,
        photo,
        code_modificateur,
        date_modification: new Date().toISOString()
      }
    })

    const response = NextResponse.json(candidat)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error updating candidat:', error)
    const response = NextResponse.json(
      { error: 'Failed to update candidat' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// DELETE /api/candidats/[id] - Delete a specific candidat
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.candidat.delete({
      where: { code: parseInt(params.id) }
    })

    const response = NextResponse.json({ message: 'Candidat deleted successfully' })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error deleting candidat:', error)
    const response = NextResponse.json(
      { error: 'Failed to delete candidat' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
