/**
 * Hook personalizado para gestión de subida de archivos
 * 
 * Maneja la cola de archivos, validación, progreso, cancelación y reintentos.
 * 
 * @module useFileUpload
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { uploadDocument } from '../services/document.service';
import type {
  UploadFile,
  UploadStatus,
  UploadError,
  UploadErrorCode,
  UploadProgress,
  ValidationResult,
} from '../types/upload.types';
import {
  UPLOAD_CONSTRAINTS,
  ALLOWED_MIME_TYPES,
  isAllowedMimeType,
  isFileSizeValid,
  formatFileSize,
  getAllowedTypesDisplay,
} from '../types/upload.types';
import type { Document } from '../types/document.types';

// ============================================================================
// Tipos
// ============================================================================

/**
 * Opciones de configuración del hook
 */
export interface UseFileUploadOptions {
  /** ID de la carpeta destino (opcional) */
  folderId?: string;
  /** Máximo de archivos permitidos */
  maxFiles?: number;
  /** Callback al completar un archivo */
  onUploadComplete?: (file: UploadFile) => void;
  /** Callback al completar todos los archivos */
  onAllComplete?: (files: UploadFile[]) => void;
  /** Callback al ocurrir un error */
  onError?: (file: UploadFile, error: UploadError) => void;
}

/**
 * Retorno del hook
 */
export interface UseFileUploadReturn {
  /** Lista de archivos en la cola */
  files: UploadFile[];
  /** Indica si hay subidas en progreso */
  isUploading: boolean;
  /** Progreso total de todas las subidas (0-100) */
  totalProgress: number;
  /** Agrega archivos a la cola con validación */
  addFiles: (newFiles: FileList | File[]) => ValidationResult;
  /** Remueve un archivo de la cola */
  removeFile: (fileId: string) => void;
  /** Inicia la subida de todos los archivos pendientes */
  uploadAll: () => Promise<void>;
  /** Cancela la subida de un archivo específico */
  cancelUpload: (fileId: string) => void;
  /** Cancela todas las subidas en progreso */
  cancelAll: () => void;
  /** Reintenta la subida de un archivo fallido */
  retryUpload: (fileId: string) => Promise<void>;
  /** Reintenta todos los archivos fallidos */
  retryAll: () => Promise<void>;
  /** Limpia los archivos completados exitosamente */
  clearCompleted: () => void;
  /** Reinicia el estado completo del hook */
  reset: () => void;
  /** Documentos subidos exitosamente */
  uploadedDocuments: Document[];
  /** Indica si todos los archivos se subieron exitosamente */
  allSuccessful: boolean;
  /** Número de archivos pendientes */
  pendingCount: number;
  /** Número de archivos exitosos */
  successCount: number;
  /** Número de archivos fallidos */
  errorCount: number;
}

// ============================================================================
// Hook Principal
// ============================================================================

/**
 * Hook para gestionar la subida de múltiples archivos
 * 
 * @param options - Opciones de configuración
 * @returns Estado y métodos para gestionar las subidas
 * 
 * @example
 * ```tsx
 * const {
 *   files,
 *   isUploading,
 *   addFiles,
 *   uploadAll,
 *   cancelUpload,
 * } = useFileUpload({
 *   onAllComplete: (files) => console.log('Completado!', files),
 * });
 * 
 * // Agregar archivos desde input
 * const handleFileSelect = (e) => {
 *   const result = addFiles(e.target.files);
 *   if (result.invalid.length > 0) {
 *     alert('Algunos archivos no son válidos');
 *   }
 * };
 * 
 * // Iniciar subida
 * await uploadAll();
 * ```
 */
