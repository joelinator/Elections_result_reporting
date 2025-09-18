import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { extractFileFromRequest, validateFile, saveFile } from '../../../../lib/fileUpload';
import { addCorsHeaders } from '../../../../lib/cors';

const prisma = new PrismaClient();

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(request, new NextResponse(null, { status: 200 }));
}

// GET /api/pv-arrondissement/[id] - Get PV arrondissement by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pvId = parseInt(id);

    const pv = await prisma.pvArrondissement.findUnique({
      where: { code: pvId },
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

    if (!pv) {
      const response = NextResponse.json(
        { error: 'PV arrondissement not found' },
        { status: 404 }
      );
      return addCorsHeaders(request, response);
    }

    const response = NextResponse.json(pv);
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

// PUT /api/pv-arrondissement/[id] - Update PV arrondissement
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pvId = parseInt(id);
    
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

    const updateData: Record<string, unknown> = {
      libelle
    };

    if (code_arrondissement) {
      updateData.code_arrondissement = parseInt(code_arrondissement);
    }
    if (url_pv) {
      updateData.url_pv = url_pv;
    }
    if (hash_file) {
      updateData.hash_file = hash_file;
    }

    const pv = await prisma.pvArrondissement.update({
      where: { code: pvId },
      data: updateData,
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

    const response = NextResponse.json(pv);
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error updating PV arrondissement:', error);
    const response = NextResponse.json(
      { error: 'Failed to update PV arrondissement' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}

// DELETE /api/pv-arrondissement/[id] - Delete PV arrondissement
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pvId = parseInt(id);

    await prisma.pvArrondissement.delete({
      where: { code: pvId }
    });

    const response = NextResponse.json({ message: 'PV arrondissement deleted successfully' });
    return addCorsHeaders(request, response);
  } catch (error) {
    console.error('Error deleting PV arrondissement:', error);
    const response = NextResponse.json(
      { error: 'Failed to delete PV arrondissement' },
      { status: 500 }
    );
    return addCorsHeaders(request, response);
  }
}
