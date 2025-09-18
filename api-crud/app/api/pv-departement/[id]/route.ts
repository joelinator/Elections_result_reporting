import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

// GET /api/pv-departement/[id] - Get PV by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pvId = parseInt(params.id);
    
    const pv = await prisma.pvDepartement.findUnique({
      where: { code: pvId },
      include: {
        departement: {
          select: {
            code: true,
            libelle: true,
            region: {
              select: {
                code: true,
                libelle: true
              }
            }
          }
        }
      }
    });

    if (!pv) {
      const response = NextResponse.json(
        { error: 'PV not found' },
        { status: 404 }
      );
      return addCorsHeaders(request, response);
    }

    const response = NextResponse.json(pv);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error fetching PV:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch PV' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// PUT /api/pv-departement/[id] - Update PV
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pvId = parseInt(params.id);
    const body = await request.json();
    const {
      code_departement,
      libelle,
      url_pv,
      hash_file
    } = body;

    const pv = await prisma.pvDepartement.update({
      where: { code: pvId },
      data: {
        code_departement: parseInt(code_departement),
        libelle,
        url_pv,
        hash_file
      },
      include: {
        departement: {
          select: {
            code: true,
            libelle: true,
            region: {
              select: {
                code: true,
                libelle: true
              }
            }
          }
        }
      }
    });

    const response = NextResponse.json(pv);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error updating PV:', error);
    const response = NextResponse.json(
      { error: 'Failed to update PV' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// DELETE /api/pv-departement/[id] - Delete PV
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pvId = parseInt(params.id);
    
    await prisma.pvDepartement.delete({
      where: { code: pvId }
    });

    const response = NextResponse.json({ message: 'PV deleted successfully' });
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error deleting PV:', error);
    const response = NextResponse.json(
      { error: 'Failed to delete PV' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}