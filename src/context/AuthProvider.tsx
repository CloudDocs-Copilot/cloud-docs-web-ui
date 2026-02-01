import { useState, useMemo, useEffect, useCallback } from 'react';
import { loginRequest, logoutRequest } from '../services/auth.service';
import type { UserDTO } from '../services/auth.service';
import { AuthContext, type AuthState } from './AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDTO | null>(() => {
    const raw = localStorage.getItem('auth_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserDTO;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    setLoading(false);
  }, []);

  // Listen for global unauthorized events (emitted by api client) and clear auth state
  useEffect(() => {
    const handler = () => {
      setUser(null);
      try { localStorage.removeItem('auth_user'); } catch {}
    };
    window.addEventListener('app:unauthenticated', handler as EventListener);
    return () => window.removeEventListener('app:unauthenticated', handler as EventListener);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await loginRequest({ email, password });
    setUser(r.user);
    localStorage.setItem('auth_user', JSON.stringify(r.user));
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      localStorage.removeItem('auth_user');
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, isAuthenticated, login, logout }),
    [user, loading, isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
