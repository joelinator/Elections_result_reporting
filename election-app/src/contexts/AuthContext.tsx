// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UserSession, getSession } from '@/lib/auth';

interface AuthContextType {
  user: UserSession | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
  refresh: () => void;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
  refresh: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to get token from localStorage
    const token = localStorage.getItem('auth-token');
    
    if (token) {
      getSession(token).then((session) => {
        setUser(session);
        setIsLoading(false);
      }).catch(() => {
        // Invalid token, remove it
        localStorage.removeItem('auth-token');
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('auth-token', token);
    getSession(token).then(setUser);
  };

  const logout = () => {
    localStorage.removeItem('auth-token');
    setUser(null);
  };

  const refresh = () => {
    const token = localStorage.getItem('auth-token');
    if (token) {
      getSession(token).then(setUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}