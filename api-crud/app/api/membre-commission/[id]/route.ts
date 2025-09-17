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

// GET /api/membre-commission/[id] - Get member by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const membreId = parseInt(id)

    if (isNaN(membreId)) {
      const response = NextResponse.json(
        { error: 'Invalid member ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const membre = await prisma.membreCommission.findUnique({
      where: { code: membreId },
      include: {
        fonction: {
          select: {
            code: true,
            libelle: true,
            description: true
          }
        },
        commission: {
          select: {
            code: true,
            libelle: true,
            departement: {
              select: {
                code: true,
                libelle: true,
                abbreviation: true
              }
            }
          }
        }
      }
    })

    if (!membre) {
      const response = NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const response = NextResponse.json(membre)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching member:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// PUT /api/membre-commission/[id] - Update member
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const membreId = parseInt(id)

    if (isNaN(membreId)) {
      const response = NextResponse.json(
        { error: 'Invalid member ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const body = await request.json()
    const { 
      nom, 
      code_fonction, 
      code_commission, 
      contact, 
      email, 
      est_membre_secretariat 
    } = body

    if (!nom || !code_fonction) {
      const response = NextResponse.json(
        { error: 'nom and code_fonction are required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const membre = await prisma.membreCommission.update({
      where: { code: membreId },
      data: {
        nom,
        code_fonction: parseInt(code_fonction),
        code_commission: code_commission ? parseInt(code_commission) : null,
        contact,
        email,
        est_membre_secretariat: Boolean(est_membre_secretariat)
      },
      include: {
        fonction: {
          select: {
            code: true,
            libelle: true
          }
        },
        commission: {
          select: {
            code: true,
            libelle: true
          }
        }
      }
    })

    const response = NextResponse.json(membre)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error updating member:', error)
    const response = NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// DELETE /api/membre-commission/[id] - Delete member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const membreId = parseInt(id)

    if (isNaN(membreId)) {
      const response = NextResponse.json(
        { error: 'Invalid member ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    await prisma.membreCommission.delete({
      where: { code: membreId }
    })

    const response = NextResponse.json({ message: 'Member deleted successfully' })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error deleting member:', error)
    const response = NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
