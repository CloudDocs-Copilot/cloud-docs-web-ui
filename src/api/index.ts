/**
 * Archivo de índice para exportar todos los elementos de la API
 */

// Configuración de axios
export { apiClient, createConfig } from './httpClient.config';

// Utilidades
export { sanitizeData } from './dataSanitizer';
export { normalizeBackendError } from '../types/api.types';

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
  BackendErrorResponse,
} from '../types/api.types';

export { ApiStatus } from '../types/api.types';