export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const {
    folderId,
    maxFiles = UPLOAD_CONSTRAINTS.MAX_SIMULTANEOUS_UPLOADS,
    onUploadComplete,
    onAllComplete,
    onError,
  } = options;

  // Estado de archivos
  const [files, setFiles] = useState<UploadFile[]>([]);
  
  // Refs para AbortControllers (uno por archivo)
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());
  
  // Ref para evitar llamadas duplicadas
  const isUploadingRef = useRef(false);

  // Ref para callbacks actualizados
  const callbacksRef = useRef({ onUploadComplete, onAllComplete, onError });
  useEffect(() => {
    callbacksRef.current = { onUploadComplete, onAllComplete, onError };
  }, [onUploadComplete, onAllComplete, onError]);

  // ============================================================================
  // Validación
  // ============================================================================

  /**
   * Valida un archivo individual
   */
  const validateFile = useCallback((file: File): UploadError | null => {
    // Validar tipo MIME
    if (!isAllowedMimeType(file.type)) {
      return {
        code: 'INVALID_TYPE',
        message: `Tipo de archivo no permitido. Tipos aceptados: ${getAllowedTypesDisplay()}`,
        details: { 
          receivedType: file.type || 'desconocido',
          allowedTypes: [...ALLOWED_MIME_TYPES],
        },
      };
    }

    // Validar tamaño
    if (!isFileSizeValid(file.size)) {
      return {
        code: 'FILE_TOO_LARGE',
        message: `El archivo excede el límite de ${formatFileSize(UPLOAD_CONSTRAINTS.MAX_FILE_SIZE)}`,
        details: {
          fileSize: file.size,
          maxSize: UPLOAD_CONSTRAINTS.MAX_FILE_SIZE,
          fileSizeFormatted: formatFileSize(file.size),
        },
      };
    }

    return null;
  }, []);

  // ============================================================================
  // Gestión de Archivos
  // ============================================================================

  /**
   * Agrega archivos a la cola con validación
   */
  const addFiles = useCallback((newFiles: FileList | File[]): ValidationResult => {
    const fileArray = Array.from(newFiles);
    const result: ValidationResult = { valid: [], invalid: [] };

    // Verificar límite de archivos
    const currentCount = files.length;
    const availableSlots = maxFiles - currentCount;

    if (availableSlots <= 0) {
      // Todos los archivos exceden el límite
      fileArray.forEach((file) => {
        result.invalid.push({
          file,
          error: {
            code: 'UNKNOWN',
            message: `Límite de ${maxFiles} archivos alcanzado`,
          },
        });
      });
      return result;
    }

    const filesToProcess = fileArray.slice(0, availableSlots);
    const excessFiles = fileArray.slice(availableSlots);

    // Procesar archivos dentro del límite
    filesToProcess.forEach((file) => {
      const error = validateFile(file);

      if (error) {
        result.invalid.push({ file, error });
      } else {
        const uploadFile: UploadFile = {
          id: uuidv4(),
          file,
          status: 'pending',
          progress: 0,
          retryCount: 0,
        };
        result.valid.push(uploadFile);
      }
    });

    // Archivos que exceden el límite
    excessFiles.forEach((file) => {
      result.invalid.push({
        file,
        error: {
          code: 'UNKNOWN',
          message: `Límite de ${maxFiles} archivos alcanzado`,
        },
      });
    });

    // Actualizar estado con archivos válidos
    if (result.valid.length > 0) {
      setFiles((prev) => [...prev, ...result.valid]);
    }

    return result;
  }, [files.length, maxFiles, validateFile]);

  /**
   * Actualiza el estado de un archivo específico
   */
  const updateFile = useCallback((fileId: string, updates: Partial<UploadFile>) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f))
    );
  }, []);

  /**
   * Remueve un archivo de la cola
   */
  const removeFile = useCallback((fileId: string) => {
    // Cancelar si está en progreso
    const controller = abortControllersRef.current.get(fileId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(fileId);
    }
    
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  // ============================================================================
  // Subida de Archivos
  // ============================================================================

  /**
   * Sube un archivo individual
   */
  const uploadSingleFile = useCallback(async (uploadFile: UploadFile): Promise<UploadFile | null> => {
    const abortController = new AbortController();
    abortControllersRef.current.set(uploadFile.id, abortController);

    updateFile(uploadFile.id, { status: 'uploading', progress: 0 });

    try {
      const response = await uploadDocument({
        file: uploadFile.file,
        folderId,
        signal: abortController.signal,
        onProgress: (progress: UploadProgress) => {
          updateFile(uploadFile.id, { progress: progress.percentage });
        },
      });

      const completedFile: UploadFile = {
        ...uploadFile,
        status: 'success',
        progress: 100,
        result: response.document,
      };

      updateFile(uploadFile.id, {
        status: 'success',
        progress: 100,
        result: response.document,
      });

      callbacksRef.current.onUploadComplete?.(completedFile);
      return completedFile;

    } catch (err: unknown) {
      // Verificar si fue cancelado
      if (err instanceof Error && (err.name === 'CanceledError' || err.name === 'AbortError')) {
        updateFile(uploadFile.id, { status: 'cancelled' });
        return null;
      }

      const error = mapErrorToUploadError(err);
      
      updateFile(uploadFile.id, {
        status: 'error',
        error,
      });

      const failedFile: UploadFile = {
        ...uploadFile,
        status: 'error',
        error,
      };

      callbacksRef.current.onError?.(failedFile, error);

      // Auto-retry si no excede límite y es error recuperable
      if (
        uploadFile.retryCount < UPLOAD_CONSTRAINTS.MAX_RETRY_ATTEMPTS &&
        isRetryableError(error.code)
      ) {
        await new Promise((resolve) => 
          setTimeout(resolve, UPLOAD_CONSTRAINTS.RETRY_DELAY_MS)
        );
        
        // Verificar que no fue cancelado durante el delay
        if (!abortControllersRef.current.has(uploadFile.id)) {
          return failedFile;
        }

        updateFile(uploadFile.id, {
          status: 'pending',
          error: undefined,
          retryCount: uploadFile.retryCount + 1,
        });

        return uploadSingleFile({
          ...uploadFile,
          retryCount: uploadFile.retryCount + 1,
        });
      }

      return failedFile;

    } finally {
      abortControllersRef.current.delete(uploadFile.id);
    }
  }, [folderId, updateFile]);

  /**
   * Inicia la subida de todos los archivos pendientes
   */
  const uploadAll = useCallback(async () => {
    if (isUploadingRef.current) return;
    isUploadingRef.current = true;

    try {
      const pendingFiles = files.filter((f) => f.status === 'pending');
      const batchSize = UPLOAD_CONSTRAINTS.MAX_CONCURRENT_REQUESTS;
      const results: (UploadFile | null)[] = [];

      // Procesar en lotes
      for (let i = 0; i < pendingFiles.length; i += batchSize) {
        const batch = pendingFiles.slice(i, i + batchSize);
        const batchResults = await Promise.all(
          batch.map((file) => uploadSingleFile(file))
        );
        results.push(...batchResults);
      }

      // Notificar completado
      // Obtener estado actualizado para el callback
      setFiles((currentFiles) => {
        callbacksRef.current.onAllComplete?.(currentFiles);
        return currentFiles;
      });

    } finally {
      isUploadingRef.current = false;
    }
  }, [files, uploadSingleFile]);

  // ============================================================================
  // Cancelación
  // ============================================================================

  /**
   * Cancela la subida de un archivo específico
   */
  const cancelUpload = useCallback((fileId: string) => {
    const controller = abortControllersRef.current.get(fileId);
    if (controller) {
      controller.abort();
      abortControllersRef.current.delete(fileId);
    }
    updateFile(fileId, { status: 'cancelled' });
  }, [updateFile]);

  /**
   * Cancela todas las subidas en progreso
   */
  const cancelAll = useCallback(() => {
    abortControllersRef.current.forEach((controller) => {
      controller.abort();
    });
    abortControllersRef.current.clear();

    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'uploading' ? { ...f, status: 'cancelled' as UploadStatus } : f
      )
    );
  }, []);

  // ============================================================================
  // Reintentos
  // ============================================================================

  /**
   * Reintenta la subida de un archivo fallido o cancelado
   */
  const retryUpload = useCallback(async (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file && (file.status === 'error' || file.status === 'cancelled')) {
      updateFile(fileId, {
        status: 'pending',
        error: undefined,
        progress: 0,
        retryCount: file.retryCount + 1,
      });
      
      await uploadSingleFile({
        ...file,
        status: 'pending',
        error: undefined,
        progress: 0,
        retryCount: file.retryCount + 1,
      });
    }
  }, [files, updateFile, uploadSingleFile]);

  /**
   * Reintenta todos los archivos fallidos
   */
  const retryAll = useCallback(async () => {
    const failedFiles = files.filter(
      (f) => f.status === 'error' || f.status === 'cancelled'
    );
    
    // Resetear estado de fallidos
    failedFiles.forEach((f) => {
      updateFile(f.id, {
        status: 'pending',
        error: undefined,
        progress: 0,
        retryCount: f.retryCount + 1,
      });
    });

    // Re-subir
    const batchSize = UPLOAD_CONSTRAINTS.MAX_CONCURRENT_REQUESTS;
    for (let i = 0; i < failedFiles.length; i += batchSize) {
      const batch = failedFiles.slice(i, i + batchSize);
      await Promise.all(
        batch.map((file) =>
          uploadSingleFile({
            ...file,
            status: 'pending',
            error: undefined,
            progress: 0,
            retryCount: file.retryCount + 1,
          })
        )
      );
    }
  }, [files, updateFile, uploadSingleFile]);

  // ============================================================================
  // Limpieza
  // ============================================================================

  /**
   * Limpia los archivos completados exitosamente
   */
  const clearCompleted = useCallback(() => {
    setFiles((prev) => prev.filter((f) => f.status !== 'success'));
  }, []);

  /**
   * Reinicia el estado completo
   */
  const reset = useCallback(() => {
    cancelAll();
    setFiles([]);
  }, [cancelAll]);

  // ============================================================================
  // Valores Computados
  // ============================================================================

  const isUploading = files.some((f) => f.status === 'uploading');
  
  const totalProgress = files.length > 0
    ? Math.round(files.reduce((acc, f) => acc + f.progress, 0) / files.length)
    : 0;

  const uploadedDocuments = files
    .filter((f) => f.status === 'success' && f.result)
    .map((f) => f.result!);

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  const allSuccessful = files.length > 0 && files.every((f) => f.status === 'success');

  // ============================================================================
  // Retorno
  // ============================================================================

  return {
    files,
    isUploading,
    totalProgress,
    addFiles,
    removeFile,
    uploadAll,
    cancelUpload,
    cancelAll,
    retryUpload,
    retryAll,
    clearCompleted,
    reset,
    uploadedDocuments,
    allSuccessful,
    pendingCount,
    successCount,
    errorCount,
  };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Mapea errores de Axios a UploadError
 */
