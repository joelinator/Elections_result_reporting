import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const { username, password, rememberMe } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Mock users for testing - replace with real database query
    const mockUsers = [
      {
        code: 1,
        username: "admin",
        password: "admin123",
        email: "admin@elections.cm",
        noms_prenoms: "Administrateur Système",
        role: {
          code: 1,
          libelle: "Administrateur Système",
          rolePermissions: [
            { permission: { nom_permission: "system.admin" } },
            { permission: { nom_permission: "users.manage" } },
            { permission: { nom_permission: "data.view_all" } },
            { permission: { nom_permission: "data.edit_all" } },
            { permission: { nom_permission: "participation.manage" } },
            { permission: { nom_permission: "results.manage" } },
            { permission: { nom_permission: "reports.create" } }
          ]
        },
        utilisateurDepartements: []
      },
      {
        code: 2,
        username: "jmballa",
        password: "password123",
        email: "jean.mballa@elections.cm",
        noms_prenoms: "Jean MBALLA",
        role: {
          code: 4,
          libelle: "Responsable Départemental",
          rolePermissions: [
            { permission: { nom_permission: "data.view_department" } },
            { permission: { nom_permission: "data.edit_department" } },
            { permission: { nom_permission: "participation.manage" } },
            { permission: { nom_permission: "results.manage" } },
            { permission: { nom_permission: "pv.manage" } }
          ]
        },
        utilisateurDepartements: [
          { departement: { code: 1, libelle: "Wouri" } }
        ]
      },
      {
        code: 3,
        username: "mngono",
        password: "password123",
        email: "marie.ngono@elections.cm",
        noms_prenoms: "Marie NGONO",
        role: {
          code: 4,
          libelle: "Responsable Départemental",
          rolePermissions: [
            { permission: { nom_permission: "data.view_department" } },
            { permission: { nom_permission: "data.edit_department" } },
            { permission: { nom_permission: "participation.manage" } },
            { permission: { nom_permission: "results.manage" } },
            { permission: { nom_permission: "pv.manage" } }
          ]
        },
        utilisateurDepartements: [
          { departement: { code: 2, libelle: "Mfoundi" } }
        ]
      }
    ]

    // Find user by username or email
    const user = mockUsers.find(u => 
      u.username === username || u.email === username
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Verify password (simplified for demo)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Get user permissions from role
    const permissions = user.role?.rolePermissions?.map(rp => rp.permission.nom_permission) || []

    // Create user session object
    const userSession = {
      id: user.code,
      code: user.code,
      username: user.username,
      email: user.email,
      noms_prenoms: user.noms_prenoms,
      role: {
        code: user.role?.code || 0,
        libelle: user.role?.libelle || 'Unknown'
      },
      departements: user.utilisateurDepartements.map(ud => ({
        code: ud.departement.code,
        libelle: ud.departement.libelle
      })),
      permissions
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'election-secret-key-2024'
    const tokenExpiry = rememberMe ? '30d' : '24h'
    
    const token = jwt.sign(
      {
        id: user.code,
        username: user.username,
        role: user.role?.libelle || 'Unknown',
        permissions: permissions
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    )

    return NextResponse.json({
      success: true,
      user: userSession,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}