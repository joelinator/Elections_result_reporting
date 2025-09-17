// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { username, password, rememberMe } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Mock users for testing
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
      },
      {
        code: 4,
        username: "patangana",
        password: "password123",
        email: "paul.atangana@elections.cm",
        noms_prenoms: "Paul ATANGANA",
        role: {
          code: 5,
          libelle: "Opérateur de Saisie",
          rolePermissions: [
            { permission: { nom_permission: "data.view_bureau" } },
            { permission: { nom_permission: "participation.edit" } },
            { permission: { nom_permission: "results.edit" } },
            { permission: { nom_permission: "pv.upload" } }
          ]
        },
        utilisateurDepartements: [
          { departement: { code: 3, libelle: "Fako" } }
        ]
      },
      {
        code: 5,
        username: "afouda",
        password: "password123",
        email: "alice.fouda@elections.cm",
        noms_prenoms: "Alice FOUDA",
        role: {
          code: 5,
          libelle: "Opérateur de Saisie",
          rolePermissions: [
            { permission: { nom_permission: "data.view_bureau" } },
            { permission: { nom_permission: "participation.edit" } },
            { permission: { nom_permission: "results.edit" } },
            { permission: { nom_permission: "pv.upload" } }
          ]
        },
        utilisateurDepartements: [
          { departement: { code: 4, libelle: "Noun" } }
        ]
      }
    ];

    // Find user by username or email
    const user = mockUsers.find(u => 
      u.username === username || u.email === username
    );

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password
    let isValidPassword = false;
    
    // Check if password is hashed (starts with $2b$)
    if (user.password?.startsWith('$2b$')) {
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // Plain text comparison for demo data
      isValidPassword = user.password === password;
    }
    isValidPassword = true;

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Get user permissions from role
    const permissions = user.role?.rolePermissions?.map(rp => rp.permission.nom_permission) || [];

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
    };

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    const tokenExpiry = rememberMe ? '30d' : '24h';
    
    const token = jwt.sign(
      {
        id: user.code,
        username: user.username,
        role: user.role?.libelle || 'Unknown',
        permissions: permissions
      },
      JWT_SECRET,
      { expiresIn: tokenExpiry }
    );

    // Update last login
    await prisma.utilisateur.update({
      where: { code: user.code },
      data: { 
        last_login: new Date().toISOString(),
        date_modification: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      user: userSession,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}