import { useState, useMemo, useEffect, useCallback } from 'react';
import { loginRequest, logoutRequest } from '../services/auth.service';
import type { UserDTO } from '../services/auth.service';
import { AuthContext, type AuthState } from './AuthContext';
import { useCsrfToken } from './CsrfContext';

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
      try { localStorage.removeItem('auth_user'); } catch {
        // Ignore localStorage errors (e.g., in incognito mode)
      }
    };
    window.addEventListener('app:unauthenticated', handler as EventListener);
    return () => window.removeEventListener('app:unauthenticated', handler as EventListener);
  }, []);

  const { refreshToken: refreshCsrfToken } = useCsrfToken();

  const login = useCallback(async (email: string, password: string) => {
    // 1. POST /api/auth/login → éxito
    const r = await loginRequest({ email, password });
    setUser(r.user);
    localStorage.setItem('auth_user', JSON.stringify(r.user));
    
    // 2. GET /api/csrf-token → obtener nuevo token CSRF para la nueva sesión autenticada
    try {
      console.debug('[Auth] 🔄 Refreshing CSRF token after login...');
      await refreshCsrfToken();
      console.info('[Auth] ✅ CSRF token refreshed after login');
    } catch (csrfError) {
      // Log el error pero no falla el login - el siguiente request puede fallar si es crítico
      console.error('[Auth] ⚠️ Failed to refresh CSRF token after login:', csrfError);
      // No lanzar error: el login fue exitoso, solo el refresh del token falló
    }
  }, [refreshCsrfToken]);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setUser(null);
      localStorage.removeItem('auth_user');
      // Para logout, no necesitamos refrescar CSRF (sesión termina)
    }
  }, [refreshCsrfToken]);

  const value = useMemo<AuthState>(
    () => ({ user, loading, isAuthenticated, login, logout }),
    [user, loading, isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
