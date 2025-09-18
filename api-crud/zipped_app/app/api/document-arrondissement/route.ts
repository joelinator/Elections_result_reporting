import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { saveFile, validateFile, extractFileFromRequest } from '@/lib/fileUpload'

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// GET /api/document-arrondissement - Get all documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const arrondissementCode = searchParams.get('arrondissement')
    
    const where = arrondissementCode 
      ? { code_arrondissement: parseInt(arrondissementCode) }
      : {}

    const documents = await prisma.pvArrondissement.findMany({
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
                abbreviation: true
              }
            },
            region: {
              select: {
                code: true,
                libelle: true,
                abbreviation: true
              }
            }
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    })

    const response = NextResponse.json(documents)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching documents:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// POST /api/document-arrondissement - Create a new document with file upload
export async function POST(request: NextRequest) {
  try {
    const { file, formData } = await extractFileFromRequest(request)
    
    // Récupérer les autres données du formulaire
    const code_arrondissement = formData.get('code_arrondissement') as string
    const libelle = formData.get('libelle') as string
    
    if (!code_arrondissement || !libelle) {
      const response = NextResponse.json(
        { error: 'code_arrondissement and libelle are required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    if (!file) {
      const response = NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // Valider le fichier
    const validation = validateFile(file)
    if (!validation.isValid) {
      const response = NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
      response.headers.set('Access-Control-Allow-Origin', '*')
      return response
    }

    // Sauvegarder le fichier
    const fileInfo = await saveFile(file)

    // Créer l'enregistrement en base
    const document = await prisma.pvArrondissement.create({
      data: {
        code_arrondissement: parseInt(code_arrondissement),
        libelle,
        url_pv: fileInfo.path,
        hash_file: fileInfo.hash,
        timestamp: new Date()
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
                abbreviation: true
              }
            }
          }
        }
      }
    })

    const response = NextResponse.json(document, { status: 201 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error creating document:', error)
    const response = NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
