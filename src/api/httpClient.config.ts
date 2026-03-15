import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/api.types';

/**
 * Configuración base de la instancia de axios
 */
import { API_BASE_URL as CONFIG_API_BASE_URL } from '../config/env';

function resolveApiBaseUrl(): string {
  // Prefer any test-provided global process replacement
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maybeGlobalProcess = (globalThis as any).process as { env?: Record<string, string> } | undefined;
    if (maybeGlobalProcess && maybeGlobalProcess.env && maybeGlobalProcess.env.VITE_API_BASE_URL) {
      return maybeGlobalProcess.env.VITE_API_BASE_URL;
    }
  } catch {
    // ignore
  }

  // Then prefer real process.env
  try {
    if (typeof process !== 'undefined' && process.env && (process.env as Record<string, string>).VITE_API_BASE_URL) {
      return (process.env as Record<string, string>).VITE_API_BASE_URL;
    }
  } catch {
    // ignore
  }

  // Then try global __VITE_ENV__ used by some tests
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const g = (globalThis as any).__VITE_ENV__;
    if (g && g.VITE_API_BASE_URL) return g.VITE_API_BASE_URL;
  } catch {
    // ignore
  }

  // Fallback to canonical config which itself reads import.meta.env or defaults
  if (CONFIG_API_BASE_URL) return CONFIG_API_BASE_URL;

  return 'http://localhost:4000/api';
}

const API_BASE_URL = resolveApiBaseUrl();
const REQUEST_TIMEOUT_MS = 30000; // 30 segundos

/**
 * Variable para almacenar el token CSRF en memoria
 * IMPORTANTE: El backend implementa Double Submit Cookie estático (no regenera tokens)
 * El token se obtiene UNA SOLA VEZ al inicializar sesión y se reutiliza toda la sesión
 */
let csrfToken: string = '';
let csrfTokenPromise: Promise<string> | null = null;
let csrfTokenFetchAttempts: number = 0;
const MAX_CSRF_FETCH_ATTEMPTS = 1; // Solo intentar fetch si token está vacío

/**
 * Obtiene el token CSRF del servidor
 * Backend: Double Submit Cookie pattern - token estático por sesión
 * Frontend: Obtener UNA VEZ y reutilizar. NO se regenera en las operaciones.
 */
const fetchCsrfToken = async (): Promise<string> => {
  // Si ya hay un fetch en progreso, espera a ese
  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }

  // Si ya tenemos token, SIEMPRE devolverlo (no regenerar)
  if (csrfToken) {
    console.debug('[CSRF] Usando token almacenado (no regenerar)');
    return csrfToken;
  }

  // Verificar si ya intentamos demasiadas veces
  if (csrfTokenFetchAttempts >= MAX_CSRF_FETCH_ATTEMPTS) {
    console.warn('[CSRF] Max fetch attempts reached, continuando sin token');
    return '';
  }

  // Crear la promise y compartirla
  csrfTokenPromise = (async (): Promise<string> => {
    try {
      csrfTokenFetchAttempts++;
      console.debug(`[CSRF] Fetching CSRF token from server (attempt ${csrfTokenFetchAttempts}/${MAX_CSRF_FETCH_ATTEMPTS})...`);
      
      const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
        withCredentials: true,
      });
      
      console.debug('[CSRF] CSRF token response:', { 
        status: response.status,
        hasToken: !!response.data?.token,
        hasCsrfToken: !!response.data?.csrfToken,
        responseKeys: Object.keys(response.data || {})
      });

      const token = response.data?.token || response.data?.csrfToken || '';
      
      if (!token) {
        console.warn('[CSRF] No token found in response. Response data:', response.data);
      } else {
        csrfToken = token;
        console.info(`[CSRF] Token fetched successfully (length: ${token.length})`);
      }
      
      return token;
    } catch (error) {
      console.error('[CSRF] Error fetching CSRF token:', error);
      csrfToken = '';
      throw error;
    } finally {
      csrfTokenPromise = null; // Limpiar promise
    }
  })();

  return csrfTokenPromise;
};

/**
 * Crea y configura una instancia de axios con interceptors de seguridad
 */
