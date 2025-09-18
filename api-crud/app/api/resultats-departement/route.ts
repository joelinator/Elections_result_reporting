import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractUserFromToken, getDepartmentFilter } from '@/lib/auth-helper'

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

// GET /api/resultats-departement - Get all results by department
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departementCode = searchParams.get('departement')
    const partiCode = searchParams.get('parti')
    const regionCode = searchParams.get('region')
    
    // Extract user info from JWT token
    const authHeader = request.headers.get('authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    const where: Record<string, unknown> = {}
    
    if (departementCode) {
      where.code_departement = parseInt(departementCode)
    }
    
    if (partiCode) {
      where.code_parti = parseInt(partiCode)
    }
    
    // Si on filtre par région, on doit joindre avec les départements
    if (regionCode) {
      where.departement = {
        code_region: parseInt(regionCode)
      }
    }

    // Apply department-based filtering for scrutateur-departementale and validateur-departemental roles
    if (userInfo && (userInfo.role === 'scrutateur-departementale' || userInfo.role === 'validateur-departemental')) {
      const departmentFilter = await getDepartmentFilter(userInfo.id, userInfo.role)
      where = { ...where, ...departmentFilter }
    }

    const resultats = await prisma.resultatDepartement.findMany({
      where,
      include: {
        departement: {
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
          }
        },
        parti: {
          select: {
            code: true,
            designation: true,
            abbreviation: true,
            description: true,
            coloration_bulletin: true,
            image: true
          }
        }
      },
      orderBy: [
        { departement: { region: { libelle: 'asc' } } },
        { departement: { libelle: 'asc' } },
        { nombre_vote: 'desc' }
      ]
    })

    const response = NextResponse.json(resultats)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching resultats departement:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch resultats departement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// POST /api/resultats-departement - Create a new result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      code_departement,
      code_parti,
      nombre_vote,
      pourcentage
    } = body

    if (!code_departement || !code_parti || nombre_vote === undefined) {
      const response = NextResponse.json(
        { error: 'code_departement, code_parti, and nombre_vote are required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // Vérifier si un résultat existe déjà pour ce département et ce parti
    const existingResult = await prisma.resultatDepartement.findFirst({
      where: { 
        code_departement: parseInt(code_departement),
        code_parti: parseInt(code_parti)
      }
    })

    if (existingResult) {
      const response = NextResponse.json(
        { error: 'Un résultat existe déjà pour ce département et ce parti' },
        { status: 409 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const resultat = await prisma.resultatDepartement.create({
      data: {
        code_departement: parseInt(code_departement),
        code_parti: parseInt(code_parti),
        nombre_vote: parseInt(nombre_vote),
        pourcentage: pourcentage ? parseFloat(pourcentage) : null,
        date_creation: new Date().toISOString()
      },
      include: {
        departement: {
          select: {
            code: true,
            libelle: true,
            abbreviation: true,
            region: {
              select: {
                code: true,
                libelle: true,
                abbreviation: true
              }
            }
          }
        },
        parti: {
          select: {
            code: true,
            designation: true,
            abbreviation: true,
            description: true,
            coloration_bulletin: true,
            image: true
          }
        }
      }
    })

    const response = NextResponse.json(resultat, { status: 201 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error creating resultat departement:', error)
    const response = NextResponse.json(
      { error: 'Failed to create resultat departement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
