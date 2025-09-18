import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

// GET /api/territorial-access/can-edit-bureau-vote/[code] - Check if user can edit bureau de vote data
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const bureauVoteCode = parseInt(params.code)
    
    // Check if user has direct access to this bureau de vote
    const directAccess = await prisma.utilisateurBureauVote.findFirst({
      where: {
        code_bureau_vote: bureauVoteCode
      }
    })

    // Check if user has access through arrondissement or department
    const bureauVote = await prisma.bureauVote.findUnique({
      where: { code: bureauVoteCode },
      select: { 
        code_arrondissement: true,
        arrondissement: {
          select: {
            code_departement: true
          }
        }
      }
    })

    let arrondissementAccess = false
    let departmentAccess = false

    if (bureauVote?.code_arrondissement) {
      arrondissementAccess = !!(await prisma.utilisateurArrondissement.findFirst({
        where: {
          code_arrondissement: bureauVote.code_arrondissement
        }
      }))
    }

    if (bureauVote?.arrondissement?.code_departement) {
      departmentAccess = !!(await prisma.utilisateurDepartement.findFirst({
        where: {
          code_departement: bureauVote.arrondissement.code_departement
        }
      }))
    }

    const hasAccess = !!directAccess || arrondissementAccess || departmentAccess
    const canEdit = hasAccess // For now, allow edit if user has access

    const response = NextResponse.json({ canEdit })
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  } catch (error) {
    console.error('Error checking bureau de vote edit access:', error)
    const response = NextResponse.json(
      { error: 'Failed to check bureau de vote edit access' },
      { status: 500 }
    )
    response.headers.set('Access-Control-Allow-Origin', '*')
    return response
  }
}
