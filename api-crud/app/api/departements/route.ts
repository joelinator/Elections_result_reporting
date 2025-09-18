import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

// GET /api/departements - Get all departments (helper endpoint for dropdowns)
export async function GET(request: NextRequest) {
  try {
    const departements = await prisma.departement.findMany({
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
      },
      orderBy: {
        libelle: 'asc'
      }
    })

    const response = NextResponse.json(departements)
    return addCorsHeaders(request, response)
  } catch (error) {
    console.error('Error fetching departments:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
    return addCorsHeaders(request, response)
  }
}
