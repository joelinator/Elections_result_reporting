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

// GET /api/pv-departement/[id] - Get PV departement by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    const pv = await prisma.pvDepartement.findUnique({
      where: { code: id },
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

    if (!pv) {
      const response = NextResponse.json(
        { error: 'PV departement not found' },
        { status: 404 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const response = NextResponse.json(pv)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching PV departement:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch PV departement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// PUT /api/pv-departement/[id] - Update PV departement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    const { 
      code_departement,
      url_pv,
      hash_file,
      libelle
    } = body

    const pv = await prisma.pvDepartement.update({
      where: { code: id },
      data: {
        code_departement: code_departement ? parseInt(code_departement) : undefined,
        url_pv: url_pv || undefined,
        hash_file: hash_file !== undefined ? hash_file : undefined,
        libelle: libelle !== undefined ? libelle : undefined
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

    const response = NextResponse.json(pv)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error updating PV departement:', error)
    const response = NextResponse.json(
      { error: 'Failed to update PV departement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// DELETE /api/pv-departement/[id] - Delete PV departement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    await prisma.pvDepartement.delete({
      where: { code: id }
    })

    const response = NextResponse.json({ message: 'PV departement deleted successfully' })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error deleting PV departement:', error)
    const response = NextResponse.json(
      { error: 'Failed to delete PV departement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
