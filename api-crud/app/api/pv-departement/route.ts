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

// GET /api/pv-departement - Get all PV departement data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departementCode = searchParams.get('departement')
    const regionCode = searchParams.get('region')
    
    const where: any = {}
    
    if (departementCode) {
      where.code_departement = parseInt(departementCode)
    }
    
    if (regionCode) {
      where.departement = {
        code_region: parseInt(regionCode)
      }
    }

    const pvs = await prisma.pvDepartement.findMany({
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
        }
      },
      orderBy: [
        { departement: { region: { libelle: 'asc' } } },
        { departement: { libelle: 'asc' } },
        { timestamp: 'desc' }
      ]
    })

    const response = NextResponse.json(pvs)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching PV departement data:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch PV departement data' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// POST /api/pv-departement - Create new PV departement data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      code_departement,
      url_pv,
      hash_file,
      libelle
    } = body

    if (!code_departement || !url_pv) {
      const response = NextResponse.json(
        { error: 'code_departement and url_pv are required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const pv = await prisma.pvDepartement.create({
      data: {
        code_departement: parseInt(code_departement),
        url_pv,
        hash_file: hash_file || null,
        libelle: libelle || null,
        timestamp: new Date()
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
        }
      }
    })

    const response = NextResponse.json(pv, { status: 201 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error creating PV departement data:', error)
    const response = NextResponse.json(
      { error: 'Failed to create PV departement data' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
