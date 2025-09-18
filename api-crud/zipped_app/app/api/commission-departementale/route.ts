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

// GET /api/commission-departementale - Get all commissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departementCode = searchParams.get('departement')
    
    // Extract user info from JWT token
    const authHeader = request.headers.get('authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    let where: any = departementCode 
      ? { code_departement: parseInt(departementCode) }
      : {}

    // Apply department-based filtering for scrutateur-departementale and validateur-departemental roles
    if (userInfo && (userInfo.role === 'scrutateur-departementale' || userInfo.role === 'validateur-departemental')) {
      const departmentFilter = await getDepartmentFilter(userInfo.id, userInfo.role)
      where = { ...where, ...departmentFilter }
    }

    const commissions = await prisma.commissionDepartementale.findMany({
      where,
      include: {
        departement: {
          select: {
            code: true,
            libelle: true,
            abbreviation: true
          }
        },
        membreCommissions: {
          include: {
            fonction: {
              select: {
                code: true,
                libelle: true
              }
            }
          }
        }
      },
      orderBy: {
        date_creation: 'desc'
      }
    })

    const response = NextResponse.json(commissions)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching commissions:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch commissions' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// POST /api/commission-departementale - Create a new commission
export async function POST(request: NextRequest) {
  try {
    // Extract user info from JWT token
    const authHeader = request.headers.get('authorization')
    const userInfo = extractUserFromToken(authHeader)

    const body = await request.json()
    const { code_departement, libelle, description } = body

    if (!code_departement || !libelle) {
      const response = NextResponse.json(
        { error: 'code_departement and libelle are required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // For scrutateur-departementale and validateur-departemental roles, verify access to the department
    if (userInfo && (userInfo.role === 'scrutateur-departementale' || userInfo.role === 'validateur-departemental')) {
      const hasAccess = await prisma.utilisateurDepartement.findFirst({
        where: {
          code_utilisateur: userInfo.id,
          code_departement: parseInt(code_departement)
        }
      })

      if (!hasAccess) {
        const response = NextResponse.json(
          { error: 'Access denied. You can only create commissions for your assigned departments.' },
          { status: 403 }
        )
        response.headers.set('Access-Control-Allow-Origin', '*')
        return response
      }
    }

    const commission = await prisma.commissionDepartementale.create({
      data: {
        code_departement: parseInt(code_departement),
        libelle,
        description
      },
      include: {
        departement: {
          select: {
            code: true,
            libelle: true,
            abbreviation: true
          }
        }
      }
    })

    const response = NextResponse.json(commission, { status: 201 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error creating commission:', error)
    const response = NextResponse.json(
      { error: 'Failed to create commission' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
