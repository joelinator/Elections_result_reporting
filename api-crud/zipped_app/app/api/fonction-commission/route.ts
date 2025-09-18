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

// GET /api/fonction-commission - Get all functions
export async function GET() {
  try {
    const fonctions = await prisma.fonctionCommission.findMany({
      include: {
        membreCommissions: {
          select: {
            code: true,
            nom: true
          }
        }
      },
      orderBy: {
        libelle: 'asc'
      }
    })

    const response = NextResponse.json(fonctions)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching functions:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch functions' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// POST /api/fonction-commission - Create a new function
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { libelle, description } = body

    if (!libelle) {
      const response = NextResponse.json(
        { error: 'libelle is required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const fonction = await prisma.fonctionCommission.create({
      data: {
        libelle,
        description
      }
    })

    const response = NextResponse.json(fonction, { status: 201 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error creating function:', error)
    const response = NextResponse.json(
      { error: 'Failed to create function' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
