/**
 * Tipos para el módulo de IA de CloudDocs
 * Contrato de API: /api/ai
 * @module ai.types
 */

// ============================================================================
// Wrapper genérico de respuesta de la API
// ============================================================================

export interface AiApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface AiApiError {
  success: false;
  error: string;
  statusCode: 400 | 401 | 403 | 404 | 500;
}

// ============================================================================
// POST /api/ai/ask
// ============================================================================

export interface AskRequest {
  /** Pregunta del usuario (no vacía) */
  question: string;
  /** MongoDB ObjectId string de la organización */
  organizationId: string;
}

// ============================================================================
// POST /api/ai/documents/:documentId/ask
// ============================================================================

export interface AskDocumentRequest {
  /** Pregunta del usuario (no vacía) */
  question: string;
}

// ============================================================================
// Respuesta compartida de preguntas (org y documento)
// ============================================================================

export interface RagChunk {
  documentId: string;
  content: string;
  /** Relevancia semántica: 0.0–1.0. Score > 0.7 = alta relevancia */
  score: number;
  /** Nombre legible del documento (enriquecido en el frontend) */
  documentName?: string;
}

export interface RagResponse {
  answer: string;
  /** Array de document ObjectId strings usados como fuentes */
  sources: string[];
  chunks?: RagChunk[];
}

// ============================================================================
// GET /api/ai/documents/:documentId/extract-text
// ============================================================================

export interface PdfMetadata {
  Author?: string;
  Title?: string;
  Subject?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: string;
  ModDate?: string;
}

export interface ExtractTextResult {
  text: string;
  charCount: number;
  wordCount: number;
  /** Ej: "application/pdf" */
  mimeType: string;
  /** Solo para archivos PDF */
  metadata?: PdfMetadata;
}

// ============================================================================
// POST /api/ai/documents/:documentId/process
// ============================================================================

export interface ProcessDocumentRequest {
  /** Texto previamente extraído (no vacío) */
  text: string;
}

export interface ProcessingResult {
  documentId: string;
  chunksCreated: number;
  totalWords: number;
  /** Tiempo de procesamiento en milisegundos */
  processingTime: number;
  /** Tamaño del vector de embedding, ej. 1536 */
  dimensions: number;
}

// ============================================================================
// DELETE /api/ai/documents/:documentId/chunks
// ============================================================================

export interface DeleteChunksResult {
  deletedCount: number;
}

// ============================================================================
// POST /api/ai/documents/:documentId/classify
// ============================================================================

export type DocumentCategory =
  | 'Contrato'
  | 'Factura'
  | 'Informe'
  | 'Manual'
  | 'Política'
  | 'Presentación'
  | 'Reporte Financiero'
  | 'Acta de Reunión'
  | 'Propuesta'
  | 'Recibo'
  | 'Nómina'
  | 'Certificado'
  | 'Documento Fiscal'
  | 'Carta'
  | 'Solicitud'
  | 'Cotización'
  | 'Presupuesto'
  | 'Factura Proforma'
  | 'Factura Simplificada'
  | 'Orden de Compra'
  | 'Hoja de Cálculo'
  | 'Imagen/Fotografía'
  | 'Presentación Técnica'
  | 'Política Interna'
  | 'Carta Comercial'
  | 'Declaración'
  | 'Permiso'
  | 'Licencia'
  | 'Resumen Ejecutivo'
  | 'Checklist'
  | 'Formulario'
  | 'Otro';

export interface ClassifyResult {
  category: DocumentCategory;
  /** Confianza: 0.0–1.0 */
  confidence: number;
  tags: string[];
}

// ============================================================================
// POST /api/ai/documents/:documentId/summarize
// ============================================================================

export interface SummarizeResult {
  summary: string;
  keyPoints: string[];
}

// ============================================================================
// Tipos internos de UI
// ============================================================================

/** Modo de búsqueda del chat */
export type ChatMode = 'org' | 'document';

/** Un par pregunta-respuesta en la conversación */
export interface ChatMessage {
  id: string;
  question: string;
  answer: string;
  sources: string[];
  chunks: RagChunk[];
  timestamp: Date;
  mode: ChatMode;
  /** ID del documento si mode === 'document' */
  documentId?: string;
  /** Nombre del documento para mostrar en UI si mode === 'document' */
  documentName?: string;
}

/** Entrada resumida en el historial lateral */
export interface HistoryItem {
  /** ID único de la conversación (agrupa mensajes) */
  conversationId: string;
  /** Primera pregunta de la conversación (usada como título) */
  title: string;
  timestamp: Date;
  messageCount: number;
}

/** Estado de procesamiento IA de un documento (para UI) */
export type AiDocumentStatus = 'none' | 'pending' | 'processing' | 'completed' | 'failed';

/** Formatos de archivo NO compatibles con la IA */
export const AI_UNSUPPORTED_MIME_TYPES: readonly string[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-excel', // xls
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  'application/vnd.ms-powerpoint', // ppt
] as const;

/** Formatos de archivo compatibles con la IA */
export const AI_SUPPORTED_MIME_TYPES: readonly string[] = [
  'application/pdf',
  'text/plain',
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/markdown',
] as const;

/**
 * Devuelve true si el mimeType del documento es compatible con la IA
 */
export function isAiCompatibleMimeType(mimeType: string): boolean {
  return AI_SUPPORTED_MIME_TYPES.includes(mimeType);
}
