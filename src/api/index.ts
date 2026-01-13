/**
 * Archivo de índice para exportar todos los elementos de la API
 */

// Configuración de axios
export { apiClient, createConfig } from './axiosConfig';

// Utilidades
export { sanitizeData } from './sanitizer';

// Tipos
export type {
  ApiResponse,
  ApiErrorResponse,
  ApiState,
  UseApiOptions,
  ExecuteParams,
  ApiAxiosError,
  ValidationConfig,
  HttpMethod,
} from './apiTypes';

export { ApiStatus } from './apiTypes';
