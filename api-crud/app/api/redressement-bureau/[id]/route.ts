import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

// GET /api/redressement-bureau/[id] - Get redressement by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const redressementId = parseInt(id);
    
    const redressement = await prisma.redressementBureauVote.findUnique({
      where: { code: redressementId },
      include: {
        bureauVote: {
          select: {
            code: true,
            designation: true,
            arrondissement: {
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
            }
          }
        }
      }
    });

    if (!redressement) {
      const response = NextResponse.json(
        { error: 'Redressement not found' },
        { status: 404 }
      );
      return addCorsHeaders(request, response);
    }

    const response = NextResponse.json(redressement);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error fetching redressement:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch redressement' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// PUT /api/redressement-bureau/[id] - Update redressement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const redressementId = parseInt(id);
    const body = await request.json();
    const {
      code_bureau_vote,
      nombre_inscrit_initial,
      nombre_inscrit_redresse,
      nombre_votant_initial,
      nombre_votant_redresse,
      raison_redressement
    } = body;

    const redressement = await prisma.redressementBureauVote.update({
      where: { code: redressementId },
      data: {
        code_bureau_vote: parseInt(code_bureau_vote),
        nombre_inscrit_initial: parseInt(nombre_inscrit_initial),
        nombre_inscrit_redresse: parseInt(nombre_inscrit_redresse),
        nombre_votant_initial: parseInt(nombre_votant_initial),
        nombre_votant_redresse: parseInt(nombre_votant_redresse),
        raison_redressement
      },
      include: {
        bureauVote: {
          select: {
            code: true,
            designation: true,
            arrondissement: {
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
            }
          }
        }
      }
    });

    const response = NextResponse.json(redressement);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error updating redressement:', error);
    const response = NextResponse.json(
      { error: 'Failed to update redressement' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// DELETE /api/redressement-bureau/[id] - Delete redressement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const redressementId = parseInt(id);
    
    await prisma.redressementBureauVote.delete({
      where: { code: redressementId }
    });

    const response = NextResponse.json({ message: 'Redressement deleted successfully' });
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error deleting redressement:', error);
    const response = NextResponse.json(
      { error: 'Failed to delete redressement' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}
