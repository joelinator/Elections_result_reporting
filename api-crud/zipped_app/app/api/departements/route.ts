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

// GET /api/departements - Get all departments (helper endpoint for dropdowns)
export async function GET() {
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
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching departments:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
