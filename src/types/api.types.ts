import type { AxiosRequestConfig, AxiosError } from 'axios';

/**
 * Estados posibles de una petición API
 */
export const ApiStatus = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const;

export type ApiStatus = typeof ApiStatus[keyof typeof ApiStatus];

/**
 * Estructura de respuesta exitosa de la API
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status: number;
}

/**
 * Estructura flexible de error que el backend puede retornar
 * Soporta múltiples formatos: { message }, { error }, { success: false, error }
 */
export interface BackendErrorResponse {
  message?: string;
  error?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
  code?: string;
}

/**
 * Estructura normalizada de error para la aplicación
 */
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
  code?: string;
}

/**
 * Normaliza diferentes formatos de error del backend a un formato estándar
 * @param data - Datos de error del backend (puede venir en diferentes formatos)
 * @returns ApiErrorResponse normalizado
 */
export function normalizeBackendError(data: unknown): Pick<ApiErrorResponse, 'message' | 'errors' | 'code'> {
  if (!data || typeof data !== 'object') {
    return { message: 'Error desconocido' };
  }

  const errorData = data as BackendErrorResponse;
  
  return {
    message: errorData.message || errorData.error || 'Error en la petición',
    errors: errorData.errors,
    code: errorData.code,
  };
}

/**
 * Estado del hook useHttpRequest
 */
export interface ApiState<T> {
  data: T | null;
  error: ApiErrorResponse | null;
  status: ApiStatus;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isIdle: boolean;
}

/**
 * Opciones de configuración para el hook useHttpRequest
 */
export interface UseHttpRequestOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiErrorResponse) => void;
  onSettled?: () => void;
  retry?: number;
  retryDelay?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}

/**
 * Métodos HTTP soportados
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Parámetros para ejecutar una petición
 */
export interface ExecuteParams<TRequest = unknown> {
  method: HttpMethod;
  url: string;
  data?: TRequest;
  config?: AxiosRequestConfig;
}

/**
 * Tipo helper para extraer el tipo de error de Axios
 * Se define con BackendErrorResponse para soportar múltiples formatos de error del backend
 */
export type ApiAxiosError = AxiosError<BackendErrorResponse>;

/**
 * Configuración de validación para los datos de entrada
 */
export interface ValidationConfig<T> {
  validate?: (data: T) => boolean | string;
  sanitize?: boolean;
}
