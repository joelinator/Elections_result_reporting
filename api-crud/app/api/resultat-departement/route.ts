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

// GET /api/resultat-departement - Get all resultat departement data with role-based filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departementCode = searchParams.get('departement')
    const partiCode = searchParams.get('parti')
    const userId = searchParams.get('userId') // For role-based filtering
    
    const where: any = {}
    
    if (departementCode) {
      where.code_departement = parseInt(departementCode)
    }
    
    if (partiCode) {
      where.code_parti = parseInt(partiCode)
    }

    // Role-based filtering: Get user's accessible departments
    if (userId) {
      try {
        // Get user's role and territorial access
        const user = await prisma.utilisateur.findUnique({
          where: { code: parseInt(userId) },
          include: { role: true }
        })

        if (user) {
          const roleLibelle = user.role?.libelle?.toLowerCase()
          
          // Admin has access to all departments
          if (roleLibelle !== 'administrateur') {
            // Get user's accessible departments
            const userDepartments = await prisma.utilisateurDepartement.findMany({
              where: { code_utilisateur: parseInt(userId) },
              select: { code_departement: true }
            })
            
            const accessibleDepartmentCodes = userDepartments.map(ud => ud.code_departement)
            
            if (accessibleDepartmentCodes.length > 0) {
              where.code_departement = {
                in: accessibleDepartmentCodes
              }
            } else {
              // User has no department access, return empty results
              const response = NextResponse.json([])
              response.headers.set('Access-Control-Allow-Origin', '*')
              return response
            }
          }
        }
      } catch (roleError) {
        console.warn('Error checking user role, proceeding without role filtering:', roleError)
      }
    }

    const resultats = await prisma.resultatDepartement.findMany({
      where,
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
    console.error('Error fetching resultat departement data:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch resultat departement data' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// POST /api/resultat-departement - Create new resultat departement data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      code_departement,
      code_parti,
      nombre_vote,
      pourcentage
    } = body

    if (!code_departement || !code_parti) {
      const response = NextResponse.json(
        { error: 'code_departement and code_parti are required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const resultat = await prisma.resultatDepartement.create({
      data: {
        code_departement: parseInt(code_departement),
        code_parti: parseInt(code_parti),
        nombre_vote: nombre_vote ? parseInt(nombre_vote) : 0,
        pourcentage: pourcentage ? parseFloat(pourcentage) : null,
        date_creation: new Date().toISOString()
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

    const response = NextResponse.json(resultat, { status: 201 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error creating resultat departement data:', error)
    const response = NextResponse.json(
      { error: 'Failed to create resultat departement data' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
