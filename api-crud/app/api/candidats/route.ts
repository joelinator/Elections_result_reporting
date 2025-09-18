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

// GET /api/candidats - Get all candidats (helper endpoint for dropdowns)
export async function GET() {
  try {
    const candidats = await prisma.candidat.findMany({
      select: {
        code: true,
        noms_prenoms: true,
        photo: true,
        date_creation: true,
        partiPolitiques: {
          select: {
            code: true,
            designation: true,
            abbreviation: true,
            coloration_bulletin: true,
            image: true
          }
        }
      },
      orderBy: {
        noms_prenoms: 'asc'
      }
    })

    const response = NextResponse.json(candidats)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching candidats:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch candidats' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// POST /api/candidats - Create a new candidat
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { noms_prenoms, photo, code_createur } = body

    if (!noms_prenoms) {
      const response = NextResponse.json(
        { error: 'noms_prenoms is required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const candidat = await prisma.candidat.create({
      data: {
        noms_prenoms,
        photo,
        code_createur,
        date_creation: new Date().toISOString(),
        date_modification: new Date().toISOString()
      }
    })

    const response = NextResponse.json(candidat, { status: 201 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error creating candidat:', error)
    const response = NextResponse.json(
      { error: 'Failed to create candidat' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
