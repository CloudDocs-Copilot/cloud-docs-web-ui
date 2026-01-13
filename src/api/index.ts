/**
 * Archivo de índice para exportar todos los elementos de la API
 */

// Configuración de axios
export { apiClient, createConfig } from './httpClient.config';

// Utilidades
export { sanitizeData } from './dataSanitizer';

// Tipos
export type {
  ApiResponse,
  ApiErrorResponse,
  ApiState,
  UseHttpRequestOptions,
  ExecuteParams,
  ApiAxiosError,
  ValidationConfig,
  HttpMethod,
} from '../types/api.types';

export { ApiStatus } from '../types/api.types';
