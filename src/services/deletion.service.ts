/**
 * Servicio para operaciones de eliminación segura de documentos
 * @module deletion.service
 */

import { apiClient } from '../api';
import type { Document } from '../types/document.types';

// ============================================================================
// Tipos de Request/Response
// ============================================================================

/**
 * Documento en la papelera con metadatos de eliminación
 */
export interface DeletedDocument extends Document {
  deletedAt: string;
  deletedBy: string;
  scheduledDeletionDate: string;
  deletionReason?: string;
}

/**
 * Respuesta al mover documento a papelera
 */
export interface MoveToTrashResponse {
  success: boolean;
  message: string;
  data: DeletedDocument;
}

/**
 * Respuesta al restaurar documento
 */
export interface RestoreFromTrashResponse {
  success: boolean;
  message: string;
  data: Document;
}

/**
 * Respuesta al listar papelera
 */
export interface GetTrashResponse {
  success: boolean;
  count: number;
  data: DeletedDocument[];
}

/**
 * Respuesta al vaciar papelera
 */
export interface EmptyTrashResponse {
  success: boolean;
  message: string;
  deletedCount: number;
}

/**
 * Respuesta al eliminar permanentemente
 */
export interface PermanentDeleteResponse {
  success: boolean;
  message: string;
}

/**
 * Parámetros para mover a papelera
 */
export interface MoveToTrashParams {
  reason?: string;
}

// ============================================================================
// Servicio de Eliminación
// ============================================================================

export const deletionService = {
  /**
   * Mueve un documento a la papelera (soft delete)
   * @param documentId - ID del documento
   * @param params - Parámetros opcionales (razón de eliminación)
   * @returns Documento eliminado con metadatos
   */
  moveToTrash: async (
    documentId: string,
    params?: MoveToTrashParams
  ): Promise<DeletedDocument> => {
    const response = await apiClient.post<MoveToTrashResponse>(
      `/deletion/${documentId}/trash`,
      params
    );
    return response.data.data;
  },

  /**
   * Restaura un documento desde la papelera
   * @param documentId - ID del documento
   * @returns Documento restaurado
   */
  restoreFromTrash: async (documentId: string): Promise<Document> => {
    const response = await apiClient.post<RestoreFromTrashResponse>(
      `/deletion/${documentId}/restore`
    );
    return response.data.data;
  },

  /**
   * Obtiene todos los documentos en la papelera
   * @returns Lista de documentos eliminados
   */
  getTrash: async (): Promise<DeletedDocument[]> => {
    const response = await apiClient.get<GetTrashResponse>('/deletion/trash');
    return response.data.data;
  },

  /**
   * Vacía completamente la papelera (eliminación permanente de todos)
   * @returns Número de documentos eliminados permanentemente
   */
  emptyTrash: async (): Promise<number> => {
    const response = await apiClient.delete<EmptyTrashResponse>('/deletion/trash');
    return response.data.deletedCount;
  },

  /**
   * Elimina permanentemente un documento específico
   * @param documentId - ID del documento
   */
  permanentDelete: async (documentId: string): Promise<void> => {
    await apiClient.delete<PermanentDeleteResponse>(
      `/deletion/${documentId}/permanent`
    );
  },
};
