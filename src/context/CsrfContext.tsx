import React, { useState, useEffect, useCallback } from 'react';
import { CsrfContext, CsrfContextValue } from './CsrfContext';

/**
 * Provider para el contexto CSRF
 * Debe envolver toda la aplicación para que el token esté disponible
 */
export const CsrfProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Obtiene el token CSRF del servidor
   */
  const fetchToken = useCallback(async (): Promise<string> => {
    try {
      setIsLoading(true);
      setError(null);

      // El endpoint ya está configurado en apiClient con baseURL
      // Así que usamos una ruta relativa
      const response = await fetch('/csrf-token', {
        method: 'GET',
        credentials: 'include', // Incluir cookies automáticamente
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch CSRF token: ${response.status}`);
      }

      const data = await response.json();
      const fetchedToken = data.token || data.csrfToken;

      if (!fetchedToken) {
        throw new Error('No token in response');
      }

      setToken(fetchedToken);
      console.log('[CSRF] Token obtenido exitosamente');
      return fetchedToken;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('[CSRF] Error obteniendo token:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Inicializa el token CSRF cuando el componente se monta
   */
  useEffect(() => {
    const initialize = async () => {
      try {
        await fetchToken();
      } catch {
        // El error ya fue capturado en fetchToken y guardado en state
        // Continuamos aunque falle (se intentará obtener en la primera petición)
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
  }, [fetchToken]);

  /**
   * Refresca el token CSRF (útil si expira)
   */
  const refreshToken = useCallback(async (): Promise<string> => {
    return fetchToken();
  }, [fetchToken]);

  const value: CsrfContextValue = {
    token,
    isInitialized,
    isLoading,
    error,
    refreshToken,
  };

  return (
    <CsrfContext.Provider value={value}>
      {children}
    </CsrfContext.Provider>
  );
};
