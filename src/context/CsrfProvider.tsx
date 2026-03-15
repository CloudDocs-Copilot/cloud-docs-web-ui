import React, { useState, useEffect, useCallback } from 'react';
import { CsrfContext, type CsrfContextValue } from './CsrfContext';
import { API_BASE_URL } from '../config/env';

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
      console.debug('[CSRF-Provider] Fetching token from:', csrfUrl);

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
      const fetchedToken = data.token || data.csrfToken;

      if (!fetchedToken) {
        console.warn('[CSRF-Provider] Response data received but no token found:', Object.keys(data));
        throw new Error('No token in response');
      }

      setToken(fetchedToken);
      console.info('[CSRF-Provider] Token obtenido exitosamente (length:', fetchedToken.length + ')');
      return fetchedToken;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      console.error('[CSRF-Provider] Error obteniendo token:', {
        message: error.message,
        apiBaseUrl: API_BASE_URL,
      });
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
        console.debug('[CSRF-Provider] Initializing CSRF token on mount...');
        await fetchToken();
      } catch {
        // El error ya fue capturado en fetchToken y guardado en state
        // Continuamos aunque falle (se intentará obtener en la primera petición)
        console.warn('[CSRF-Provider] Failed to initialize CSRF token on mount, will retry later');
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
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

  return (
    <CsrfContext.Provider value={value}>
      {children}
    </CsrfContext.Provider>
  );
};
