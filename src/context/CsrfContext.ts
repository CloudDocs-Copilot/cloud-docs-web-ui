import { createContext, useContext } from 'react';

/**
 * Interfaz del Contexto CSRF
 * Define la forma del valor que proporciona el CsrfProvider
 */
export interface CsrfContextValue {
  token: string | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  refreshToken: () => Promise<string>;
}

/**
 * Contexto CSRF
 * Proporciona acceso global al token CSRF obtenido del servidor
 */
export const CsrfContext = createContext<CsrfContextValue | undefined>(undefined);

/**
 * Hook personalizado para usar el contexto CSRF
 * Debe ser usado dentro de un CsrfProvider
 *
 * @returns {CsrfContextValue} El valor del contexto CSRF
 * @throws {Error} Si se usa fuera de CsrfProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { token, isInitialized, error } = useCsrfToken();
 *   if (!isInitialized) return <div>Inicializando...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   return <div>Token listo: {token}</div>;
 * }
 * ```
 */
export const useCsrfToken = (): CsrfContextValue => {
  const context = useContext(CsrfContext);
  if (!context) {
    throw new Error('useCsrfToken debe ser usado dentro de CsrfProvider');
  }
  return context;
};
