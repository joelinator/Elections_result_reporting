import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'election-secret-key-2024'
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Mock user verification - replace with real database query
    const mockUsers = [
      {
        code: 1,
        username: "admin",
        email: "admin@elections.cm",
        noms_prenoms: "Administrateur Système",
        role: {
          code: 1,
          libelle: "Administrateur Système"
        },
        departements: [],
        permissions: ["system.admin", "users.manage", "data.view_all", "data.edit_all"]
      },
      {
        code: 2,
        username: "jmballa",
        email: "jean.mballa@elections.cm",
        noms_prenoms: "Jean MBALLA",
        role: {
          code: 4,
          libelle: "Responsable Départemental"
        },
        departements: [{ code: 1, libelle: "Wouri" }],
        permissions: ["data.view_department", "data.edit_department", "participation.manage"]
      }
    ]

    const user = mockUsers.find(u => u.code === decoded.id)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.code,
        code: user.code,
        username: user.username,
        email: user.email,
        noms_prenoms: user.noms_prenoms,
        role: user.role,
        departements: user.departements,
        permissions: user.permissions
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}