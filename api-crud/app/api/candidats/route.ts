import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

// GET /api/candidats - Get all candidats (helper endpoint for dropdowns)
export async function GET(request: NextRequest) {
  try {
    const candidats = await prisma.candidat.findMany({
      select: {
        code: true,
        noms_prenoms: true,
        photo: true,
        date_creation: true,
        date_modification: true,
        code_createur: true,
        code_modificateur: true
      },
      orderBy: {
        noms_prenoms: 'asc'
      }
    })

    const response = NextResponse.json(candidats)
    return addCorsHeaders(request, response)
  } catch (error) {
    console.error('Error fetching candidats:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch candidats' },
      { status: 500 }
    )
    return addCorsHeaders(request, response)
  }
}
