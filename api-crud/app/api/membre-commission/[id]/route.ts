import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

// GET /api/membre-commission/[id] - Get member by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const membreId = parseInt(params.id);
    
    const membre = await prisma.membreCommission.findUnique({
      where: { code: membreId },
      include: {
        commission: {
          select: {
            code: true,
            libelle: true,
            departement: {
              select: {
                code: true,
                libelle: true
              }
            }
          }
        },
        fonction: {
          select: {
            code: true,
            libelle: true
          }
        }
      }
    });

    if (!membre) {
      const response = NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
      return addCorsHeaders(request, response);
    }

    const response = NextResponse.json(membre);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error fetching member:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch member' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// PUT /api/membre-commission/[id] - Update member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const membreId = parseInt(params.id);
    const body = await request.json();
    const {
      noms_prenoms,
      contact,
      email,
      code_commission,
      code_fonction
    } = body;

    const membre = await prisma.membreCommission.update({
      where: { code: membreId },
      data: {
        noms_prenoms,
        contact,
        email,
        code_commission: parseInt(code_commission),
        code_fonction: parseInt(code_fonction),
        date_modification: new Date().toISOString()
      },
      include: {
        commission: {
          select: {
            code: true,
            libelle: true,
            departement: {
              select: {
                code: true,
                libelle: true
              }
            }
          }
        },
        fonction: {
          select: {
            code: true,
            libelle: true
          }
        }
      }
    });

    const response = NextResponse.json(membre);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error updating member:', error);
    const response = NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// DELETE /api/membre-commission/[id] - Delete member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const membreId = parseInt(params.id);
    
    await prisma.membreCommission.delete({
      where: { code: membreId }
    });

    const response = NextResponse.json({ message: 'Member deleted successfully' });
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error deleting member:', error);
    const response = NextResponse.json(
      { error: 'Failed to delete member' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}