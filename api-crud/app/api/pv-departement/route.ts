import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'
import { extractFileFromRequest, saveFile, validateFile } from '@/lib/fileUpload'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

// GET /api/pv-departement - Get all PVs
export async function GET(request: NextRequest) {
  try {
    const pvs = await prisma.pvDepartement.findMany({
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
      },
      orderBy: {
        date_creation: 'desc'
      }
    });

    const response = NextResponse.json(pvs);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error fetching PVs:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch PVs' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// POST /api/pv-departement - Create new PV
export async function POST(request: NextRequest) {
  try {
    // Extraire le fichier et les données du formulaire
    const { file, formData } = await extractFileFromRequest(request);
    
    const code_departement = formData.get('code_departement') as string;
    const numero_pv = formData.get('numero_pv') as string;
    const date_etablissement = formData.get('date_etablissement') as string;
    const statut = formData.get('statut') as string;

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

    const pv = await prisma.pvDepartement.create({
      data: {
        code_departement: parseInt(code_departement),
        numero_pv,
        date_etablissement,
        url_pv,
        hash_file,
        statut: statut || 'brouillon',
        date_creation: new Date().toISOString(),
        date_modification: new Date().toISOString()
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

    const response = NextResponse.json(pv, { status: 201 });
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error creating PV:', error);
    const response = NextResponse.json(
      { error: 'Failed to create PV' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}