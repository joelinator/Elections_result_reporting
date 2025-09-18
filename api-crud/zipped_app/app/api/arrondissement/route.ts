import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractUserFromToken, getArrondissementFilter } from '@/lib/auth-helper'

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

// GET /api/arrondissement - Get all arrondissements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departementCode = searchParams.get('departement')
    const regionCode = searchParams.get('region')
    
    // Extract user info from JWT token
    const authHeader = request.headers.get('authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    const where: any = {}
    
    if (departementCode) {
      where.code_departement = parseInt(departementCode)
    }
    
    if (regionCode) {
      where.code_region = parseInt(regionCode)
    }

    // Apply department-based filtering for scrutateur-departementale and validateur-departemental roles
    if (userInfo && (userInfo.role === 'scrutateur-departementale' || userInfo.role === 'validateur-departemental')) {
      const departmentFilter = await getArrondissementFilter(userInfo.id, userInfo.role)
      where = { ...where, ...departmentFilter }
    }

    const arrondissements = await prisma.arrondissement.findMany({
      where,
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
            designation: true
          }
        },
        pvArrondissements: {
          select: {
            code: true,
            libelle: true,
            timestamp: true
          }
        }
      },
      orderBy: [
        { region: { libelle: 'asc' } },
        { departement: { libelle: 'asc' } },
        { libelle: 'asc' }
      ]
    })

    const response = NextResponse.json(arrondissements)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching arrondissements:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch arrondissements' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// POST /api/arrondissement - Create a new arrondissement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      code_departement, 
      code_region, 
      abbreviation, 
      libelle, 
      description,
      code_createur 
    } = body

    if (!libelle) {
      const response = NextResponse.json(
        { error: 'libelle is required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const arrondissement = await prisma.arrondissement.create({
      data: {
        code_departement: code_departement ? parseInt(code_departement) : null,
        code_region: code_region ? parseInt(code_region) : null,
        abbreviation,
        libelle,
        description,
        code_createur,
        date_creation: new Date().toISOString(),
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

    const response = NextResponse.json(arrondissement, { status: 201 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error creating arrondissement:', error)
    const response = NextResponse.json(
      { error: 'Failed to create arrondissement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
