/**
 * Servicio para la persistencia de conversaciones de IA en base de datos
 * Prefijo: /api/ai/conversations
 * @module ai-conversation.service
 */

import { apiClient } from '../api';
import type {
  ListConversationsQuery,
  ListConversationsResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  GetConversationResponse,
  UpdateConversationRequest,
  UpdateConversationResponse,
  DeleteConversationResponse,
  AddMessageRequest,
  AddMessageResponse,
} from '../types/ai-conversation.types';

const BASE = '/ai/conversations';

// ============================================================================
// Listado
// ============================================================================

/**
 * Lista las conversaciones del usuario autenticado para la org activa.
 * No incluye el array de mensajes — solo datos resumidos para el historial.
 */
async function listConversations(
  query: ListConversationsQuery = {},
): Promise<ListConversationsResponse> {
  const response = await apiClient.get<ListConversationsResponse>(BASE, {
    params: query,
  });
  return response.data;
}

// ============================================================================
// Crear
// ============================================================================

/**
 * Crea una nueva conversación vacía (sin mensajes).
 * Los mensajes se añaden con addMessage() tras recibir respuesta de la IA.
 */
async function createConversation(
  data: CreateConversationRequest,
): Promise<CreateConversationResponse> {
  const response = await apiClient.post<CreateConversationResponse>(BASE, data);
  return response.data;
}

// ============================================================================
// Detalle
// ============================================================================

/**
 * Obtiene una conversación completa con todos sus mensajes.
 */
async function getConversation(
  conversationId: string,
): Promise<GetConversationResponse> {
  const response = await apiClient.get<GetConversationResponse>(
    `${BASE}/${conversationId}`,
  );
  return response.data;
}

// ============================================================================
// Actualizar
// ============================================================================

/**
 * Actualiza el título de una conversación.
 */
async function updateConversation(
  conversationId: string,
  data: UpdateConversationRequest,
): Promise<UpdateConversationResponse> {
  const response = await apiClient.patch<UpdateConversationResponse>(
    `${BASE}/${conversationId}`,
    data,
  );
  return response.data;
}

// ============================================================================
// Eliminar (soft delete)
// ============================================================================

/**
 * Realiza el soft delete de una conversación.
 * El registro permanece en BD con isDeleted=true.
 */
async function deleteConversation(
  conversationId: string,
): Promise<DeleteConversationResponse> {
  const response = await apiClient.delete<DeleteConversationResponse>(
    `${BASE}/${conversationId}`,
  );
  return response.data;
}

// ============================================================================
// Añadir mensaje
// ============================================================================

/**
 * Añade un par pregunta/respuesta a una conversación existente.
 * Llamar después de recibir la respuesta de la IA.
 */
async function addMessage(
  conversationId: string,
  data: AddMessageRequest,
): Promise<AddMessageResponse> {
  const response = await apiClient.post<AddMessageResponse>(
    `${BASE}/${conversationId}/messages`,
    data,
  );
  return response.data;
}

// ============================================================================
// Exportación
// ============================================================================

export const aiConversationService = {
  listConversations,
  createConversation,
  getConversation,
  updateConversation,
  deleteConversation,
  addMessage,
};
