// lib/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export interface UserSession {
  id: number;
  code: number;
  username: string;
  email: string;
  noms_prenoms: string;
  role: string;
  departments: number[]; // Array of assigned department codes
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export async function validateCredentials(credentials: LoginCredentials): Promise<UserSession | null> {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { username: credentials.username },
      include: {
        role: true,
        utilisateurDepartements: {
          include: {
            departement: true
          }
        }
      }
    });

    if (!user || !user.password) {
      return null;
    }

    // For now, support both hashed and plain text passwords (for demo)
    const isValidPassword = user.password.startsWith('$2b$') 
      ? await bcrypt.compare(credentials.password, user.password)
      : user.password === credentials.password;

    if (!isValidPassword) {
      return null;
    }

    // Update last login
    await prisma.utilisateur.update({
      where: { code: user.code },
      data: { last_login: new Date().toISOString() }
    });

    return {
      id: user.code,
      code: user.code,
      username: user.username,
      email: user.email,
      noms_prenoms: user.noms_prenoms,
      role: user.role?.libelle || 'User',
      departments: user.utilisateurDepartements.map(ud => ud.code_departement).filter(Boolean)
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function createToken(user: UserSession): string {
  return jwt.sign(
    {
      id: user.id,
      code: user.code,
      username: user.username,
      email: user.email,
      noms_prenoms: user.noms_prenoms,
      role: user.role,
      departments: user.departments
    },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '24h' }
  );
}

export async function getSession(token: string): Promise<UserSession | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as UserSession;
    return decoded;
  } catch {
    return null;
  }
}