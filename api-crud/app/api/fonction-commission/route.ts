import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

// GET /api/fonction-commission - Get all functions
export async function GET(request: NextRequest) {
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
    return addCorsHeaders(request, response)
  } catch (error) {
    console.error('Error fetching functions:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch functions' },
      { status: 500 }
    )
    return addCorsHeaders(request, response)
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
      return addCorsHeaders(request, response)
    }

    const fonction = await prisma.fonctionCommission.create({
      data: {
        libelle,
        description
      }
    })

    const response = NextResponse.json(fonction, { status: 201 })
    return addCorsHeaders(request, response)
  } catch (error) {
    console.error('Error creating function:', error)
    const response = NextResponse.json(
      { error: 'Failed to create function' },
      { status: 500 }
    )
    return addCorsHeaders(request, response)
  }
}
