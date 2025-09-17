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

// GET /api/fonction-commission/[id] - Get function by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fonctionId = parseInt(id)

    if (isNaN(fonctionId)) {
      const response = NextResponse.json(
        { error: 'Invalid function ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const fonction = await prisma.fonctionCommission.findUnique({
      where: { code: fonctionId },
      include: {
        membreCommissions: {
          select: {
            code: true,
            nom: true,
            contact: true,
            email: true
          }
        }
      }
    })

    if (!fonction) {
      const response = NextResponse.json(
        { error: 'Function not found' },
        { status: 404 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    const response = NextResponse.json(fonction)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching function:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch function' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// PUT /api/fonction-commission/[id] - Update function
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fonctionId = parseInt(id)

    if (isNaN(fonctionId)) {
      const response = NextResponse.json(
        { error: 'Invalid function ID' },
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

    const fonction = await prisma.fonctionCommission.update({
      where: { code: fonctionId },
      data: {
        libelle,
        description
      }
    })

    const response = NextResponse.json(fonction)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error updating function:', error)
    const response = NextResponse.json(
      { error: 'Failed to update function' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// DELETE /api/fonction-commission/[id] - Delete function
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fonctionId = parseInt(id)

    if (isNaN(fonctionId)) {
      const response = NextResponse.json(
        { error: 'Invalid function ID' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // Check if function has members
    const membersCount = await prisma.membreCommission.count({
      where: { code_fonction: fonctionId }
    })

    if (membersCount > 0) {
      const response = NextResponse.json(
        { error: 'Cannot delete function with members. Remove members first.' },
        { status: 409 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    await prisma.fonctionCommission.delete({
      where: { code: fonctionId }
    })

    const response = NextResponse.json({ message: 'Function deleted successfully' })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error deleting function:', error)
    const response = NextResponse.json(
      { error: 'Failed to delete function' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
