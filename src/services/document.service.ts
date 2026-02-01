/**
 * Servicio para operaciones con documentos
 * @module document.service
 */

import { apiClient } from '../api';
import type { Document } from '../types/document.types';
import type { UploadProgress } from '../types/upload.types';

// ============================================================================
// Tipos de Request/Response
// ============================================================================

/**
 * Parámetros para subir un documento
 */
export interface UploadDocumentParams {
  /** Archivo a subir */
  file: File;
  /** ID de la carpeta destino (opcional, usa rootFolder si no se especifica) */
  folderId?: string;
  /** Callback para reportar progreso de subida */
  onProgress?: (progress: UploadProgress) => void;
  /** Signal para cancelar la petición */
  signal?: AbortSignal;
}

/**
 * Respuesta del servidor al subir documento
 */
export interface UploadDocumentResponse {
  success: boolean;
  message: string;
  document: Document;
}

/**
 * Respuesta del servidor al listar documentos
 */
export interface ListDocumentsResponse {
  success: boolean;
  count: number;
  documents: Document[];
}

/**
 * Respuesta del servidor al obtener documentos recientes
 */
export interface RecentDocumentsResponse {
  success: boolean;
  count: number;
  documents: Document[];
}

/**
 * Respuesta del servidor al obtener un documento
 */
export interface GetDocumentResponse {
  success: boolean;
  document: Document;
}

// ============================================================================
// Funciones del Servicio
// ============================================================================

/**
 * Sube un documento al servidor
 * 
 * @param params - Parámetros de la subida
 * @returns Promesa con la respuesta del servidor incluyendo el documento creado
 * @throws Error si la subida falla
 * 
 * @example
 * ```typescript
 * const response = await uploadDocument({
 *   file: selectedFile,
 *   onProgress: (progress) => console.log(`${progress.percentage}%`),
 *   signal: abortController.signal,
 * });
 * console.log('Documento subido:', response.document);
 * ```
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
 * Lista todos los documentos del usuario autenticado
 * 
 * @returns Promesa con la lista de documentos
 */
export async function listDocuments(): Promise<ListDocumentsResponse> {
  const response = await apiClient.get<ListDocumentsResponse>('/documents');
  return response.data;
}

/**
 * Obtiene los documentos recientes del usuario en una organización
 * 
 * @param organizationId - ID de la organización
 * @param limit - Número máximo de documentos a retornar (default: 10)
 * @returns Promesa con los documentos recientes
 */
export async function getRecentDocuments(
  organizationId: string,
  limit: number = 10
): Promise<RecentDocumentsResponse> {
  const response = await apiClient.get<RecentDocumentsResponse>(
    `/documents/recent/${organizationId}`,
    { params: { limit } }
  );
  return response.data;
}

/**
 * Obtiene los detalles de un documento por su ID
 * 
 * @param documentId - ID del documento
 * @returns Promesa con los detalles del documento
 */
export async function getDocument(documentId: string): Promise<GetDocumentResponse> {
  const response = await apiClient.get<GetDocumentResponse>(`/documents/${documentId}`);
  return response.data;
}

/**
 * Descarga un documento por su ID
 * 
 * @param documentId - ID del documento a descargar
 * @returns Promesa con el Blob del archivo
 */
export async function downloadDocument(documentId: string): Promise<Blob> {
  const response = await apiClient.get(`/documents/download/${documentId}`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Elimina un documento
 * 
 * @param documentId - ID del documento a eliminar
 * @returns Promesa con la respuesta del servidor
 */
export async function deleteDocument(documentId: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string }>(
    `/documents/${documentId}`
  );
  return response.data;
}

/**
 * Mueve un documento a otra carpeta
 * 
 * @param documentId - ID del documento a mover
 * @param targetFolderId - ID de la carpeta destino
 * @returns Promesa con el documento actualizado
 */
export async function moveDocument(
  documentId: string,
  targetFolderId: string
): Promise<{ success: boolean; message: string; document: Document }> {
  const response = await apiClient.patch<{ success: boolean; message: string; document: Document }>(
    `/documents/${documentId}/move`,
    { targetFolderId }
  );
  return response.data;
}

/**
 * Copia un documento a otra carpeta
 * 
 * @param documentId - ID del documento a copiar
 * @param targetFolderId - ID de la carpeta destino
 * @returns Promesa con el nuevo documento creado
 */
export async function copyDocument(
  documentId: string,
  targetFolderId: string
): Promise<{ success: boolean; message: string; document: Document }> {
  const response = await apiClient.post<{ success: boolean; message: string; document: Document }>(
    `/documents/${documentId}/copy`,
    { targetFolderId }
  );
  return response.data;
}

/**
 * Comparte un documento con otros usuarios
 * 
 * @param documentId - ID del documento a compartir
 * @param userIds - Array de IDs de usuarios con quienes compartir
 * @returns Promesa con el documento actualizado
 */
export async function shareDocument(
  documentId: string,
  userIds: string[]
): Promise<{ success: boolean; message: string; document: Document }> {
  const response = await apiClient.post<{ success: boolean; message: string; document: Document }>(
    `/documents/${documentId}/share`,
    { userIds }
  );
  return response.data;
}
