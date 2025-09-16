// contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UserSession, getSession } from '@/lib/auth';

const AuthContext = createContext<{ user: UserSession | null }>({ user: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    // Mock fetching token from external API or cookie
    const token = 'your-jwt-token-from-external-api'; // Replace with actual fetch/cookie logic
    getSession(token).then(setUser);
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}