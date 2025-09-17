// services/authService.ts
import type { UserSession } from '@/types/auth';

export interface LoginResult {
  success: boolean;
  user?: UserSession;
  token?: string;
  error?: string;
}

export class AuthService {
  async login(username: string, password: string, rememberMe?: boolean): Promise<LoginResult> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
          rememberMe
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }

      return {
        success: true,
        user: data.user,
        token: data.token
      };

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  async logout(token: string): Promise<boolean> {
    try {
      // For now, just return true since we're handling logout client-side
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  async verifyToken(token: string): Promise<UserSession | null> {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        return null;
      }

      return data.user;

    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();