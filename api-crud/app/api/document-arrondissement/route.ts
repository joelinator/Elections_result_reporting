import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'
import { extractFileFromRequest, saveFile, validateFile } from '@/lib/fileUpload'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

// GET /api/document-arrondissement - Get all documents
export async function GET(request: NextRequest) {
  try {
    const documents = await prisma.documentArrondissement.findMany({
      include: {
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
      },
      orderBy: {
        date_creation: 'desc'
      }
    });

    const response = NextResponse.json(documents);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error fetching documents:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// POST /api/document-arrondissement - Create new document
export async function POST(request: NextRequest) {
  try {
    // Extraire le fichier et les données du formulaire
    const { file, formData } = await extractFileFromRequest(request);
    
    const code_arrondissement = formData.get('code_arrondissement') as string;
    const type_document = formData.get('type_document') as string;
    const titre = formData.get('titre') as string;
    const description = formData.get('description') as string;
    const statut = formData.get('statut') as string;

    let url_document = '';
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
      url_document = fileResult.path;
      hash_file = fileResult.hash;
    }

    const document = await prisma.documentArrondissement.create({
      data: {
        code_arrondissement: parseInt(code_arrondissement),
        type_document,
        titre,
        description,
        url_document,
        hash_file,
        statut: statut || 'brouillon',
        date_creation: new Date().toISOString(),
        date_modification: new Date().toISOString()
      },
      include: {
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
    });

    const response = NextResponse.json(document, { status: 201 });
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error creating document:', error);
    const response = NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}