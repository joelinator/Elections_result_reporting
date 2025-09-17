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

    // Find user with role and department assignments
    const user = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { username: username },
          { email: username }
        ],
        statut_vie: 1 // Active users only
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        },
        utilisateurDepartements: {
          include: {
            departement: true
          }
        }
      }
    });

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