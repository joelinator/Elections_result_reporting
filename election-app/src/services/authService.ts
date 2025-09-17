// services/authService.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import type { UserSession } from '@/types/auth';

const prisma = new PrismaClient();

export interface LoginResult {
  success: boolean;
  user?: UserSession;
  token?: string;
  error?: string;
}

export interface AuthUser {
  code: number;
  noms_prenoms: string;
  email: string;
  username: string;
  contact?: string;
  role: {
    code: number;
    libelle: string;
  };
  departements?: Array<{
    code: number;
    libelle: string;
  }>;
  permissions: string[];
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
          role: true,
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

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      // Get user permissions
      const permissions = await this.getUserPermissions(user.code_role);

      // Create user session object
      const userSession: UserSession = {
        id: user.code,
        code: user.code,
        username: user.username,
        email: user.email,
        noms_prenoms: user.noms_prenoms,
        contact: user.contact,
        role: {
          code: user.role.code,
          libelle: user.role.libelle
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
      // In a production system, you might want to blacklist the token
      // For now, we'll just return true as the client will remove the token
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
          role: true,
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

      // Get fresh permissions
      const permissions = await this.getUserPermissions(user.code_role);

      return {
        id: user.code,
        code: user.code,
        username: user.username,
        email: user.email,
        noms_prenoms: user.noms_prenoms,
        contact: user.contact,
        role: {
          code: user.role.code,
          libelle: user.role.libelle
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

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const user = await prisma.utilisateur.findUnique({
        where: { code: userId }
      });

      if (!user) {
        return false;
      }

      const isValidPassword = await this.verifyPassword(currentPassword, user.password);
      if (!isValidPassword) {
        return false;
      }

      const hashedPassword = await this.hashPassword(newPassword);
      await prisma.utilisateur.update({
        where: { code: userId },
        data: { 
          password: hashedPassword,
          date_modification: new Date().toISOString()
        }
      });

      return true;
    } catch (error) {
      console.error('Change password error:', error);
      return false;
    }
  }

  private async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      // Handle both hashed and plain text passwords for demo purposes
      if (hashedPassword.startsWith('$2b$')) {
        return await bcrypt.compare(password, hashedPassword);
      } else {
        // Plain text comparison for demo data
        return password === hashedPassword;
      }
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  private generateToken(user: UserSession, expiresIn: string): string {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role.libelle,
        permissions: user.permissions
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

  private async getUserPermissions(roleCode: number): Promise<string[]> {
    try {
      // Get role permissions from database
      const rolePermissions = await prisma.rolePermission.findMany({
        where: { code_role: roleCode },
        include: { permission: true }
      });

      return rolePermissions.map(rp => rp.permission.nom_permission);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      
      // Fallback: return permissions based on role
      return this.getDefaultPermissions(roleCode);
    }
  }

  private getDefaultPermissions(roleCode: number): string[] {
    const permissionMap: Record<number, string[]> = {
      1: [ // Administrateur Système
        'system.admin',
        'users.manage',
        'roles.manage',
        'departments.manage',
        'data.view_all',
        'data.edit_all',
        'reports.generate'
      ],
      2: [ // Superviseur National
        'data.view_all',
        'reports.generate',
        'departments.view',
        'users.view'
      ],
      3: [ // Responsable Régional
        'data.view_region',
        'data.edit_region',
        'departments.view_region',
        'users.view_region'
      ],
      4: [ // Responsable Départemental
        'data.view_department',
        'data.edit_department',
        'participation.manage',
        'results.manage',
        'redressements.manage'
      ],
      5: [ // Opérateur de Saisie
        'data.view_assigned',
        'data.edit_assigned',
        'participation.edit',
        'results.edit'
      ],
      6: [ // Observateur
        'data.view_assigned'
      ]
    };

    return permissionMap[roleCode] || [];
  }
}