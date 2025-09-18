import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

export interface UserInfo {
  id: number;
  username: string;
  role: string;
  departements: number[];
}

/**
 * Extract user information from JWT token
 */
export function extractUserFromToken(authHeader: string | null): UserInfo | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
      departements: decoded.departements || []
    };
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}

/**
 * Get user's assigned departments from database
 */
export async function getUserDepartments(userId: number): Promise<number[]> {
  try {
    const userDepartments = await prisma.utilisateurDepartement.findMany({
      where: {
        code_utilisateur: userId
      },
      select: {
        code_departement: true
      }
    });

    return userDepartments
      .map(ud => ud.code_departement)
      .filter((code): code is number => code !== null);
  } catch (error) {
    console.error('Error fetching user departments:', error);
    return [];
  }
}

/**
 * Check if user has access to a specific department
 */
export async function hasDepartmentAccess(userId: number, departmentCode: number): Promise<boolean> {
  const userDepartments = await getUserDepartments(userId);
  return userDepartments.includes(departmentCode);
}

/**
 * Get department filter for database queries based on user role and departments
 */
export async function getDepartmentFilter(userId: number, userRole: string): Promise<{ code_departement?: { in: number[] } } | {}> {
  // If user is admin or has full access, return empty filter (no restrictions)
  if (userRole === 'administrateur' || userRole === 'superviseur-regionale') {
    return {};
  }

  // For scrutateur-departementale, validateur-departemental and other department-specific roles, filter by assigned departments
  const userDepartments = await getUserDepartments(userId);
  
  if (userDepartments.length === 0) {
    // If user has no departments assigned, return a filter that matches nothing
    return { code_departement: { in: [] } };
  }

  return { code_departement: { in: userDepartments } };
}

/**
 * Get arrondissement filter for database queries based on user role and departments
 */
export async function getArrondissementFilter(userId: number, userRole: string): Promise<{ arrondissement?: { code_departement: { in: number[] } } } | {}> {
  // If user is admin or has full access, return empty filter (no restrictions)
  if (userRole === 'administrateur' || userRole === 'superviseur-regionale') {
    return {};
  }

  // For scrutateur-departementale, validateur-departemental and other department-specific roles, filter by assigned departments
  const userDepartments = await getUserDepartments(userId);
  
  if (userDepartments.length === 0) {
    // If user has no departments assigned, return a filter that matches nothing
    return { arrondissement: { code_departement: { in: [] } } };
  }

  return { arrondissement: { code_departement: { in: userDepartments } } };
}
