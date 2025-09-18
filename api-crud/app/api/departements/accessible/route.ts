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

// GET /api/departements/accessible - Get accessible departments for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      const response = NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // Get user's role
    const user = await prisma.utilisateur.findUnique({
      where: { code: parseInt(userId) },
      include: { role: true }
    })

    if (!user) {
      const response = NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const roleLibelle = user.role?.libelle?.toLowerCase()
    
    let departments: any[] = []

    if (roleLibelle === 'administrateur') {
      // Admin has access to all departments
      departments = await prisma.departement.findMany({
        select: {
          code: true,
          libelle: true,
          abbreviation: true,
          code_region: true,
          region: {
            select: {
              code: true,
              libelle: true
            }
          }
        },
        orderBy: [
          { region: { libelle: 'asc' } },
          { libelle: 'asc' }
        ]
      })
    } else {
      // Get user's accessible departments
      const userDepartments = await prisma.utilisateurDepartement.findMany({
        where: { code_utilisateur: parseInt(userId) },
        include: {
          departement: {
            select: {
              code: true,
              libelle: true,
              abbreviation: true,
              code_region: true,
              region: {
                select: {
                  code: true,
                  libelle: true
                }
              }
            }
          }
        }
      })
      
      departments = userDepartments.map(ud => ud.departement).filter(Boolean)
    }

    const response = NextResponse.json(departments)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching accessible departments:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch accessible departments' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
