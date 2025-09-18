import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

// GET /api/membre-commission - Get all members
export async function GET(request: NextRequest) {
  try {
    const membres = await prisma.membreCommission.findMany({
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
      },
      orderBy: {
        date_creation: 'desc'
      }
    });

    const response = NextResponse.json(membres);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error fetching members:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// POST /api/membre-commission - Create new member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      noms_prenoms,
      contact,
      email,
      code_commission,
      code_fonction
    } = body;

    const membre = await prisma.membreCommission.create({
      data: {
        noms_prenoms,
        contact,
        email,
        code_commission: parseInt(code_commission),
        code_fonction: parseInt(code_fonction),
        date_creation: new Date().toISOString(),
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

    const response = NextResponse.json(membre, { status: 201 });
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error creating member:', error);
    const response = NextResponse.json(
      { error: 'Failed to create member' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}