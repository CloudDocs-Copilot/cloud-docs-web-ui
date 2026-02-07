/**
 * Hook para operaciones de eliminación de documentos
 * @module useDocumentDeletion
 */

import { useState, useCallback } from 'react';
import { deletionService, type DeletedDocument } from '../services/deletion.service';
import type { Document } from '../types/document.types';

interface UseDocumentDeletionReturn {
  /** Indica si hay una operación en progreso */
  loading: boolean;
  /** Error de la última operación */
  error: string | null;
  /** Mueve un documento a la papelera */
  moveToTrash: (documentId: string, reason?: string) => Promise<DeletedDocument | null>;
  /** Restaura un documento desde la papelera */
  restoreFromTrash: (documentId: string) => Promise<Document | null>;
  /** Elimina permanentemente un documento */
  permanentDelete: (documentId: string) => Promise<boolean>;
  /** Limpia el error */
  clearError: () => void;
}

/**
 * Hook personalizado para manejar eliminación de documentos
 */
export const useDocumentDeletion = (): UseDocumentDeletionReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moveToTrash = useCallback(async (documentId: string, reason?: string) => {
    try {
      setLoading(true);
      setError(null);
      const deletedDoc = await deletionService.moveToTrash(documentId, { reason });
      return deletedDoc;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al mover a papelera';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const restoreFromTrash = useCallback(async (documentId: string) => {
    try {
      setLoading(true);
      setError(null);
      const restoredDoc = await deletionService.restoreFromTrash(documentId);
      return restoredDoc;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al restaurar documento';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const permanentDelete = useCallback(async (documentId: string) => {
    try {
      setLoading(true);
      setError(null);
      await deletionService.permanentDelete(documentId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar permanentemente';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    moveToTrash,
    restoreFromTrash,
    permanentDelete,
    clearError,
  };
};
