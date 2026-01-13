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
 * Estructura de error de la API
 */
export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
  code?: string;
}

/**
 * Estado del hook useApi
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
 * Opciones de configuración para el hook useApi
 */
export interface UseApiOptions<T> {
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
 */
export type ApiAxiosError = AxiosError<ApiErrorResponse>;

/**
 * Configuración de validación para los datos de entrada
 */
export interface ValidationConfig<T> {
  validate?: (data: T) => boolean | string;
  sanitize?: boolean;
}
