import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { login as apiLogin, refreshToken as apiRefreshToken } from '../api/electionApi';
import type { User, LoginCredentials } from '../api/electionApi';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (requiredRoles: number[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>({
    code: 1,
    username: 'admin',
    email: 'admin@example.com',
    noms_prenoms: 'Admin',
    roles: [{ code: 6, libelle: 'superviseur-departementale' }],
    arrondissementCode: 1,
    arrondissements: [],
    role: { code: 6, libelle: 'Administrateur' },

  });
  const [isLoading, setIsLoading] = useState(true);

  // Check if user has required role(s) - supports both single role and multiple roles
  const hasRole = (requiredRoles: number[]): boolean => {
    if (!user) return false;
    
    // Handle multiple roles structure (new)
    if (user.roles && Array.isArray(user.roles)) {
      return user.roles.some(role => requiredRoles.includes(role.code));
    }
    
    // Handle single role structure (legacy)
    if (user.role) {
      return requiredRoles.includes(user.role.code);
    }
    
    return false;
  };

  // Helper: check if user matches any of the allowed role names (libelle)
  // const userHasAnyRoleName = (allowedNames: string[]): boolean => {
  //   if (!user) return false;
  //   const normalize = (s: string) => s?.toString().trim().toLowerCase();
  //   // Multiple roles structure
  //   if (user.roles && Array.isArray(user.roles)) {
  //     return user.roles.some(role => allowedNames.includes(normalize(role.libelle)));
  //   }
  //   // Single role structure
  //   if (user.role) {
  //     return allowedNames.includes(normalize(user.role.libelle));
  //   }
  //   return false;
  // };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          
          // Check if user has allowed role names (Observateur, Observateur-local, Validateur, Administrateur)
          const hasValidRole = (() => {
            const allowedNames = ['observateur', 'observateur-local', 'validateur', 'administrateur', 'scrutateur'];
            const normalize = (s: string) => s?.toString().trim().toLowerCase();
            if (userData.roles && Array.isArray(userData.roles)) {
              return userData.roles.some((role: any) => allowedNames.includes(normalize(role.libelle)));
            }
            if (userData.role) {
              return allowedNames.includes(normalize(userData.role.libelle));
            }
            return false;
          })();
          
          if (hasValidRole) {
            setUser(userData);
          } else {
            // Invalid role, clear storage
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        // Clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Token refresh mechanism
  useEffect(() => {
    if (!user) return;

    const refresh = async () => {
      try {
        const storedRefreshToken = localStorage.getItem('refreshToken');
        if (!storedRefreshToken) {
          logout();
          return;
        }

        const response = await apiRefreshToken(storedRefreshToken);
        localStorage.setItem('accessToken', response.accessToken);
        
        // Schedule next refresh (15 minutes before expiry)
        const refreshTime = (response.expiresIn - 15 * 60) * 1000;
        setTimeout(refresh, Math.max(refreshTime, 60000)); // Minimum 1 minute
      } catch (error) {
        console.error('Erreur lors du renouvellement du token:', error);
        logout();
      }
    };

    // Initial refresh schedule
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (storedRefreshToken) {
      // Schedule first refresh in 30 minutes
      setTimeout(refresh, 30 * 60 * 1000);
    }
  }, [user]);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await apiLogin(credentials);
      
      // Verify user has allowed role names (Observateur, Observateur-local, Validateur, Administrateur, Superviseur roles)
      const hasValidRole = (() => {
        const allowedNames = ['observateur', 'observateur-local', 'scrutateur', 'validateur', 'administrateur', 'superviseur-regionale', 'superviseur-departementale', 'superviseur-communale'];
        const normalize = (s: string) => s?.toString().trim().toLowerCase();
        if (response.user.roles && Array.isArray(response.user.roles)) {
          return response.user.roles.some(role => allowedNames.includes(normalize(role.libelle)));
        }
        if (response.user.role) {
          return allowedNames.includes(normalize(response.user.role.libelle));
        }
        return false;
      })();
      
      if (!hasValidRole) {
        throw new Error('Accès refusé. Seuls les utilisateurs avec les rôles autorisés peuvent accéder à ce tableau de bord.');
      }

      // Store tokens and user data
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      // Ensure error message is properly passed through
      throw new Error(error.message || 'Erreur de connexion inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};