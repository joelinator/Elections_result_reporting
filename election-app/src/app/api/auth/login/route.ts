// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Mock user data for demo purposes - in production this would come from database
const mockUsers = [
  {
    code: 1,
    username: 'admin',
    password: 'admin123',
    noms_prenoms: 'Administrateur Système',
    email: 'admin@elections.cm',
    role: { libelle: 'Administrateur' },
    utilisateurDepartements: [{ code_departement: 1 }, { code_departement: 2 }],
    statut_vie: 1
  },
  {
    code: 2,
    username: 'jmballa',
    password: 'password123',
    noms_prenoms: 'Jean MBALLA',
    email: 'jean.mballa@elections.cm',
    role: { libelle: 'Utilisateur' },
    utilisateurDepartements: [{ code_departement: 3 }],
    statut_vie: 1
  },
  {
    code: 3,
    username: 'mngono',
    password: 'password123',
    noms_prenoms: 'Marie NGONO',
    email: 'marie.ngono@elections.cm',
    role: { libelle: 'Utilisateur' },
    utilisateurDepartements: [{ code_departement: 4 }],
    statut_vie: 1
  }
];

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Find user by username
    const user = mockUsers.find(u => u.username === username);

    if (!user || user.statut_vie !== 1) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Check password (plain text for demo)
    if (password !== user.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user.code,
        role: user.role?.libelle || 'user',
        departments: user.utilisateurDepartements.map(ud => ud.code_departement).filter(Boolean)
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    // Return token and user info
    return NextResponse.json({
      token,
      user: {
        id: user.code,
        username: user.username,
        name: user.noms_prenoms,
        email: user.email,
        role: user.role?.libelle || 'user',
        departments: user.utilisateurDepartements.map(ud => ud.code_departement).filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}