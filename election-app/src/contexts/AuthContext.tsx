// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';
import type { UserSession, AuthContextType } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const authService = new AuthService();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const verifiedUser = await authService.verifyToken(token);
      if (verifiedUser) {
        setUser(verifiedUser);
        setIsAuthenticated(true);
      } else {
        // Token is invalid, remove it
        removeStoredToken();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      removeStoredToken();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: { username: string; password: string }) => {
    try {
      const response = await authService.login(credentials.username, credentials.password);
      
      // Store token
      storeToken(response.token);
      
      // Update state
      setUser(response.user);
      setIsAuthenticated(true);
      
      console.log('User logged in:', response.user.username);
      return response; // Return response for redirect logic
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = getStoredToken();
      if (token) {
        await authService.logout(token);
      }
      
      // Clear state
      removeStoredToken();
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to login
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const hasPermission = (permission: string, context?: { departmentCode?: number; regionCode?: number; userId?: number }): boolean => {
    if (!user || !user.permissions) {
      return false;
    }

    // Check direct permission
    if (user.permissions.includes(permission)) {
      return true;
    }

    // Check role-based permissions
    const role = user.role.libelle;
    
    // System admin has all permissions
    if (role === 'Administrateur Système') {
      return true;
    }

    // Context-based permission checks
    if (context?.departmentCode && user.departements) {
      const hasAccessToDepartment = user.departements.some(d => d.code === context.departmentCode);
      
      if (hasAccessToDepartment) {
        // Check department-specific permissions
        const departmentPermissions = [
          'data.view_department',
          'data.edit_department',
          'participation.manage',
          'results.manage',
          'redressements.manage'
        ];
        
        if (departmentPermissions.includes(permission) && 
            (role === 'Responsable Départemental' || role === 'Opérateur de Saisie')) {
          return true;
        }
      }
    }

    return false;
  };

  const canAccessDepartment = (departmentCode: number): boolean => {
    if (!user) return false;
    
    // System admin can access all departments
    if (user.role.libelle === 'Administrateur Système') {
      return true;
    }

    // Check if user is assigned to this department
    return user.departements?.some(d => d.code === departmentCode) || false;
  };

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) return;

    try {
      const verifiedUser = await authService.verifyToken(token);
      if (verifiedUser) {
        setUser(verifiedUser);
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      await logout();
    }
  };

  // Token storage utilities
  const storeToken = (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  };

  const getStoredToken = (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  };

  const removeStoredToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    canAccessDepartment,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}