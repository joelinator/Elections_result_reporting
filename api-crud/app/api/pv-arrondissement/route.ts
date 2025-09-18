import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractFileFromRequest, validateFile, saveFile } from '../../../lib/fileUpload';
import { addCorsHeaders } from '../../../lib/cors';

const prisma = new PrismaClient();

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(request, new NextResponse(null, { status: 200 }));
}

// GET /api/pv-arrondissement - Get all PV arrondissement
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const arrondissementCode = searchParams.get('arrondissement');
    
    const where: any = {};
    if (arrondissementCode) {
      where.code_arrondissement = parseInt(arrondissementCode);
    }

    const pvs = await prisma.pvArrondissement.findMany({
      where,
      include: {
        arrondissement: {
          select: {
            code: true,
            libelle: true,
            abbreviation: true,
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
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    const response = NextResponse.json(pvs);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error fetching PV arrondissement:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch PV arrondissement' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// POST /api/pv-arrondissement - Create new PV arrondissement
export async function POST(request: NextRequest) {
  try {
    // Extraire le fichier et les données du formulaire
    const { file, formData } = await extractFileFromRequest(request);
    
    const code_arrondissement = formData.get('code_arrondissement') as string;
    const libelle = formData.get('libelle') as string;

    let url_pv = '';
    let hash_file = '';

    // Si un fichier est fourni, le sauvegarder
    if (file) {
      const validation = validateFile(file);
      if (!validation.isValid) {
        const response = NextResponse.json(
          { error: validation.error },
          { status: 400 }
        );
        return addCorsHeaders(request, response);
      }

      const fileResult = await saveFile(file);
      url_pv = fileResult.path;
      hash_file = fileResult.hash;
    }

    const pv = await prisma.pvArrondissement.create({
      data: {
        code_arrondissement: parseInt(code_arrondissement),
        libelle,
        url_pv,
        hash_file
      },
      include: {
        arrondissement: {
          select: {
            code: true,
            libelle: true,
            abbreviation: true,
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
        }
      }
    });

    const response = NextResponse.json(pv, { status: 201 });
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error creating PV arrondissement:', error);
    const response = NextResponse.json(
      { error: 'Failed to create PV arrondissement' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}