const createAxiosInstance = (): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // Permite enviar cookies en peticiones cross-origin
  });

  // Interceptor de solicitud - añade token CSRF a peticiones que lo requieren
  axiosInstance.interceptors.request.use(
    async (requestConfig: InternalAxiosRequestConfig) => {
      // Las cookies (incluyendo __Host-psifi.x-csrf-token) se envían automáticamente
      // gracias a withCredentials: true
      
      // IMPORTANTE: Si se envía FormData, remover el Content-Type para que Axios
      // lo configure automáticamente con el boundary correcto
      if (requestConfig.data instanceof FormData) {
        // Eliminar Content-Type - Axios lo establecerá automáticamente
        if (requestConfig.headers) {
          delete requestConfig.headers['Content-Type'];
        }
      }
      
      // Rutas que NO requieren token CSRF en el header
      const CSRF_EXCLUDED_ROUTES = ['/auth/login', '/auth/register', '/csrf-token'];
      const requiresCsrf = !CSRF_EXCLUDED_ROUTES.some(route => requestConfig.url?.includes(route));
      
      // Métodos que requieren token CSRF
      const METHODS_REQUIRING_CSRF = ['POST', 'PUT', 'PATCH', 'DELETE'];
      const methodRequiresCsrf = METHODS_REQUIRING_CSRF.includes(requestConfig.method?.toUpperCase() || '');

      // Obtener y añadir token CSRF si es necesario
      if (requiresCsrf && methodRequiresCsrf) {
        try {
          if (!csrfToken) {
            console.debug(`[CSRF] Token missing for ${requestConfig.method?.toUpperCase()} ${requestConfig.url}, fetching...`);
            await fetchCsrfToken();
          }
          
          if (csrfToken && requestConfig.headers) {
            requestConfig.headers['x-csrf-token'] = csrfToken;
            console.debug(`[CSRF] Added CSRF token to ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
          } else if (!csrfToken) {
            console.warn(`[CSRF] Failed to obtain CSRF token for ${requestConfig.method?.toUpperCase()} ${requestConfig.url}`);
          }
        } catch (csrfErr) {
          console.error(`[CSRF] Error during CSRF token fetch for ${requestConfig.method?.toUpperCase()} ${requestConfig.url}:`, csrfErr);
          // Continuar sin token, dejar que el servidor rechace si es necesario
        }
      }

      // Añadir timestamp para evitar caché en peticiones GET
      if (requestConfig.method === 'get') {
        requestConfig.params = {
          ...requestConfig.params,
          _t: Date.now(),
        };
      }

      return requestConfig;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de respuesta - maneja errores globalmente
  axiosInstance.interceptors.response.use(
    (response) => {
      // Backend NO regenera CSRF tokens (patrón Double Submit Cookie estático)
      // Se obtiene UNA VEZ en getSession/login y se reutiliza toda la sesión
      // No es necesario invalidar token después de respuestas exitosas
      return response;
    },
    async (error: AxiosError) => {
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        switch (error.response.status) {
          case 401:
            // No autenticado - señalizar la app en lugar de forzar una navegación
            // Esto evita redirecciones inesperadas durante la inicialización.
            try {
              localStorage.removeItem('auth_user');
            } catch {console.warn('Could not remove auth_user from localStorage'); }
            try {
              // Emitir evento global que los providers pueden escuchar
              window.dispatchEvent(new CustomEvent('app:unauthenticated'));
            } catch (e) {
              console.warn('Could not dispatch unauthenticated event', e);
            }
            return Promise.reject(error);

          case 403: {
            // Acceso prohibido o token CSRF inválido/faltante
            const errorData = error.response.data as ApiErrorResponse;
            if (errorData?.code === 'EBADCSRFTOKEN' || errorData?.message?.includes('CSRF')) {
              // Token CSRF inválido o cookie no coincide
              // Backend implementa Double Submit Cookie - token y cookie deben coincidir
              // Si hay mismatch: cookie expiró o fue del navegador diferente
              console.error('[CSRF] Token validation failed', {
                message: errorData?.message,
                code: errorData?.code,
                currentTokenLength: csrfToken.length,
                note: 'Cookie or token mismatch. User should logout and login again.'
              });
              
              // NO resetear token - si está en memoria pero falla, es problema de cookie
              // Solo rechazar el error para que el usuario lo maneje (logout/login)
              return Promise.reject(error);
            } else {
              // Para errores 403 que NO sean CSRF, solo registrar y rechazar
              console.error('[403] Acceso prohibido a este recurso', {
                url: error.config?.url,
                message: errorData?.message,
                code: errorData?.code,
              });
              return Promise.reject(error);
            }
          }

          case 404:
            // Recurso no encontrado
            console.error('Resource not found');
            return Promise.reject(error);

          case 500:
          case 502:
          case 503:
            // Error del servidor
            console.error('Server error. Please try again later');
            return Promise.reject(error);

          default:
            console.error('Request error:', error.response.data);
            return Promise.reject(error);
        }
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        console.error('No response received from server');
        return Promise.reject(error);
      } else {
        // Algo sucedió al configurar la solicitud
        console.error('Error setting up the request:', error.message);
        return Promise.reject(error);
      }
    }
  );

  return axiosInstance;
};

/**
 * Función para establecer el token CSRF obtenido de GET /csrf-token
 * Sincroniza el token entre CsrfProvider (React) y httpClient global (Axios)
 * Este es el ÚNICO token usado durante toda la sesión
 */
export const setCsrfToken = (token: string): void => {
  console.debug('[CSRF] Token set from CsrfProvider (sessionToken)', {
    tokenLength: token.length,
    previousTokenLength: csrfToken.length,
  });
  csrfToken = token;
  csrfTokenFetchAttempts = 0; // Reset - tenemos el token válido
};

/**
 * Obtiene el token CSRF actual (para debugging)
 */
export const getCsrfToken = (): string => {
  return csrfToken;
};

/**
 * Instancia configurada de axios para uso global
 */
export const apiClient = createAxiosInstance();

/**
 * Función para inicializar el token CSRF después de autenticación
 * Backend: Double Submit Cookie pattern - obtener token UNA VEZ y reutilizar
 */
export const initializeCsrfToken = async (): Promise<string> => {
  console.info('[CSRF] Initializing CSRF token...');
  try {
    const token = await fetchCsrfToken();
    console.info('[CSRF] CSRF token initialized successfully (will be reused all session)');
    return token;
  } catch (error) {
    console.error('[CSRF] Failed to initialize CSRF token:', error);
    // No lanzar error, permitir que el app continúe
    // El token se obtendrá en CsrfProvider normalmente
    return '';
  }
};

/**
 * Función helper para crear configuración personalizada de axios
 */
export const createConfig = (config?: AxiosRequestConfig): AxiosRequestConfig => {
  return {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
  };
};

/**
 * Sanitiza los datos de entrada para prevenir inyección de código
 */
export { sanitizeData } from './dataSanitizer';

export default apiClient;
