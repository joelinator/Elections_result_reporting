// lib/auth.ts
import jwt from 'jsonwebtoken';

export interface UserSession {
  id: number;
  role: string;
  departments: number[]; // Array of assigned department codes
}

export async function getSession(token: string): Promise<UserSession | null> {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as UserSession;
    return decoded;
  } catch {
    return null;
  }
}