function mapErrorToUploadError(err: unknown): UploadError {
  // Error de Axios con respuesta del servidor
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosError = err as { response?: { status?: number; data?: Record<string, unknown> } };
    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    // Duplicado
    if (status === 409 || data?.code === 'DUPLICATE_FILE') {
      return {
        code: 'DUPLICATE_FILE',
        message: 'Este archivo ya existe en el sistema',
      };
    }

    // Archivo muy grande
    if (status === 413) {
      return {
        code: 'FILE_TOO_LARGE',
        message: 'El archivo excede el tamaño máximo permitido',
      };
    }

    // Error CSRF
    if (status === 403 && (data?.code === 'EBADCSRFTOKEN' || String(data?.message).includes('CSRF'))) {
      return {
        code: 'CSRF_ERROR',
        message: 'Error de seguridad. Por favor, recarga la página e intenta de nuevo.',
      };
    }

    // No autenticado
    if (status === 401) {
      return {
        code: 'UNAUTHORIZED',
        message: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
      };
    }

    // Sin permisos
    if (status === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'No tienes permisos para subir archivos.',
      };
    }

    // Cuota excedida
    if (status === 507 || data?.code === 'QUOTA_EXCEEDED') {
      return {
        code: 'QUOTA_EXCEEDED',
        message: 'Has alcanzado el límite de almacenamiento de tu plan.',
      };
    }

    // Error del servidor
    if (status && status >= 500) {
      return {
        code: 'SERVER_ERROR',
        message: 'Error del servidor. Por favor, intenta de nuevo más tarde.',
      };
    }

    // Otros errores con mensaje
    if (data?.message && typeof data.message === 'string') {
      return {
        code: 'UNKNOWN',
        message: data.message,
        details: data,
      };
    }
  }

  // Error de red (sin respuesta)
  if (err && typeof err === 'object' && 'request' in err && !('response' in err)) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Error de conexión. Verifica tu conexión a internet.',
    };
  }

  // Error genérico
  const message = err instanceof Error ? err.message : 'Error desconocido';
  return {
    code: 'UNKNOWN',
    message,
  };
}

/**
 * Determina si un error es recuperable mediante reintento
 */
function isRetryableError(code: UploadErrorCode): boolean {
  return ['NETWORK_ERROR', 'SERVER_ERROR', 'CSRF_ERROR'].includes(code);
}

export default useFileUpload;
