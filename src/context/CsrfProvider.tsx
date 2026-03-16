import React, { useState, useEffect, useCallback } from 'react';
import { CsrfContext, type CsrfContextValue } from './CsrfContext';
import { API_BASE_URL } from '../config/env';
import { setCsrfToken } from '../api/httpClient.config';

/**
 * Declare global Window interface for CSRF debug state
 * Allows exposing __CSRF_STATE__ without using 'any' type
 */
declare global {
  interface Window {
    __CSRF_STATE__?: {
      token: string | null;
      tokenLength?: number;
      isInitialized: boolean;
      isLoading: boolean;
      error: string | null;
      hasWindowCsrfToken: boolean;
      windowCsrfToken: string | null;
    };
    csrfToken?: string;
  }
}

/**
 * Provider para el Contexto CSRF
 * Obtiene el token CSRF del servidor al montar y lo proporciona a toda la aplicación
 * Debe envolver toda la aplicación para que el token esté accesible
 *
 * @example
 * ```tsx
 * <CsrfProvider>
 *   <App />
 * </CsrfProvider>
 * ```
 */
export const CsrfProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Obtiene el token CSRF del servidor usando la URL correcta del backend
   * Usa fetch en lugar de axios para evitar dependencias circulares
   */
  const fetchToken = useCallback(async (): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      // Construir la URL completa del endpoint CSRF usando el backend API_BASE_URL
      const csrfUrl = `${API_BASE_URL}/csrf-token`;
      console.debug('[CSRF-Provider] 🔄 Fetching token from:', csrfUrl);

      const response = await fetch(csrfUrl, {
        method: 'GET',
        credentials: 'include', // Incluir cookies automáticamente
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.debug('[CSRF-Provider] 📦 Response from /api/csrf-token:', {
        hasToken: !!data.token,
        tokenLength: data.token?.length,
        keys: Object.keys(data),
      });

      const fetchedToken = data.token || data.csrfToken;

      if (!fetchedToken) {
        console.warn('[CSRF-Provider] ❌ Response data received but no token found:', Object.keys(data));
        throw new Error('No token in response');
      }

      setToken(fetchedToken);
      // Sincronizar el token con httpClient global para que se use en peticiones
      setCsrfToken(fetchedToken);
      console.info('[CSRF-Provider] ✅ Token obtenido y sincronizado exitosamente:', {
        tokenLength: fetchedToken.length,
        tokenPreview: `${fetchedToken.substring(0, 20)}...`,
        storedInWindow: typeof window.csrfToken !== 'undefined',
      });
      return fetchedToken;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('[CSRF-Provider] ❌ Error obteniendo token:', {
        message: error.message,
        apiBaseUrl: API_BASE_URL,
        stack: error.stack,
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Inicializa el token CSRF cuando el componente se monta
   * Solo se ejecuta UNA VEZ al montar el provider
   */
  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      try {
        console.debug('[CSRF-Provider] Initializing CSRF token on mount...');
        const token = await fetchToken();
        
        if (isMounted) {
          console.info('[CSRF-Provider] ✅ CSRF token initialized successfully:', {
            tokenLength: token?.length,
            stored: !!token,
          });
        }
      } catch (error) {
        // El error ya fue capturado en fetchToken y guardado en state
        // Continuamos aunque falle (se intentará obtener en la primera petición)
        if (isMounted) {
          console.warn('[CSRF-Provider] ⚠️ Failed to initialize CSRF token on mount, will retry later:', error);
        }
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    initialize();

    // Cleanup para evitar memory leaks si el provider se desmonta
    return () => {
      isMounted = false;
    };
  }, [fetchToken]);

  /**
   * Refresca el token CSRF (útil si expira o es inválido)
   */
  const refreshToken = useCallback(async (): Promise<string> => {
    console.debug('[CSRF-Provider] Refreshing CSRF token...');
    return fetchToken();
  }, [fetchToken]);

  const value: CsrfContextValue = {
    token,
    isInitialized,
    isLoading,
    error,
    refreshToken,
  };

  // Debug: Exponer globalmente para verificar en consola del navegador
  if (typeof window !== 'undefined') {
    const csrfToken = window.csrfToken;
    window.__CSRF_STATE__ = {
      token: token ? `${token.substring(0, 30)}...` : null,
      tokenLength: token?.length,
      isInitialized,
      isLoading,
      error: error?.message || null,
      hasWindowCsrfToken: typeof csrfToken !== 'undefined',
      windowCsrfToken: csrfToken ? `${csrfToken.substring(0, 30)}...` : null,
    };
  }

  return (
    <CsrfContext.Provider value={value}>
      {children}
    </CsrfContext.Provider>
  );
};
