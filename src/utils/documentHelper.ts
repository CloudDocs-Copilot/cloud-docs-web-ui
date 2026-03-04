import type { Document } from '../types/document.types';

/**
 * Obtiene el nombre a mostrar del documento
 * Prioriza originalname (nombre original del archivo) sobre filename (nombre del sistema)
 * @param document - Documento del cual obtener el nombre
 * @returns Nombre a mostrar del documento
 */
export const getDocumentDisplayName = (document: Document): string => {
  // Priorizar originalname, luego filename, finalmente mostrar 'Sin nombre'
  return document.originalname || document.filename || 'Sin nombre';
};