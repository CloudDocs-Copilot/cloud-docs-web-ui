import { renderHook, act, waitFor } from '@testing-library/react';
import { useAiChat } from '../../hooks/useAiChat';

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('../../hooks/useOrganization', () => ({
  __esModule: true,
  default: jest.fn(),
  useOrganization: jest.fn(),
}));

jest.mock('../../services/ai.service', () => ({
  aiService: {
    askOrganization: jest.fn(),
    askDocument: jest.fn(),
  },
}));

jest.mock('../../services/ai-conversation.service', () => ({
  aiConversationService: {
    listConversations: jest.fn(),
    createConversation: jest.fn(),
    getConversation: jest.fn(),
    deleteConversation: jest.fn(),
    addMessage: jest.fn(),
  },
}));

import * as useOrgModule from '../../hooks/useOrganization';
import { aiService } from '../../services/ai.service';
import { aiConversationService } from '../../services/ai-conversation.service';

const mockRagResponse = {
  success: true as const,
  data: {
    answer: 'Respuesta de prueba',
    sources: ['doc-1'],
    chunks: [{ documentId: 'doc-1', content: 'fragmento', score: 0.9 }],
  },
};

function mockOrg(id = 'org-123') {
  (useOrgModule.useOrganization as jest.Mock).mockReturnValue({
    activeOrganization: { id },
  });
}

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockOrg();
  (aiConversationService.listConversations as jest.Mock).mockResolvedValue({ data: { conversations: [] } });
  (aiConversationService.createConversation as jest.Mock).mockResolvedValue({ data: { conversation: { id: 'conv-api-1' } } });
  (aiConversationService.addMessage as jest.Mock).mockResolvedValue({ data: { message: { id: 'msg-api-1' } } });
  (aiConversationService.deleteConversation as jest.Mock).mockResolvedValue({});
  (aiConversationService.getConversation as jest.Mock).mockResolvedValue({ data: { conversation: { messages: [] } } });
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useAiChat', () => {
  it('arranca con estado inicial vacío', () => {
    const { result } = renderHook(() => useAiChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.history).toEqual([]);
    expect(result.current.activeConversationId).toBeNull();
    expect(result.current.inputValue).toBe('');
    expect(result.current.mode).toBe('org');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('actualiza inputValue al llamar a setInputValue', () => {
    const { result } = renderHook(() => useAiChat());

    act(() => {
      result.current.setInputValue('¿Quien firmó?');
    });

    expect(result.current.inputValue).toBe('¿Quien firmó?');
  });

  it('cambia el modo a "document"', () => {
    const { result } = renderHook(() => useAiChat());

    act(() => {
      result.current.setMode('document');
    });

    expect(result.current.mode).toBe('document');
  });

  it('setSelectedDocument actualiza id y nombre', () => {
    const { result } = renderHook(() => useAiChat());

    act(() => {
      result.current.setSelectedDocument('doc-xyz', 'Contrato 2024');
    });

    expect(result.current.selectedDocumentId).toBe('doc-xyz');
    expect(result.current.selectedDocumentName).toBe('Contrato 2024');
  });

  it('newConversation limpia el estado activo', () => {
    const { result } = renderHook(() => useAiChat());

    act(() => {
      result.current.setInputValue('algo');
      result.current.newConversation();
    });

    expect(result.current.activeConversationId).toBeNull();
    expect(result.current.inputValue).toBe('');
  });

  it('sendQuestion en modo org llama a askOrganization', async () => {
    (aiService.askOrganization as jest.Mock).mockResolvedValue(mockRagResponse);

    const { result } = renderHook(() => useAiChat());

    act(() => {
      result.current.setInputValue('¿Cuál es el total?');
    });

    await act(async () => {
      await result.current.sendQuestion();
    });

    expect(aiService.askOrganization).toHaveBeenCalledWith({
      question: '¿Cuál es el total?',
      organizationId: 'org-123',
    });

    await waitFor(() => {
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].answer).toBe('Respuesta de prueba');
    });
  });

  it('sendQuestion en modo document llama a askDocument', async () => {
    (aiService.askDocument as jest.Mock).mockResolvedValue(mockRagResponse);

    const { result } = renderHook(() => useAiChat());

    act(() => {
      result.current.setMode('document');
      result.current.setSelectedDocument('doc-1', 'Factura Enero');
      result.current.setInputValue('¿Cuál es el IVA?');
    });

    await act(async () => {
      await result.current.sendQuestion();
    });

    expect(aiService.askDocument).toHaveBeenCalledWith('doc-1', {
      question: '¿Cuál es el IVA?',
    });
  });

  it('sendQuestion registra error cuando la API falla', async () => {
    (aiService.askOrganization as jest.Mock).mockRejectedValue(new Error('API down'));

    const { result } = renderHook(() => useAiChat());

    act(() => {
      result.current.setInputValue('pregunta');
    });

    await act(async () => {
      await result.current.sendQuestion();
    });

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
  });

  it('clearError limpia el error', async () => {
    (aiService.askOrganization as jest.Mock).mockRejectedValue(new Error('fallo'));

    const { result } = renderHook(() => useAiChat());

    act(() => {
      result.current.setInputValue('q');
    });

    await act(async () => {
      await result.current.sendQuestion();
    });

    await waitFor(() => expect(result.current.error).not.toBeNull());

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('crea conversación en BD y registra en historial tras sendQuestion', async () => {
    (aiService.askOrganization as jest.Mock).mockResolvedValue(mockRagResponse);

    const { result } = renderHook(() => useAiChat());

    act(() => {
      result.current.setInputValue('pregunta guardada');
    });

    await act(async () => {
      await result.current.sendQuestion();
    });

    await waitFor(() => expect(result.current.messages).toHaveLength(1));

    expect(aiConversationService.createConversation).toHaveBeenCalled();
    expect(aiConversationService.addMessage).toHaveBeenCalled();
    expect(result.current.history).toHaveLength(1);
  });

  it('no envía si no hay org activa', async () => {
    (useOrgModule.useOrganization as jest.Mock).mockReturnValue({
      activeOrganization: null,
    });

    const { result } = renderHook(() => useAiChat());

    act(() => {
      result.current.setInputValue('pregunta');
    });

    await act(async () => {
      await result.current.sendQuestion();
    });

    expect(aiService.askOrganization).not.toHaveBeenCalled();
    expect(aiService.askDocument).not.toHaveBeenCalled();
  });
});
