/**
 * Hook central para el mÃ³dulo de IA â€” Colecciones Inteligentes
 * Gestiona conversaciones, historial y el flujo de preguntas.
 * La persistencia se realiza siempre en la base de datos mediante
 * /api/ai/conversations (aiConversationService).
 * @module useAiChat
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { aiService } from '../services/ai.service';
import { aiConversationService } from '../services/ai-conversation.service';
import { listDocuments, listSharedDocuments } from '../services/document.service';
import { useOrganization } from './useOrganization';
import type {
  ChatMessage,
  ChatMode,
  HistoryItem,
  RagChunk,
} from '../types/ai.types';
import type { StoredMessage } from '../types/ai-conversation.types';

// ============================================================================
// Constantes
// ============================================================================

const MAX_HISTORY_ITEMS = 30;
const DEBOUNCE_MS = 500;

// ============================================================================
// Tipos internos del hook
// ============================================================================

/** Mapa de conversaciones: conversationId â†’ mensajes */
type ConversationsMap = Record<string, ChatMessage[]>;

export interface UseAiChatReturn {
  // --- Estado de conversaciÃ³n activa ---
  messages: ChatMessage[];
  activeConversationId: string | null;

  // --- Historial lateral ---
  history: HistoryItem[];

  // --- Input ---
  inputValue: string;
  debouncedValue: string;
  setInputValue: (value: string) => void;

  // --- Modo de bÃºsqueda ---
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;

  // --- Documento seleccionado (modo 'document') ---
  selectedDocumentId: string | null;
  selectedDocumentName: string | null;
  setSelectedDocument: (id: string | null, name?: string | null) => void;

  // --- Async state ---
  isLoading: boolean;
  error: string | null;
  clearError: () => void;

  // --- Acciones ---
  sendQuestion: () => Promise<void>;
  newConversation: () => void;
  selectConversation: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
}

// ============================================================================
// Helper: convertir StoredMessage (API) â†’ ChatMessage (UI)
// ============================================================================

/** Enriquece los chunks con el nombre legible del documento */
function enrichChunks(chunks: RagChunk[], namesMap: Record<string, string>): RagChunk[] {
  return chunks.map((c) => ({
    ...c,
    documentName: c.documentName ?? namesMap[c.documentId] ?? undefined,
  }));
}

function storedMessageToChatMessage(m: StoredMessage): ChatMessage {
  return {
    id: m.id,
    question: m.question,
    answer: m.answer,
    sources: m.sources,
    chunks: m.chunks as RagChunk[],
    timestamp: new Date(m.timestamp),
    mode: m.mode,
    documentId: m.documentId,
    documentName: m.documentName,
  };
}

// ============================================================================
// Hook
// ============================================================================

