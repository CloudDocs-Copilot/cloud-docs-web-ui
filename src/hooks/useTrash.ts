/**
 * Hook para gestionar la papelera de documentos
 * @module useTrash
 */

import { useState, useCallback, useEffect } from 'react';
import { deletionService, type DeletedDocument } from '../services/deletion.service';

interface UseTrashReturn {
  /** Lista de documentos en la papelera */
  trashDocuments: DeletedDocument[];
  /** Indica si está cargando */
  loading: boolean;
  /** Error si existe */
  error: string | null;
  /** Recargar la papelera */
  refetch: () => Promise<void>;
  /** Vaciar toda la papelera */
  emptyTrash: () => Promise<boolean>;
}

/**
 * Hook para gestionar la papelera
 */
export const useTrash = (): UseTrashReturn => {
  const [trashDocuments, setTrashDocuments] = useState<DeletedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrash = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const documents = await deletionService.getTrash();
      setTrashDocuments(documents);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al cargar la papelera';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const emptyTrash = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await deletionService.emptyTrash();
      setTrashDocuments([]);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al vaciar la papelera';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrash();
  }, [fetchTrash]);

  return {
    trashDocuments,
    loading,
    error,
    refetch: fetchTrash,
    emptyTrash,
  };
};
