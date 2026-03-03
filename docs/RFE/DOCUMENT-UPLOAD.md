# US-101: Subir Documentos - Request for Enhancement (RFE)

## 📋 Resumen

| Campo            | Valor                                                                                                      |
|------------------|------------------------------------------------------------------------------------------------------------|
| **Fecha**        | Enero 29, 2026                                                                                             |
| **Estado**       | 📋 Propuesto                                                                                              |
| **Issue**        | [CloudDocs-Copilot/cloud-docs-web-ui#42](https://github.com/CloudDocs-Copilot/cloud-docs-web-ui/issues/42) |
| **Épica**        | Gestión de Documentos                                                                                      |
| **Prioridad**    | 🟠 Alta                                                                                                    | 
| **Story Points** | 13                                                                                                         |
| **Asignados**    | @lucferbux, @JohanyFlores                                                                                  |

---

## 🎯 Objetivo del User Story

**Como** usuario  
**Quiero** subir documentos en múltiples formatos  
**Para** centralizar toda mi información en un lugar seguro

---

## ✅ Criterios de Aceptación

| # | Criterio | Implementación Frontend | Estado |
|---|----------|------------------------|--------|
| 1 | Subida por drag & drop o selección de archivos | Componente `FileUploader` con zona de drop y input file | ⬜ |
| 2 | Subida múltiple (hasta 10 archivos simultáneos) | Cola de uploads con gestión paralela limitada | ⬜ |
| 3 | Validación de tipos de archivo permitidos | Validación client-side antes de envío | ⬜ |
| 4 | Límite de 50MB por archivo individual | Validación client-side + error handling backend | ⬜ |
| 5 | Barra de progreso durante la subida | `ProgressBar` por archivo con Axios `onUploadProgress` | ⬜ |
| 6 | Preview automático tras subida exitosa | Reutilizar `DocumentCard` existente | ⬜ |
| 7 | Detección automática de duplicados | Backend retorna error, frontend muestra alerta | ⬜ |

---

## 📁 Formatos de Archivo Soportados

| Formato | MIME Type | Extensión |
|---------|-----------|-----------|
| PDF | `application/pdf` | `.pdf` |
| Word | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx` |
| Excel | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `.xlsx` |
| PowerPoint | `application/vnd.openxmlformats-officedocument.presentationml.presentation` | `.pptx` |
| JPEG | `image/jpeg` | `.jpg`, `.jpeg` |
| PNG | `image/png` | `.png` |

---

## 🏗️ Arquitectura de la Solución

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Upload Page/Modal                            │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                     FileUploader Component                   │    │
│  │  ┌─────────────────┐  ┌─────────────────────────────────┐   │    │
│  │  │  DropZone       │  │  FileList                       │   │    │
│  │  │  (drag & drop)  │  │  ┌─────────────────────────┐    │   │    │
│  │  │                 │  │  │ FileItem + ProgressBar  │    │   │    │
│  │  │  [+ Select]     │  │  │ FileItem + ProgressBar  │    │   │    │
│  │  │                 │  │  │ FileItem + ProgressBar  │    │   │    │
│  │  └─────────────────┘  │  └─────────────────────────┘    │   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                  │                                   │
│                                  ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    useFileUpload Hook                        │    │
│  │  - uploadQueue[], progress{}, errors{}, abortControllers{}  │    │
│  │  - addFiles(), uploadAll(), cancelUpload(), retryUpload()   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                  │                                   │
│                                  ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                   document.service.ts                        │    │
│  │  - uploadDocument(file, folderId, onProgress, signal)       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                  │                                   │
└──────────────────────────────────┼───────────────────────────────────┘
                                   │ POST /api/documents/upload
                                   │ multipart/form-data
                                   ▼
                    ┌──────────────────────────────┐
                    │   Backend API (Existente)    │
                    │   - Multer middleware        │
                    │   - CSRF protection          │
                    │   - Rate limiting            │
                    │   - Duplicate detection      │
                    └──────────────────────────────┘
```

### Flujo de Subida

```
┌──────────┐     ┌───────────┐     ┌────────────┐     ┌─────────────┐
│  Usuario │     │ FileUploader│    │useFileUpload│    │ Backend API │
└────┬─────┘     └─────┬─────┘     └──────┬─────┘     └──────┬──────┘
     │                 │                   │                  │
     │  Drop/Select    │                   │                  │
     │  files          │                   │                  │
     │────────────────>│                   │                  │
     │                 │  addFiles()       │                  │
     │                 │──────────────────>│                  │
     │                 │                   │                  │
     │                 │  Validate files   │                  │
     │                 │  (type, size)     │                  │
     │                 │<──────────────────│                  │
     │                 │                   │                  │
     │  Click Upload   │                   │                  │
     │────────────────>│  uploadAll()      │                  │
     │                 │──────────────────>│                  │
     │                 │                   │                  │
     │                 │                   │  POST /upload    │
     │                 │                   │  (per file)      │
     │                 │                   │─────────────────>│
     │                 │                   │                  │
     │                 │  onProgress       │  Upload progress │
     │                 │<──────────────────│<─────────────────│
     │  Progress bar   │                   │                  │
     │<────────────────│                   │                  │
     │                 │                   │                  │
     │                 │                   │  201 Created     │
     │                 │  onSuccess        │<─────────────────│
     │                 │<──────────────────│                  │
     │  Show preview   │                   │                  │
     │<────────────────│                   │                  │
     │                 │                   │                  │
```

---

## 📝 Tareas Técnicas de Implementación

### 1. Tipos y Constantes (`src/types/upload.types.ts`)

```typescript
// Tipos para el sistema de upload
export interface UploadFile {
  id: string;                    // UUID generado client-side
  file: File;                    // Objeto File nativo
  status: UploadStatus;          // Estado actual
  progress: number;              // 0-100
  error?: UploadError;           // Error si falló
  result?: Document;             // Documento creado si éxito
  retryCount: number;            // Intentos de retry
}

export type UploadStatus = 
  | 'pending'      // En cola, no iniciado
  | 'validating'   // Validando client-side
  | 'uploading'    // Subiendo al servidor
  | 'success'      // Completado exitosamente
  | 'error'        // Error (puede reintentar)
  | 'cancelled';   // Cancelado por usuario

export interface UploadError {
  code: UploadErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type UploadErrorCode =
  | 'INVALID_TYPE'        // Tipo de archivo no permitido
  | 'FILE_TOO_LARGE'      // Excede 50MB
  | 'DUPLICATE_FILE'      // Archivo duplicado (backend)
  | 'NETWORK_ERROR'       // Error de red
  | 'SERVER_ERROR'        // Error 5xx del servidor
  | 'CSRF_ERROR'          // Token CSRF inválido
  | 'QUOTA_EXCEEDED'      // Cuota de almacenamiento excedida
  | 'UNKNOWN';            // Error desconocido

export interface UploadProgress {
  loaded: number;         // Bytes subidos
  total: number;          // Total de bytes
  percentage: number;     // Porcentaje (0-100)
}

// Constantes de validación
export const UPLOAD_CONSTRAINTS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024,  // 50MB en bytes
  MAX_SIMULTANEOUS_UPLOADS: 10,
  MAX_CONCURRENT_REQUESTS: 3,       // Subidas paralelas
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 2000,
} as const;

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
] as const;

export const ALLOWED_EXTENSIONS = [
  '.pdf', '.docx', '.xlsx', '.pptx', '.jpg', '.jpeg', '.png'
] as const;
```

---

### 2. Servicio de Upload (`src/services/document.service.ts`)

```typescript
import { apiClient } from '../api';
import type { Document } from '../types/document.types';
import type { UploadProgress } from '../types/upload.types';

export interface UploadDocumentParams {
  file: File;
  folderId?: string;
  onProgress?: (progress: UploadProgress) => void;
  signal?: AbortSignal;
}

export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  document: Document;
}

/**
 * Sube un documento al servidor
 * 
 * @param params - Parámetros de subida
 * @returns Promesa con el documento creado
 * @throws Error si la subida falla
 */
export async function uploadDocument({
  file,
  folderId,
  onProgress,
  signal,
}: UploadDocumentParams): Promise<UploadDocumentResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (folderId) {
    formData.append('folderId', folderId);
  }

  const response = await apiClient.post<UploadDocumentResponse>(
    '/documents/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
          });
        }
      },
    }
  );

  return response.data;
}

/**
 * Descarga un documento por su ID
 */
export async function downloadDocument(documentId: string): Promise<Blob> {
  const response = await apiClient.get(`/documents/download/${documentId}`, {
    responseType: 'blob',
  });
  return response.data;
}
```

---

### 3. Hook de Upload (`src/hooks/useFileUpload.ts`)

```typescript
import { useState, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { uploadDocument } from '../services/document.service';
import type { 
  UploadFile, 
  UploadStatus, 
  UploadError, 
  UploadErrorCode,
  UploadProgress 
} from '../types/upload.types';
import { 
  UPLOAD_CONSTRAINTS, 
  ALLOWED_MIME_TYPES 
} from '../types/upload.types';

interface UseFileUploadOptions {
  folderId?: string;
  maxFiles?: number;
  onUploadComplete?: (file: UploadFile) => void;
  onAllComplete?: (files: UploadFile[]) => void;
  onError?: (file: UploadFile, error: UploadError) => void;
}

interface UseFileUploadReturn {
  files: UploadFile[];
  isUploading: boolean;
  totalProgress: number;
  addFiles: (newFiles: FileList | File[]) => ValidationResult;
  removeFile: (fileId: string) => void;
  uploadAll: () => Promise<void>;
  cancelUpload: (fileId: string) => void;
  cancelAll: () => void;
  retryUpload: (fileId: string) => Promise<void>;
  retryAll: () => Promise<void>;
  clearCompleted: () => void;
  reset: () => void;
}

interface ValidationResult {
  valid: UploadFile[];
  invalid: Array<{ file: File; error: UploadError }>;
}

export function useFileUpload(options: UseFileUploadOptions = {}): UseFileUploadReturn {
  const {
    folderId,
    maxFiles = UPLOAD_CONSTRAINTS.MAX_SIMULTANEOUS_UPLOADS,
    onUploadComplete,
    onAllComplete,
    onError,
  } = options;

  const [files, setFiles] = useState<UploadFile[]>([]);
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  // Validación de archivo individual
  const validateFile = useCallback((file: File): UploadError | null => {
    // Validar tipo MIME
    if (!ALLOWED_MIME_TYPES.includes(file.type as any)) {
      return {
        code: 'INVALID_TYPE',
        message: `Tipo de archivo no permitido: ${file.type || 'desconocido'}`,
        details: { allowedTypes: ALLOWED_MIME_TYPES },
      };
    }

    // Validar tamaño
    if (file.size > UPLOAD_CONSTRAINTS.MAX_FILE_SIZE) {
      return {
        code: 'FILE_TOO_LARGE',
        message: `El archivo excede el límite de 50MB`,
        details: { 
          fileSize: file.size, 
          maxSize: UPLOAD_CONSTRAINTS.MAX_FILE_SIZE 
        },
      };
    }

    return null;
  }, []);

  // Agregar archivos a la cola
  const addFiles = useCallback((newFiles: FileList | File[]): ValidationResult => {
    const fileArray = Array.from(newFiles);
    const result: ValidationResult = { valid: [], invalid: [] };

    // Verificar límite de archivos
    const availableSlots = maxFiles - files.length;
    const filesToProcess = fileArray.slice(0, availableSlots);

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

    if (result.valid.length > 0) {
      setFiles((prev) => [...prev, ...result.valid]);
    }

    return result;
  }, [files.length, maxFiles, validateFile]);

  // Actualizar estado de un archivo
  const updateFile = useCallback((
    fileId: string, 
    updates: Partial<UploadFile>
  ) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f))
    );
  }, []);

  // Subir un archivo individual
  const uploadSingleFile = useCallback(async (uploadFile: UploadFile) => {
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

      updateFile(uploadFile.id, completedFile);
      onUploadComplete?.(completedFile);
      
      return completedFile;
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        updateFile(uploadFile.id, { status: 'cancelled' });
        return null;
      }

      const error = mapErrorToUploadError(err);
      const failedFile: UploadFile = {
        ...uploadFile,
        status: 'error',
        error,
        retryCount: uploadFile.retryCount,
      };

      updateFile(uploadFile.id, failedFile);
      onError?.(failedFile, error);

      // Auto-retry si no excede límite
      if (failedFile.retryCount < UPLOAD_CONSTRAINTS.MAX_RETRY_ATTEMPTS) {
        await new Promise(r => setTimeout(r, UPLOAD_CONSTRAINTS.RETRY_DELAY_MS));
        return retryUpload(uploadFile.id);
      }

      return failedFile;
    } finally {
      abortControllersRef.current.delete(uploadFile.id);
    }
  }, [folderId, onUploadComplete, onError, updateFile]);

  // Subir todos los archivos pendientes
  const uploadAll = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    
    // Procesar en lotes de MAX_CONCURRENT_REQUESTS
    const batchSize = UPLOAD_CONSTRAINTS.MAX_CONCURRENT_REQUESTS;
    
    for (let i = 0; i < pendingFiles.length; i += batchSize) {
      const batch = pendingFiles.slice(i, i + batchSize);
      await Promise.all(batch.map(uploadSingleFile));
    }

    onAllComplete?.(files);
  }, [files, uploadSingleFile, onAllComplete]);

  // Cancelar subida de un archivo
  const cancelUpload = useCallback((fileId: string) => {
    const controller = abortControllersRef.current.get(fileId);
    if (controller) {
      controller.abort();
    }
    updateFile(fileId, { status: 'cancelled' });
  }, [updateFile]);

  // Cancelar todas las subidas
  const cancelAll = useCallback(() => {
    abortControllersRef.current.forEach((controller) => controller.abort());
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'uploading' ? { ...f, status: 'cancelled' as UploadStatus } : f
      )
    );
  }, []);

  // Reintentar subida de un archivo
  const retryUpload = useCallback(async (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file && (file.status === 'error' || file.status === 'cancelled')) {
      const updatedFile = { ...file, retryCount: file.retryCount + 1 };
      updateFile(fileId, { status: 'pending', error: undefined, retryCount: updatedFile.retryCount });
      await uploadSingleFile(updatedFile);
    }
  }, [files, updateFile, uploadSingleFile]);

  // Reintentar todos los fallidos
  const retryAll = useCallback(async () => {
    const failedFiles = files.filter((f) => f.status === 'error');
    await Promise.all(failedFiles.map((f) => retryUpload(f.id)));
  }, [files, retryUpload]);

  // Remover archivo de la cola
  const removeFile = useCallback((fileId: string) => {
    cancelUpload(fileId);
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, [cancelUpload]);

  // Limpiar archivos completados
  const clearCompleted = useCallback(() => {
    setFiles((prev) => prev.filter((f) => f.status !== 'success'));
  }, []);

  // Reset completo
  const reset = useCallback(() => {
    cancelAll();
    setFiles([]);
  }, [cancelAll]);

  // Calcular progreso total
  const totalProgress = files.length > 0
    ? Math.round(files.reduce((acc, f) => acc + f.progress, 0) / files.length)
    : 0;

  const isUploading = files.some((f) => f.status === 'uploading');

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
  };
}

// Helper para mapear errores de Axios a UploadError
function mapErrorToUploadError(err: any): UploadError {
  if (err.response) {
    const status = err.response.status;
    const data = err.response.data;

    if (status === 409 || data?.code === 'DUPLICATE_FILE') {
      return { code: 'DUPLICATE_FILE', message: 'Este archivo ya existe' };
    }
    if (status === 413) {
      return { code: 'FILE_TOO_LARGE', message: 'Archivo demasiado grande' };
    }
    if (status === 403 && data?.code === 'EBADCSRFTOKEN') {
      return { code: 'CSRF_ERROR', message: 'Error de seguridad. Recarga la página.' };
    }
    if (status === 507 || data?.code === 'QUOTA_EXCEEDED') {
      return { code: 'QUOTA_EXCEEDED', message: 'Cuota de almacenamiento excedida' };
    }
    if (status >= 500) {
      return { code: 'SERVER_ERROR', message: 'Error del servidor. Intenta de nuevo.' };
    }

    return { 
      code: 'UNKNOWN', 
      message: data?.message || 'Error desconocido',
      details: data 
    };
  }

  if (err.request) {
    return { code: 'NETWORK_ERROR', message: 'Error de conexión. Verifica tu red.' };
  }

  return { code: 'UNKNOWN', message: err.message || 'Error desconocido' };
}
```

---

### 4. Componente FileUploader (`src/components/FileUploader/`)

#### 4.1 Estructura de archivos

```
src/components/FileUploader/
├── FileUploader.tsx          # Componente principal
├── FileUploader.module.css   # Estilos
├── DropZone.tsx             # Zona de drag & drop
├── FileList.tsx             # Lista de archivos
├── FileItem.tsx             # Item individual con progreso
└── index.ts                 # Export
```

#### 4.2 FileUploader.tsx (Componente Principal)

```tsx
import React from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { useFileUpload } from '../../hooks/useFileUpload';
import { DropZone } from './DropZone';
import { FileList } from './FileList';
import styles from './FileUploader.module.css';

interface FileUploaderProps {
  folderId?: string;
  onUploadSuccess?: (documents: Document[]) => void;
  onClose?: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  folderId,
  onUploadSuccess,
  onClose,
}) => {
  const {
    files,
    isUploading,
    totalProgress,
    addFiles,
    removeFile,
    uploadAll,
    cancelUpload,
    cancelAll,
    retryUpload,
    clearCompleted,
    reset,
  } = useFileUpload({
    folderId,
    onAllComplete: (completedFiles) => {
      const successDocs = completedFiles
        .filter((f) => f.status === 'success' && f.result)
        .map((f) => f.result!);
      
      if (successDocs.length > 0) {
        onUploadSuccess?.(successDocs);
      }
    },
  });

  const [validationErrors, setValidationErrors] = React.useState<
    Array<{ fileName: string; message: string }>
  >([]);

  const handleFilesSelected = (selectedFiles: FileList | File[]) => {
    const result = addFiles(selectedFiles);
    
    if (result.invalid.length > 0) {
      setValidationErrors(
        result.invalid.map(({ file, error }) => ({
          fileName: file.name,
          message: error.message,
        }))
      );
      
      // Auto-clear validation errors after 5s
      setTimeout(() => setValidationErrors([]), 5000);
    }
  };

  const pendingCount = files.filter((f) => f.status === 'pending').length;
  const successCount = files.filter((f) => f.status === 'success').length;
  const errorCount = files.filter((f) => f.status === 'error').length;

  return (
    <Card className={styles.uploaderCard}>
      <Card.Header className={styles.header}>
        <h5>Subir Documentos</h5>
        {onClose && (
          <Button variant="link" onClick={onClose} aria-label="Cerrar">
            ✕
          </Button>
        )}
      </Card.Header>

      <Card.Body>
        {/* Zona de Drop */}
        <DropZone 
          onFilesSelected={handleFilesSelected}
          disabled={isUploading}
          maxFiles={10 - files.length}
        />

        {/* Errores de validación */}
        {validationErrors.length > 0 && (
          <Alert variant="warning" className={styles.validationAlert}>
            <strong>Archivos no válidos:</strong>
            <ul>
              {validationErrors.map((err, idx) => (
                <li key={idx}>
                  {err.fileName}: {err.message}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Lista de archivos */}
        {files.length > 0 && (
          <FileList
            files={files}
            onRemove={removeFile}
            onCancel={cancelUpload}
            onRetry={retryUpload}
          />
        )}

        {/* Progreso total */}
        {isUploading && (
          <div className={styles.totalProgress}>
            <span>Progreso total: {totalProgress}%</span>
          </div>
        )}
      </Card.Body>

      <Card.Footer className={styles.footer}>
        <div className={styles.stats}>
          {pendingCount > 0 && <span>{pendingCount} pendientes</span>}
          {successCount > 0 && <span className={styles.success}>{successCount} completados</span>}
          {errorCount > 0 && <span className={styles.error}>{errorCount} fallidos</span>}
        </div>
        
        <div className={styles.actions}>
          {successCount > 0 && (
            <Button variant="outline-secondary" size="sm" onClick={clearCompleted}>
              Limpiar completados
            </Button>
          )}
          
          {isUploading ? (
            <Button variant="danger" onClick={cancelAll}>
              Cancelar todo
            </Button>
          ) : (
            <>
              <Button 
                variant="secondary" 
                onClick={reset}
                disabled={files.length === 0}
              >
                Limpiar
              </Button>
              <Button
                variant="primary"
                onClick={uploadAll}
                disabled={pendingCount === 0}
              >
                Subir {pendingCount > 0 ? `(${pendingCount})` : ''}
              </Button>
            </>
          )}
        </div>
      </Card.Footer>
    </Card>
  );
};

export default FileUploader;
```

#### 4.3 DropZone.tsx

```tsx
import React, { useCallback, useState, useRef } from 'react';
import styles from './FileUploader.module.css';
import { ALLOWED_EXTENSIONS } from '../../types/upload.types';

interface DropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  disabled = false,
  maxFiles = 10,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [disabled, onFilesSelected]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
    // Reset input para permitir seleccionar el mismo archivo
    e.target.value = '';
  }, [onFilesSelected]);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const acceptTypes = ALLOWED_EXTENSIONS.join(',');

  return (
    <div
      className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''} ${disabled ? styles.disabled : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Zona para arrastrar archivos o hacer clic para seleccionar"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptTypes}
        onChange={handleFileInputChange}
        className={styles.hiddenInput}
        disabled={disabled}
      />

      <div className={styles.dropZoneContent}>
        <svg className={styles.uploadIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
        </svg>
        
        <p className={styles.dropZoneText}>
          {isDragOver 
            ? 'Suelta los archivos aquí' 
            : 'Arrastra archivos aquí o haz clic para seleccionar'
          }
        </p>
        
        <p className={styles.dropZoneHint}>
          Máximo {maxFiles} archivos • 50MB por archivo
          <br />
          PDF, DOCX, XLSX, PPTX, JPG, PNG
        </p>
      </div>
    </div>
  );
};
```

#### 4.4 FileItem.tsx

```tsx
import React from 'react';
import { ProgressBar, Button } from 'react-bootstrap';
import type { UploadFile } from '../../types/upload.types';
import styles from './FileUploader.module.css';

interface FileItemProps {
  file: UploadFile;
  onRemove: (fileId: string) => void;
  onCancel: (fileId: string) => void;
  onRetry: (fileId: string) => void;
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  onRemove,
  onCancel,
  onRetry,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusVariant = () => {
    switch (file.status) {
      case 'success': return 'success';
      case 'error': return 'danger';
      case 'uploading': return 'primary';
      case 'cancelled': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusText = () => {
    switch (file.status) {
      case 'pending': return 'Pendiente';
      case 'validating': return 'Validando...';
      case 'uploading': return `${file.progress}%`;
      case 'success': return 'Completado';
      case 'error': return file.error?.message || 'Error';
      case 'cancelled': return 'Cancelado';
      default: return '';
    }
  };

  return (
    <div className={`${styles.fileItem} ${styles[file.status]}`}>
      <div className={styles.fileInfo}>
        <span className={styles.fileName} title={file.file.name}>
          {file.file.name}
        </span>
        <span className={styles.fileSize}>
          {formatFileSize(file.file.size)}
        </span>
      </div>

      <div className={styles.fileStatus}>
        {file.status === 'uploading' && (
          <ProgressBar
            now={file.progress}
            variant={getStatusVariant()}
            className={styles.progressBar}
            animated
          />
        )}
        
        {file.status !== 'uploading' && (
          <span className={`${styles.statusText} ${styles[file.status]}`}>
            {getStatusText()}
          </span>
        )}
      </div>

      <div className={styles.fileActions}>
        {file.status === 'uploading' && (
          <Button
            variant="link"
            size="sm"
            onClick={() => onCancel(file.id)}
            title="Cancelar"
            className={styles.actionBtn}
          >
            ✕
          </Button>
        )}
        
        {(file.status === 'error' || file.status === 'cancelled') && (
          <Button
            variant="link"
            size="sm"
            onClick={() => onRetry(file.id)}
            title="Reintentar"
            className={styles.actionBtn}
          >
            ↻
          </Button>
        )}
        
        {(file.status === 'pending' || file.status === 'success' || file.status === 'error' || file.status === 'cancelled') && (
          <Button
            variant="link"
            size="sm"
            onClick={() => onRemove(file.id)}
            title="Eliminar"
            className={styles.actionBtn}
          >
            🗑
          </Button>
        )}
      </div>
    </div>
  );
};
```

---

### 5. Integración en Dashboard

Agregar botón de subida en la página principal y/o en la barra lateral:

```tsx
// En Dashboard.tsx o Sidebar.tsx
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { FileUploader } from '../components/FileUploader';

// Dentro del componente:
const [showUploader, setShowUploader] = useState(false);

// En el JSX:
<Button onClick={() => setShowUploader(true)}>
  + Subir Documento
</Button>

<Modal show={showUploader} onHide={() => setShowUploader(false)} size="lg">
  <FileUploader
    folderId={currentFolderId}
    onUploadSuccess={(docs) => {
      // Refrescar lista de documentos
      refetchDocuments();
      setShowUploader(false);
    }}
    onClose={() => setShowUploader(false)}
  />
</Modal>
```

---

## 📁 Archivos a Crear/Modificar

### Nuevos Archivos

| Archivo | Descripción |
|---------|-------------|
| `src/types/upload.types.ts` | Tipos e interfaces para el sistema de upload |
| `src/services/document.service.ts` | Servicio para operaciones con documentos |
| `src/hooks/useFileUpload.ts` | Hook personalizado para gestión de uploads |
| `src/components/FileUploader/FileUploader.tsx` | Componente principal |
| `src/components/FileUploader/FileUploader.module.css` | Estilos del uploader |
| `src/components/FileUploader/DropZone.tsx` | Componente de drag & drop |
| `src/components/FileUploader/FileList.tsx` | Lista de archivos |
| `src/components/FileUploader/FileItem.tsx` | Item individual con progreso |
| `src/components/FileUploader/index.ts` | Exports del módulo |

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Dashboard.tsx` | Agregar botón y modal de subida |
| `src/components/Sidebar.tsx` | Agregar acceso rápido a subida |
| `src/types/document.types.ts` | Agregar tipos adicionales si es necesario |
| `package.json` | Agregar dependencia `uuid` para generación de IDs |

---

## 🔐 Consideraciones de Seguridad

1. **CSRF Protection**: El `apiClient` ya maneja tokens CSRF automáticamente
2. **Validación Client-Side**: Previene uploads innecesarios pero NO reemplaza validación backend
3. **Validación Backend**: El endpoint ya valida tipos MIME y tamaño (middleware `upload.middleware.ts`)
4. **Rate Limiting**: El backend aplica `uploadRateLimiter` para prevenir abuso
5. **Sanitización**: Los nombres de archivos se sanitizan en el backend (UUID + extensión)

---

## 🧪 Plan de Testing

### Unit Tests

```typescript
// src/hooks/__tests__/useFileUpload.test.ts
describe('useFileUpload', () => {
  it('should validate file types correctly');
  it('should validate file size correctly');
  it('should limit maximum files');
  it('should track upload progress');
  it('should handle upload cancellation');
  it('should retry failed uploads');
  it('should handle concurrent uploads');
});

// src/components/FileUploader/__tests__/FileUploader.test.tsx
describe('FileUploader', () => {
  it('should render drop zone');
  it('should handle file selection via input');
  it('should handle drag and drop');
  it('should show validation errors');
  it('should display file list');
  it('should show progress bars');
  it('should call onUploadSuccess when complete');
});
```

### Integration Tests

```typescript
// src/__tests__/integration/upload.test.tsx
describe('Document Upload Flow', () => {
  it('should upload single file successfully');
  it('should upload multiple files');
  it('should handle network errors gracefully');
  it('should retry failed uploads');
  it('should handle duplicate file errors from backend');
});
```

---

## 📊 Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Tiempo de subida (archivo 10MB) | < 5 segundos |
| Tasa de éxito de uploads | > 99% |
| Cobertura de tests | > 80% |
| Lighthouse Performance | > 90 |
| Accesibilidad (WCAG 2.1) | Nivel AA |

---

## 📅 Estimación de Tareas

| Tarea | Estimación |
|-------|------------|
| Tipos y constantes | 2h |
| document.service.ts | 2h |
| useFileUpload hook | 4h |
| Componentes FileUploader | 6h |
| Estilos CSS | 2h |
| Integración en Dashboard | 2h |
| Unit Tests | 4h |
| Integration Tests | 3h |
| Code Review & Fixes | 2h |
| **Total** | **~27h (4-5 días)** |

---

## 🔗 Referencias

- [GitHub Issue #42](https://github.com/CloudDocs-Copilot/cloud-docs-web-ui/issues/42)
- [Backend Upload Endpoint](../../../cloud-docs-api-service/src/routes/document.routes.ts)
- [Backend Upload Middleware](../../../cloud-docs-api-service/src/middlewares/upload.middleware.ts)
- [CSRF Protection RFC](../../../cloud-docs-api-service/docs/rfc/CSRF-PROTECTION.md)
- [MDN: Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [Axios: Progress Events](https://axios-http.com/docs/req_config)