export function useAiChat(): UseAiChatReturn {
  const { activeOrganization } = useOrganization();
  const orgId = activeOrganization?.id ?? '';

  // --- Input y debounce ---
  const [inputValue, setInputValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSetInputValue = useCallback((value: string) => {
    setInputValue(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedValue(value);
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // --- Modo y documento ---
  const [mode, setMode] = useState<ChatMode>('org');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedDocumentName, setSelectedDocumentName] = useState<string | null>(null);

  const handleSetSelectedDocument = useCallback(
    (id: string | null, name?: string | null) => {
      setSelectedDocumentId(id);
      setSelectedDocumentName(name ?? null);
    },
    [],
  );

  // --- Conversaciones y historial ---
  const [conversations, setConversations] = useState<ConversationsMap>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // --- Mapa documentId → nombre legible (cargado desde listDocuments) ---
  const docNamesRef = useRef<Record<string, string>>({});

  // --- Async ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // Cargar historial desde la API cuando cambia la org
  // ============================================================================

  useEffect(() => {
    if (!orgId) {
      setConversations({});
      setHistory([]);
      setActiveConversationId(null);
      return;
    }

    // Cargar mapa de nombres de documentos en paralelo
    Promise.allSettled([listDocuments(), listSharedDocuments()]).then(([myRes, sharedRes]) => {
      const map: Record<string, string> = {};
      const addDocs = (docs: { id?: string; _id?: string; originalname?: string; filename?: string }[]) => {
        for (const d of docs) {
          const id = d.id ?? d._id;
          if (id) map[id] = d.originalname ?? d.filename ?? id;
        }
      };
      if (myRes.status === 'fulfilled') addDocs(myRes.value.documents as never[]);
      if (sharedRes.status === 'fulfilled') addDocs(sharedRes.value.documents as never[]);
      docNamesRef.current = map;
    }).catch(() => { /* silenciar */ });

    (async () => {
      try {
        const res = await aiConversationService.listConversations({ limit: MAX_HISTORY_ITEMS });
        const summaries = res.data.conversations;
        const apiHistory: HistoryItem[] = summaries.map((s) => ({
          conversationId: s.id,
          title: s.title,
          timestamp: new Date(s.lastActivity),
          messageCount: s.messageCount,
        }));
        setHistory(apiHistory);
        // Mapa vacÃ­o â€” mensajes se cargan bajo demanda en selectConversation
        const emptyMap: ConversationsMap = {};
        for (const s of summaries) emptyMap[s.id] = [];
        setConversations(emptyMap);
      } catch {
        setHistory([]);
        setConversations({});
      }
    })();

    setActiveConversationId(null);
  }, [orgId]);

  // ============================================================================
  // Mensajes de la conversaciÃ³n activa
  // ============================================================================

  const messages: ChatMessage[] =
    activeConversationId ? (conversations[activeConversationId] ?? []) : [];

  // ============================================================================
  // Acciones
  // ============================================================================

  const newConversation = useCallback(() => {
    setActiveConversationId(null);
    setInputValue('');
    setDebouncedValue('');
    setError(null);
  }, []);

  const selectConversation = useCallback(async (conversationId: string) => {
    setActiveConversationId(conversationId);
    setInputValue('');
    setDebouncedValue('');
    setError(null);

    const cached = conversations[conversationId];
    if (!cached || cached.length === 0) {
      try {
        const res = await aiConversationService.getConversation(conversationId);
        const msgs = res.data.conversation.messages
          .map(storedMessageToChatMessage)
          .map((msg) => ({ ...msg, chunks: enrichChunks(msg.chunks, docNamesRef.current) }));
        setConversations((prev) => ({ ...prev, [conversationId]: msgs }));
      } catch {
        // Silenciar â€” la conversaciÃ³n aparecerÃ¡ vacÃ­a si falla la red
      }
    }
  }, [conversations]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await aiConversationService.deleteConversation(conversationId);
    } catch {
      // Silenciar â€” la eliminaciÃ³n local sigue adelante aunque falle la API
    }

    setConversations((prev) => {
      const updated = { ...prev };
      delete updated[conversationId];
      return updated;
    });
    setHistory((prev) => prev.filter((h) => h.conversationId !== conversationId));
    setActiveConversationId((prev) =>
      prev === conversationId ? null : prev,
    );
  }, []);

  const sendQuestion = useCallback(async () => {
    const question = inputValue.trim();
    if (!question || isLoading) return;

    if (mode === 'org' && !orgId) {
      setError('No hay una organizaciÃ³n activa. Selecciona una organizaciÃ³n para continuar.');
      return;
    }

    if (mode === 'document' && !selectedDocumentId) {
      setError('Selecciona un documento antes de hacer una pregunta.');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Determinar o crear conversaciÃ³n activa
    let conversationId = activeConversationId;
    const isNewConversation = !conversationId;

    if (isNewConversation) {
      // Crear conversaciÃ³n en BD
      try {
        const res = await aiConversationService.createConversation({
          title: question.length > 120 ? `${question.slice(0, 120)}…` : question,
          mode,
          documentId: mode === 'document' ? selectedDocumentId! : undefined,
          documentName: mode === 'document' ? (selectedDocumentName ?? undefined) : undefined,
        });
        conversationId = res.data.conversation.id;
      } catch {
        // Fallback: id local efÃ­mero si la BD falla
        conversationId = uuidv4();
      }
      setActiveConversationId(conversationId);
    }

    try {
      let ragResponse;

      if (mode === 'org') {
        const result = await aiService.askOrganization({
          question,
          organizationId: orgId,
        });
        ragResponse = result.data;
      } else {
        const result = await aiService.askDocument(selectedDocumentId!, { question });
        ragResponse = result.data;
      }

      const messageTimestamp = new Date();

      const newMessage: ChatMessage = {
        id: uuidv4(),
        question,
        answer: ragResponse.answer,
        sources: ragResponse.sources,
        chunks: enrichChunks(ragResponse.chunks ?? [], docNamesRef.current),
        timestamp: messageTimestamp,
        mode,
        documentId: mode === 'document' ? selectedDocumentId! : undefined,
        documentName: mode === 'document' ? (selectedDocumentName ?? undefined) : undefined,
      };

      // Persistir mensaje en BD
      try {
        const saved = await aiConversationService.addMessage(conversationId!, {
          question: newMessage.question,
          answer: newMessage.answer,
          sources: newMessage.sources,
          chunks: newMessage.chunks,
          mode: newMessage.mode,
          documentId: newMessage.documentId,
          documentName: newMessage.documentName,
          timestamp: messageTimestamp.toISOString(),
        });
        newMessage.id = saved.data.message.id;
      } catch {
        // Silenciar â€” el mensaje se muestra aunque falle la persistencia
      }

      setConversations((prev) => ({
        ...prev,
        [conversationId!]: [...(prev[conversationId!] ?? []), newMessage],
      }));

      if (isNewConversation) {
        const newHistoryItem: HistoryItem = {
          conversationId: conversationId!,
          title: question.length > 60 ? `${question.slice(0, 60)}…` : question,
          timestamp: messageTimestamp,
          messageCount: 1,
        };
        setHistory((prev) => [newHistoryItem, ...prev].slice(0, MAX_HISTORY_ITEMS));
      } else {
        setHistory((prev) =>
          prev.map((h) =>
            h.conversationId === conversationId
              ? { ...h, messageCount: h.messageCount + 1, timestamp: messageTimestamp }
              : h,
          ),
        );
      }

      setInputValue('');
      setDebouncedValue('');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Error al procesar la pregunta. IntÃ©ntalo de nuevo.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [
    inputValue,
    isLoading,
    mode,
    orgId,
    selectedDocumentId,
    selectedDocumentName,
    activeConversationId,
  ]);

  // ============================================================================
  // Return
  // ============================================================================

  return {
    messages,
    activeConversationId,
    history,
    inputValue,
    debouncedValue,
    setInputValue: handleSetInputValue,
    mode,
    setMode,
    selectedDocumentId,
    selectedDocumentName,
    setSelectedDocument: handleSetSelectedDocument,
    isLoading,
    error,
    clearError: useCallback(() => setError(null), []),
    sendQuestion,
    newConversation,
    selectConversation,
    deleteConversation,
  };
}

