/**
 * Tipos e interfaces para el sistema de subida de archivos
 * @module upload.types
 */

import type { Document } from './document.types';

// ============================================================================
// Constantes de Validación
// ============================================================================

/**
 * Restricciones para la subida de archivos
 */
export const UPLOAD_CONSTRAINTS = {
  /** Tamaño máximo por archivo: 50MB */
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  /** Máximo de archivos en cola simultáneamente */
  MAX_SIMULTANEOUS_UPLOADS: 10,
  /** Máximo de peticiones concurrentes al servidor */
  MAX_CONCURRENT_REQUESTS: 3,
  /** Máximo de reintentos automáticos por archivo */
  MAX_RETRY_ATTEMPTS: 3,
  /** Delay entre reintentos en milisegundos */
  RETRY_DELAY_MS: 2000,
  /** Delay antes de cerrar modal tras éxito (ms) */
  SUCCESS_CLOSE_DELAY_MS: 2000,
} as const;

/**
 * Tipos MIME permitidos para subida
 */
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
] as const;

/**
 * Extensiones de archivo permitidas
 */
export const ALLOWED_EXTENSIONS = [
  '.pdf',
  '.docx',
  '.xlsx',
  '.pptx',
  '.jpg',
  '.jpeg',
  '.png',
] as const;

/**
 * Mapeo de extensiones a tipos MIME para validación cruzada
 */
export const EXTENSION_TO_MIME: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
};

/**
 * Nombres amigables para tipos de archivo
 */
export const FILE_TYPE_NAMES: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
  'image/jpeg': 'Imagen JPEG',
  'image/png': 'Imagen PNG',
};

// ============================================================================
// Tipos de Estado
// ============================================================================

/**
 * Estados posibles de un archivo en la cola de subida
 */
export type UploadStatus =
  | 'pending'      // En cola, esperando ser procesado
  | 'validating'   // Validando tipo y tamaño
  | 'uploading'    // Subiendo al servidor
  | 'success'      // Completado exitosamente
  | 'error'        // Error (puede reintentar)
  | 'cancelled';   // Cancelado por el usuario

/**
 * Códigos de error para clasificar fallos de subida
 */
export type UploadErrorCode =
  | 'INVALID_TYPE'        // Tipo de archivo no permitido
  | 'FILE_TOO_LARGE'      // Excede el límite de 50MB
  | 'DUPLICATE_FILE'      // Archivo duplicado (detectado por backend)
  | 'NETWORK_ERROR'       // Error de conexión
  | 'SERVER_ERROR'        // Error 5xx del servidor
  | 'CSRF_ERROR'          // Token CSRF inválido
  | 'QUOTA_EXCEEDED'      // Cuota de almacenamiento excedida
  | 'UNAUTHORIZED'        // No autenticado
  | 'FORBIDDEN'           // Sin permisos
  | 'UNKNOWN';            // Error desconocido

// ============================================================================
// Interfaces
// ============================================================================

/**
 * Información de error de subida
 */
export interface UploadError {
  /** Código de error para manejo programático */
  code: UploadErrorCode;
  /** Mensaje legible para mostrar al usuario */
  message: string;
  /** Detalles adicionales del error */
  details?: Record<string, unknown>;
}

/**
 * Progreso de subida de un archivo
 */
export interface UploadProgress {
  /** Bytes subidos */
  loaded: number;
  /** Total de bytes del archivo */
  total: number;
  /** Porcentaje de progreso (0-100) */
  percentage: number;
}

/**
 * Representa un archivo en la cola de subida
 */
export interface UploadFile {
  /** ID único generado client-side (UUID) */
  id: string;
  /** Objeto File nativo del navegador */
  file: File;
  /** Estado actual de la subida */
  status: UploadStatus;
  /** Porcentaje de progreso (0-100) */
  progress: number;
  /** Error si el estado es 'error' */
  error?: UploadError;
  /** Documento creado si el estado es 'success' */
  result?: Document;
  /** Número de reintentos realizados */
  retryCount: number;
}

/**
 * Resultado de validación al agregar archivos
 */
export interface ValidationResult {
  /** Archivos que pasaron la validación */
  valid: UploadFile[];
  /** Archivos rechazados con su error */
  invalid: Array<{
    file: File;
    error: UploadError;
  }>;
}

// ============================================================================
// Helpers de Validación
// ============================================================================

/**
 * Verifica si un tipo MIME está permitido
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType as typeof ALLOWED_MIME_TYPES[number]);
}

/**
 * Verifica si una extensión de archivo está permitida
 */
export function isAllowedExtension(filename: string): boolean {
  const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0];
  return ext ? ALLOWED_EXTENSIONS.includes(ext as typeof ALLOWED_EXTENSIONS[number]) : false;
}

/**
 * Verifica si el tamaño del archivo está dentro del límite
 */
export function isFileSizeValid(size: number): boolean {
  return size <= UPLOAD_CONSTRAINTS.MAX_FILE_SIZE;
}

/**
 * Formatea el tamaño de archivo en formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Obtiene el nombre amigable del tipo de archivo
 */
export function getFileTypeName(mimeType: string): string {
  return FILE_TYPE_NAMES[mimeType] || 'Archivo';
}

/**
 * Lista de tipos permitidos formateada para mostrar al usuario
 */
export function getAllowedTypesDisplay(): string {
  return 'PDF, DOCX, XLSX, PPTX, JPG, PNG';
}
