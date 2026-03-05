import React from 'react';
import { render, screen } from '@testing-library/react';
import { AIChatMessages } from '../../../components/AIChat/AIChatMessages';
import type { ChatMessage } from '../../../types/ai.types';

// JSDOM no implementa scrollIntoView
beforeEach(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

const makeMessage = (overrides: Partial<ChatMessage> = {}): ChatMessage => ({
  id: 'msg-1',
  question: '¿Cuál es el importe?',
  answer: 'El importe es 500 €',
  sources: [],
  chunks: [],
  timestamp: new Date('2024-01-01T10:00:00Z'),
  mode: 'org',
  ...overrides,
});

describe('AIChatMessages', () => {
  it('no renderiza nada cuando messages está vacío y no está cargando', () => {
    const { container } = render(
      <AIChatMessages messages={[]} isLoading={false} error={null} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it('renderiza la pregunta del usuario', () => {
    render(
      <AIChatMessages
        messages={[makeMessage()]}
        isLoading={false}
        error={null}
      />,
    );
    expect(screen.getByText('¿Cuál es el importe?')).toBeInTheDocument();
  });

  it('renderiza la respuesta de la IA', () => {
    render(
      <AIChatMessages
        messages={[makeMessage()]}
        isLoading={false}
        error={null}
      />,
    );
    expect(screen.getByText('El importe es 500 €')).toBeInTheDocument();
  });

  it('renderiza múltiples mensajes', () => {
    const messages: ChatMessage[] = [
      makeMessage({ id: '1', question: 'Pregunta 1', answer: 'Respuesta 1' }),
      makeMessage({ id: '2', question: 'Pregunta 2', answer: 'Respuesta 2' }),
    ];
    render(<AIChatMessages messages={messages} isLoading={false} error={null} />);

    expect(screen.getByText('Pregunta 1')).toBeInTheDocument();
    expect(screen.getByText('Respuesta 2')).toBeInTheDocument();
  });

  it('muestra el indicador de escritura cuando isLoading es true', () => {
    render(
      <AIChatMessages messages={[]} isLoading={true} error={null} />,
    );
    expect(screen.getByRole('status', { name: /escribiendo/i })).toBeInTheDocument();
  });

  it('muestra el error cuando se proporciona', () => {
    render(
      <AIChatMessages
        messages={[]}
        isLoading={false}
        error="Error de conexión"
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Error de conexión');
  });

  it('renderiza los chips de fuente cuando el mensaje tiene chunks', () => {
    const message = makeMessage({
      chunks: [
        { documentId: 'doc-abc123', content: 'texto del fragmento', score: 0.9 },
      ],
    });
    render(
      <AIChatMessages messages={[message]} isLoading={false} error={null} />,
    );
    expect(screen.getByLabelText(/Fuentes consultadas/i)).toBeInTheDocument();
  });

  it('aplica la clase de alta relevancia cuando score > 0.7', () => {
    const message = makeMessage({
      chunks: [
        { documentId: 'doc-1', content: 'relevante', score: 0.85 },
      ],
    });
    render(
      <AIChatMessages messages={[message]} isLoading={false} error={null} />,
    );
    expect(screen.getByLabelText(/alta relevancia/i)).toBeInTheDocument();
  });

  it('muestra el porcentaje de relevancia', () => {
    const message = makeMessage({
      chunks: [
        { documentId: 'doc-1', content: 'fragmento', score: 0.8 },
      ],
    });
    render(
      <AIChatMessages messages={[message]} isLoading={false} error={null} />,
    );
    expect(screen.getByText('80%')).toBeInTheDocument();
  });

  it('el log de mensajes tiene aria-label apropiado', () => {
    render(
      <AIChatMessages
        messages={[makeMessage()]}
        isLoading={false}
        error={null}
      />,
    );
    expect(
      screen.getByRole('log', { name: /Mensajes de la conversación/i }),
    ).toBeInTheDocument();
  });
});
