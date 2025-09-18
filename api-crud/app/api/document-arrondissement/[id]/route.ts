import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addCorsHeaders, createCorsPreflightResponse } from '@/lib/cors'
import { extractFileFromRequest, saveFile, validateFile } from '@/lib/fileUpload'

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return createCorsPreflightResponse(request);
}

// GET /api/document-arrondissement/[id] - Get document by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = parseInt(params.id);
    
    const document = await prisma.documentArrondissement.findUnique({
      where: { code: documentId },
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

    if (!document) {
      const response = NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
      return addCorsHeaders(request, response);
    }

    const response = NextResponse.json(document);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error fetching document:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// PUT /api/document-arrondissement/[id] - Update document
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = parseInt(params.id);
    
    // Extraire le fichier et les données du formulaire
    const { file, formData } = await extractFileFromRequest(request);
    
    const code_arrondissement = formData.get('code_arrondissement') as string;
    const type_document = formData.get('type_document') as string;
    const titre = formData.get('titre') as string;
    const description = formData.get('description') as string;
    const statut = formData.get('statut') as string;

    // Récupérer le document existant
    const existingDocument = await prisma.documentArrondissement.findUnique({
      where: { code: documentId }
    });

    if (!existingDocument) {
      const response = NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
      return addCorsHeaders(request, response);
    }

    let url_document = existingDocument.url_document;
    let hash_file = existingDocument.hash_file;

    // Si un nouveau fichier est fourni, le sauvegarder
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

    const document = await prisma.documentArrondissement.update({
      where: { code: documentId },
      data: {
        code_arrondissement: parseInt(code_arrondissement),
        type_document,
        titre,
        description,
        url_document,
        hash_file,
        statut,
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

    const response = NextResponse.json(document);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error updating document:', error);
    const response = NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// DELETE /api/document-arrondissement/[id] - Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = parseInt(params.id);
    
    await prisma.documentArrondissement.delete({
      where: { code: documentId }
    });

    const response = NextResponse.json({ message: 'Document deleted successfully' });
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error deleting document:', error);
    const response = NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}