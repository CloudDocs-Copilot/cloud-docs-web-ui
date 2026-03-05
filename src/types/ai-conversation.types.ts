/**
 * Tipos para la persistencia de conversaciones de IA en base de datos
 * Contrato de API: /api/ai/conversations
 * @module ai-conversation.types
 */

import type { ChatMode } from './ai.types';

// ============================================================================
// Modelos de respuesta del servidor
// ============================================================================

/** Fragmento de texto con puntuación de relevancia (almacenado en BD) */
export interface StoredChunk {
  documentId: string;
  content: string;
  /** Relevancia semántica 0.0–1.0 */
  score: number;
}

/** Mensaje individual (par pregunta/respuesta) almacenado en una conversación */
export interface StoredMessage {
  id: string;
  question: string;
  answer: string;
  /** Array de document ObjectId strings usados como fuentes */
  sources: string[];
  chunks: StoredChunk[];
  mode: ChatMode;
  documentId?: string;
  documentName?: string;
  /** ISO 8601 date string */
  timestamp: string;
}

/** Vista resumida de una conversación — usada en el listado del historial */
export interface ConversationSummary {
  id: string;
  title: string;
  mode: ChatMode;
  documentId?: string;
  documentName?: string;
  messageCount: number;
  /** ISO 8601 date string */
  lastActivity: string;
  /** ISO 8601 date string */
  createdAt: string;
}

/** Vista completa de una conversación — incluye todos los mensajes */
export interface ConversationDetail extends ConversationSummary {
  messages: StoredMessage[];
  organizationId: string;
  userId: string;
  /** ISO 8601 date string */
  updatedAt: string;
}

// ============================================================================
// Request DTOs (frontend → API)
// ============================================================================

export interface CreateConversationRequest {
  /** Primera pregunta truncada a 120 chars — usada como título */
  title: string;
  mode: ChatMode;
  /** Requerido cuando mode === 'document' */
  documentId?: string;
  documentName?: string;
}

export interface UpdateConversationRequest {
  /** Único campo editable desde la UI */
  title: string;
}

export interface AddMessageRequest {
  question: string;
  answer: string;
  sources: string[];
  chunks: StoredChunk[];
  mode: ChatMode;
  documentId?: string;
  documentName?: string;
  /** ISO 8601 date string — enviado por el frontend para consistencia */
  timestamp: string;
}

// ============================================================================
// Query params
// ============================================================================

export interface ListConversationsQuery {
  page?: number;
  limit?: number;
  mode?: ChatMode;
}

// ============================================================================
// Response wrappers (espejo del ApiResponse del servidor)
// ============================================================================

export interface ListConversationsResponse {
  success: true;
  data: {
    conversations: ConversationSummary[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface CreateConversationResponse {
  success: true;
  data: { conversation: ConversationSummary };
}

export interface GetConversationResponse {
  success: true;
  data: { conversation: ConversationDetail };
}

export interface UpdateConversationResponse {
  success: true;
  data: { conversation: ConversationSummary };
}

export interface DeleteConversationResponse {
  success: true;
  data: { deletedId: string };
}

export interface AddMessageResponse {
  success: true;
  data: { message: StoredMessage; messageCount: number };
}
