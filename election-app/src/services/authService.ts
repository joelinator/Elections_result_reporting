// services/authService.ts
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import type { UserSession } from '@/types/auth';

const prisma = new PrismaClient();

export interface LoginResult {
  success: boolean;
  user?: UserSession;
  token?: string;
  error?: string;
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

  async login(username: string, password: string, rememberMe?: boolean): Promise<LoginResult> {
    try {
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
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      // Verify password (plain text for demo purposes)
      if (user.password !== password) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      // Get user permissions from role
      const permissions = user.role?.rolePermissions?.map(rp => rp.permission.nom_permission) || [];

      // Create user session object
      const userSession: UserSession = {
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
      const tokenExpiry = rememberMe ? '30d' : this.JWT_EXPIRES_IN;
      const token = this.generateToken(userSession, tokenExpiry);

      // Update last login
      await this.updateLastLogin(user.code);

      return {
        success: true,
        user: userSession,
        token
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'An error occurred during login'
      };
    }
  }

  async logout(token: string): Promise<boolean> {
    try {
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  async verifyToken(token: string): Promise<UserSession | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
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
        return null;
      }

      // Get fresh permissions from role
      const permissions = user.role?.rolePermissions?.map(rp => rp.permission.nom_permission) || [];

      return {
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

    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  private generateToken(user: UserSession, expiresIn: string): string {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role.libelle,
        permissions: user.permissions || []
      },
      this.JWT_SECRET,
      { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] }
    );
  }

  private async updateLastLogin(userId: number): Promise<void> {
    await prisma.utilisateur.update({
      where: { code: userId },
      data: { 
        last_login: new Date().toISOString(),
        date_modification: new Date().toISOString()
      }
    });
  }
}