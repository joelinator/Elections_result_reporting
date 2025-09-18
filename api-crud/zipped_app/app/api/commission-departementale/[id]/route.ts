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

// GET /api/commission-departementale/[id] - Get commission by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const commissionId = parseInt(id)

    if (isNaN(commissionId)) {
      const response = NextResponse.json(
        { error: 'Invalid commission ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const commission = await prisma.commissionDepartementale.findUnique({
      where: { code: commissionId },
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
      }
    })

    if (!commission) {
      const response = NextResponse.json(
        { error: 'Commission not found' },
        { status: 404 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const response = NextResponse.json(commission)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching commission:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch commission' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// PUT /api/commission-departementale/[id] - Update commission
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const commissionId = parseInt(id)

    if (isNaN(commissionId)) {
      const response = NextResponse.json(
        { error: 'Invalid commission ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const body = await request.json()
    const { libelle, description } = body

    if (!libelle) {
      const response = NextResponse.json(
        { error: 'libelle is required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const commission = await prisma.commissionDepartementale.update({
      where: { code: commissionId },
      data: {
        libelle,
        description,
        date_modification: new Date()
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

    const response = NextResponse.json(commission)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error updating commission:', error)
    const response = NextResponse.json(
      { error: 'Failed to update commission' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// DELETE /api/commission-departementale/[id] - Delete commission
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const commissionId = parseInt(id)

    if (isNaN(commissionId)) {
      const response = NextResponse.json(
        { error: 'Invalid commission ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // Check if commission has members
    const membersCount = await prisma.membreCommission.count({
      where: { code_commission: commissionId }
    })

    if (membersCount > 0) {
      const response = NextResponse.json(
        { error: 'Cannot delete commission with members. Remove members first.' },
        { status: 409 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    await prisma.commissionDepartementale.delete({
      where: { code: commissionId }
    })

    const response = NextResponse.json({ message: 'Commission deleted successfully' })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error deleting commission:', error)
    const response = NextResponse.json(
      { error: 'Failed to delete commission' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
