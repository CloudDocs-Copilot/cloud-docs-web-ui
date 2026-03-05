import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AICollectionsPage from '../pages/AICollectionsPage';

// ── router mock ────────────────────────────────────────────────────────────────────

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// ── hook mocks ────────────────────────────────────────────────────────────────────

jest.mock('../hooks/usePageInfoTitle', () => ({
  usePageTitle: jest.fn(),
}));

jest.mock('../hooks/useOrganization', () => ({
  __esModule: true,
  default: () => ({ activeOrganization: { id: 'org-1', name: 'Mi Org' } }),
  useOrganization: () => ({ activeOrganization: { id: 'org-1', name: 'Mi Org' } }),
}));

// ── Mocks de componentes hijos ───────────────────────────────────────────────

jest.mock('../components/AIChat/AIChatHistory', () => ({
  AIChatHistory: ({ onNew }: { onNew: () => void }) => (
    <aside data-testid="chat-history">
      <button onClick={onNew} aria-label="Nueva conversación">Nueva</button>
    </aside>
  ),
}));

jest.mock('../components/AIChat/AIWelcomeBanner', () => ({
  AIWelcomeBanner: ({ onSuggestionClick }: { onSuggestionClick?: (t: string) => void }) => (
    <div data-testid="welcome-banner">
      <button onClick={() => onSuggestionClick?.('sugerencia test')}>
        Usar sugerencia
      </button>
    </div>
  ),
}));

jest.mock('../components/AIChat/AIChatMessages', () => ({
  AIChatMessages: () => <div data-testid="chat-messages" />,
}));

jest.mock('../components/AIChat/AIChatInput', () => ({
  AIChatInput: ({ sendQuestion, inputValue }: { sendQuestion: () => Promise<void>; inputValue: string }) => (
    <div data-testid="chat-input">
      <span data-testid="input-value">{inputValue}</span>
      <button onClick={() => void sendQuestion()}>Enviar</button>
    </div>
  ),
}));

jest.mock('../components/AIChat/AIHelpPanel', () => ({
  AIHelpPanel: ({ show }: { show: boolean }) =>
    show ? <div data-testid="help-panel" /> : null,
}));

// ── Mock del hook ────────────────────────────────────────────────────────────

const mockChat = {
  messages: [] as import('../types/ai.types').ChatMessage[],
  activeConversationId: null as string | null,
  history: [] as import('../types/ai.types').HistoryItem[],
  inputValue: '',
  debouncedValue: '',
  setInputValue: jest.fn(),
  mode: 'org' as const,
  setMode: jest.fn(),
  selectedDocumentId: null as string | null,
  selectedDocumentName: null as string | null,
  setSelectedDocument: jest.fn(),
  isLoading: false,
  error: null as string | null,
  clearError: jest.fn(),
  sendQuestion: jest.fn().mockResolvedValue(undefined),
  newConversation: jest.fn(),
  selectConversation: jest.fn().mockResolvedValue(undefined),
  deleteConversation: jest.fn().mockResolvedValue(undefined),
};

jest.mock('../hooks/useAiChat', () => ({
  useAiChat: () => mockChat,
}));

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('AICollectionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockChat.messages = [];
    mockChat.inputValue = '';
  });

  it('renderiza el título "Colecciones IA"', () => {
    render(<AICollectionsPage />);
    expect(screen.getByRole('heading', { name: /Colecciones IA/i })).toBeInTheDocument();
  });

  it('muestra el panel de historial', () => {
    render(<AICollectionsPage />);
    expect(screen.getByTestId('chat-history')).toBeInTheDocument();
  });

  it('muestra el banner de bienvenida cuando no hay mensajes', () => {
    render(<AICollectionsPage />);
    expect(screen.getByTestId('welcome-banner')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-messages')).not.toBeInTheDocument();
  });

  it('muestra los mensajes cuando hay conversación activa', () => {
    mockChat.messages = [
      {
        id: 'msg-1',
        question: 'test',
        answer: 'respuesta',
        sources: [],
        chunks: [],
        timestamp: new Date(),
        mode: 'org',
      },
    ];
    render(<AICollectionsPage />);
    expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    expect(screen.queryByTestId('welcome-banner')).not.toBeInTheDocument();
  });

  it('siempre muestra el input', () => {
    render(<AICollectionsPage />);
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
  });

  it('abre el panel de ayuda al hacer clic en "Ayuda"', () => {
    render(<AICollectionsPage />);
    expect(screen.queryByTestId('help-panel')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Abrir ayuda/i }));

    expect(screen.getByTestId('help-panel')).toBeInTheDocument();
  });

  it('llama a newConversation al hacer clic en "Nueva" (barra lateral)', () => {
    render(<AICollectionsPage />);
    // Hay dos botones con este nombre: header + sidebar mock; usamos el primero
    const [firstNewBtn] = screen.getAllByRole('button', { name: /Nueva conversaci\u00f3n/i });
    fireEvent.click(firstNewBtn);
    expect(mockChat.newConversation).toHaveBeenCalledTimes(1);
  });

  it('setInputValue se llama al usar una sugerencia del banner', () => {
    render(<AICollectionsPage />);
    fireEvent.click(screen.getByText('Usar sugerencia'));
    expect(mockChat.setInputValue).toHaveBeenCalledWith('sugerencia test');
  });

  it('renderiza correctamente con historial existente', () => {
    mockChat.history = [
      {
        conversationId: 'c1',
        title: 'Conv 1',
        timestamp: new Date(),
        messageCount: 2,
      },
    ];
    render(<AICollectionsPage />);
    expect(screen.getByTestId('chat-history')).toBeInTheDocument();
  });

  it('el botón "Dashboard" navega a /dashboard', () => {
    render(<AICollectionsPage />);
    fireEvent.click(screen.getByRole('button', { name: /Volver al Dashboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('el botón "Nueva" del header llama a newConversation', async () => {
    render(<AICollectionsPage />);
    // El header tiene el botón de "Nueva" junto al de ayuda; es el primero de los dos
    const newBtns = screen.getAllByRole('button', { name: /Nueva conversaci\u00f3n/i });
    fireEvent.click(newBtns[0]);
    await waitFor(() => {
      expect(mockChat.newConversation).toHaveBeenCalled();
    });
  });
});
