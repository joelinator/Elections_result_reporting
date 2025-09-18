import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractUserFromToken, getDepartmentFilter } from '@/lib/auth-helper'
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

// GET /api/pv-departement - Get all PV by department
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departementCode = searchParams.get('departement')
    const regionCode = searchParams.get('region')
    
    // Extract user info from JWT token
    const authHeader = request.headers.get('authorization')
    const userInfo = extractUserFromToken(authHeader)
    
    const where: Record<string, unknown> = {}
    
    if (departementCode) {
      where.code_departement = parseInt(departementCode)
    }
    
    // Si on filtre par région, on doit joindre avec les départements
    if (regionCode) {
      where.departement = {
        code_region: parseInt(regionCode)
      }
    }

    // Apply department-based filtering for scrutateur-departementale and validateur-departemental roles
    if (userInfo && (userInfo.role === 'scrutateur-departementale' || userInfo.role === 'validateur-departemental')) {
      const departmentFilter = await getDepartmentFilter(userInfo.id, userInfo.role)
      where = { ...where, ...departmentFilter }
    }

    const pvList = await prisma.pvDepartement.findMany({
      where,
      include: {
        departement: {
          select: {
            code: true,
            libelle: true,
            abbreviation: true,
            chef_lieu: true,
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

    const response = NextResponse.json(pvList)
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error fetching pv departement:', error)
    const response = NextResponse.json(
      { error: 'Failed to fetch pv departement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}

// POST /api/pv-departement - Create a new PV with file upload
export async function POST(request: NextRequest) {
  try {
    const { file, formData } = await extractFileFromRequest(request)
    
    // Récupérer les autres données du formulaire
    const code_departement = formData.get('code_departement') as string
    const libelle = formData.get('libelle') as string
    
    if (!code_departement || !libelle) {
      const response = NextResponse.json(
        { error: 'code_departement and libelle are required' },
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
    const pv = await prisma.pvDepartement.create({
      data: {
        code_departement: parseInt(code_departement),
        libelle,
        url_pv: fileInfo.path,
        hash_file: fileInfo.hash,
        timestamp: new Date()
      },
      include: {
        departement: {
          select: {
            code: true,
            libelle: true,
            abbreviation: true,
            region: {
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

    const response = NextResponse.json(pv, { status: 201 })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error creating pv departement:', error)
    const response = NextResponse.json(
      { error: 'Failed to create pv departement' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
