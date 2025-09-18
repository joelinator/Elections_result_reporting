import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

// GET /api/redressement-bureau - Get all redressements bureau
export async function GET(request: NextRequest) {
  try {
    const redressements = await prisma.redressementBureauVote.findMany({
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
      },
      orderBy: {
        date_redressement: 'desc'
      }
    });

    const response = NextResponse.json(redressements);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error fetching redressements bureau:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch redressements bureau' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// POST /api/redressement-bureau - Create new redressement bureau
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code_bureau_vote,
      nombre_inscrit_initial,
      nombre_inscrit_redresse,
      nombre_votant_initial,
      nombre_votant_redresse,
      raison_redressement
    } = body;

    const redressement = await prisma.redressementBureauVote.create({
      data: {
        code_bureau_vote: parseInt(code_bureau_vote),
        nombre_inscrit_initial: parseInt(nombre_inscrit_initial),
        nombre_inscrit_redresse: parseInt(nombre_inscrit_redresse),
        nombre_votant_initial: parseInt(nombre_votant_initial),
        nombre_votant_redresse: parseInt(nombre_votant_redresse),
        raison_redressement,
        date_redressement: new Date()
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

    const response = NextResponse.json(redressement, { status: 201 });
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error creating redressement bureau:', error);
    const response = NextResponse.json(
      { error: 'Failed to create redressement bureau' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}
