/**
 * Servicio para las operaciones de IA de CloudDocs
 * Todos los endpoints comparten el prefijo /api/ai y requieren JWT Bearer
 * @module ai.service
 */

import { apiClient } from '../api';
import type {
  AiApiResponse,
  AskRequest,
  AskDocumentRequest,
  RagResponse,
  ExtractTextResult,
  ProcessDocumentRequest,
  ProcessingResult,
  DeleteChunksResult,
  ClassifyResult,
  SummarizeResult,
} from '../types/ai.types';

// Base path del módulo IA
const AI_BASE = '/ai';

// ============================================================================
// Preguntas (RAG)
// ============================================================================

/**
 * Hace una pregunta semántica sobre todos los documentos procesados
 * de una organización.
 *
 * @param request - Pregunta e ID de organización
 * @returns Respuesta con answer, sources y chunks opcionales
 *
 * @example
 * ```typescript
 * const result = await aiService.askOrganization({
 *   question: '¿Cuáles son las cláusulas de rescisión?',
 *   organizationId: '507f1f77bcf86cd799439011',
 * });
 * console.log(result.data.answer);
 * ```
 */
async function askOrganization(
  request: AskRequest,
): Promise<AiApiResponse<RagResponse>> {
  const response = await apiClient.post<AiApiResponse<RagResponse>>(
    `${AI_BASE}/ask`,
    request,
  );
  return response.data;
}

/**
 * Hace una pregunta semántica acotada a un documento específico.
 *
 * @param documentId - MongoDB ObjectId del documento
 * @param request - Pregunta del usuario
 * @returns Respuesta con answer, sources = [documentId] y chunks opcionales
 *
 * @example
 * ```typescript
 * const result = await aiService.askDocument('507f1f77bcf86cd799439011', {
 *   question: '¿Cuál es el importe total?',
 * });
 * ```
 */
async function askDocument(
  documentId: string,
  request: AskDocumentRequest,
): Promise<AiApiResponse<RagResponse>> {
  const response = await apiClient.post<AiApiResponse<RagResponse>>(
    `${AI_BASE}/documents/${documentId}/ask`,
    request,
  );
  return response.data;
}

// ============================================================================
// Extracción de texto (paso 1 del flujo IA)
// ============================================================================

/**
 * Extrae el texto de un documento almacenado.
 * Paso 1 del flujo: extract-text → process → ask/classify/summarize
 *
 * @param documentId - MongoDB ObjectId del documento
 * @returns Texto extraído, contadores y metadatos del archivo
 */
async function extractText(
  documentId: string,
): Promise<AiApiResponse<ExtractTextResult>> {
  const response = await apiClient.get<AiApiResponse<ExtractTextResult>>(
    `${AI_BASE}/documents/${documentId}/extract-text`,
  );
  return response.data;
}

// ============================================================================
// Procesamiento vectorial (paso 2 del flujo IA)
// ============================================================================

/**
 * Procesa un documento: divide el texto en chunks y genera embeddings vectoriales.
 * Paso 2 del flujo. Puede tardar entre segundos y ~30 s según el tamaño.
 * Requiere que se haya extraído el texto previamente (paso 1).
 *
 * @param documentId - MongoDB ObjectId del documento
 * @param request - Texto previamente extraído
 * @returns Estadísticas del procesamiento (chunks, palabras, tiempo, dimensiones)
 */
async function processDocument(
  documentId: string,
  request: ProcessDocumentRequest,
): Promise<AiApiResponse<ProcessingResult>> {
  const response = await apiClient.post<AiApiResponse<ProcessingResult>>(
    `${AI_BASE}/documents/${documentId}/process`,
    request,
  );
  return response.data;
}

// ============================================================================
// Gestión de chunks
// ============================================================================

/**
 * Elimina todos los chunks vectoriales de un documento.
 * Usar para forzar un reprocesamiento. Siempre mostrar confirmación antes
 * de llamar a esta función.
 *
 * @param documentId - MongoDB ObjectId del documento
 * @returns Número de chunks eliminados
 */
async function deleteChunks(
  documentId: string,
): Promise<AiApiResponse<DeleteChunksResult>> {
  const response = await apiClient.delete<AiApiResponse<DeleteChunksResult>>(
    `${AI_BASE}/documents/${documentId}/chunks`,
  );
  return response.data;
}

// ============================================================================
// Clasificación (requiere extractedText en el documento)
// ============================================================================

/**
 * Clasifica automáticamente un documento en una categoría predefinida
 * y le asigna etiquetas descriptivas.
 * Requiere que el documento tenga extractedText almacenado.
 *
 * @param documentId - MongoDB ObjectId del documento
 * @returns Categoría, confianza (0–1) y tags
 */
async function classifyDocument(
  documentId: string,
): Promise<AiApiResponse<ClassifyResult>> {
  const response = await apiClient.post<AiApiResponse<ClassifyResult>>(
    `${AI_BASE}/documents/${documentId}/classify`,
  );
  return response.data;
}

// ============================================================================
// Resumen (requiere extractedText en el documento)
// ============================================================================

/**
 * Genera un resumen y extrae los puntos clave de un documento.
 * Requiere que el documento tenga extractedText almacenado.
 *
 * @param documentId - MongoDB ObjectId del documento
 * @returns Resumen en texto y array de puntos clave
 */
async function summarizeDocument(
  documentId: string,
): Promise<AiApiResponse<SummarizeResult>> {
  const response = await apiClient.post<AiApiResponse<SummarizeResult>>(
    `${AI_BASE}/documents/${documentId}/summarize`,
  );
  return response.data;
}

// ============================================================================
// Exportación del servicio
// ============================================================================

export const aiService = {
  askOrganization,
  askDocument,
  extractText,
  processDocument,
  deleteChunks,
  classifyDocument,
  summarizeDocument,
};
