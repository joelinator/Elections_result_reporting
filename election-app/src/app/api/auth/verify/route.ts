// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Verify user still exists and is active
    const user = await prisma.utilisateur.findFirst({
      where: {
        code: decoded.id,
        statut_vie: 1
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
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get fresh permissions from role
    const permissions = user.role?.rolePermissions?.map(rp => rp.permission.nom_permission) || [];

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

    return NextResponse.json({
      success: true,
      user: userSession
    });

  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}