import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIChatHistory } from '../../../components/AIChat/AIChatHistory';
import type { HistoryItem } from '../../../types/ai.types';

const makeItem = (overrides: Partial<HistoryItem> = {}): HistoryItem => ({
  conversationId: 'conv-1',
  title: 'Pregunta sobre facturas',
  timestamp: new Date('2024-03-01T12:00:00Z'),
  messageCount: 3,
  ...overrides,
});

describe('AIChatHistory', () => {
  const onSelect = jest.fn().mockResolvedValue(undefined);
  const onDelete = jest.fn().mockResolvedValue(undefined);
  const onNew = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('muestra el encabezado "Conversaciones"', () => {
    render(
      <AIChatHistory
        history={[]}
        activeConversationId={null}
        onSelect={onSelect}
        onDelete={onDelete}
        onNew={onNew}
      />,
    );
    expect(screen.getByText('Conversaciones')).toBeInTheDocument();
  });

  it('muestra el estado vacío cuando no hay historial', () => {
    render(
      <AIChatHistory
        history={[]}
        activeConversationId={null}
        onSelect={onSelect}
        onDelete={onDelete}
        onNew={onNew}
      />,
    );
    expect(screen.getByText(/Sin conversaciones/i)).toBeInTheDocument();
  });

  it('renderiza los items del historial', () => {
    const history = [
      makeItem({ conversationId: 'c1', title: 'Tema de contratos' }),
      makeItem({ conversationId: 'c2', title: 'Facturas de enero' }),
    ];
    render(
      <AIChatHistory
        history={history}
        activeConversationId={null}
        onSelect={onSelect}
        onDelete={onDelete}
        onNew={onNew}
      />,
    );
    expect(screen.getByText('Tema de contratos')).toBeInTheDocument();
    expect(screen.getByText('Facturas de enero')).toBeInTheDocument();
  });

  it('llama a onNew al hacer clic en el botón de nueva conversación', () => {
    render(
      <AIChatHistory
        history={[]}
        activeConversationId={null}
        onSelect={onSelect}
        onDelete={onDelete}
        onNew={onNew}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Iniciar nueva conversación/i }));
    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it('llama a onSelect con el id al hacer clic en un item', () => {
    const history = [makeItem()];
    render(
      <AIChatHistory
        history={history}
        activeConversationId={null}
        onSelect={onSelect}
        onDelete={onDelete}
        onNew={onNew}
      />,
    );
    fireEvent.click(screen.getByText('Pregunta sobre facturas'));
    expect(onSelect).toHaveBeenCalledWith('conv-1');
  });

  it('marca aria-current="page" en la conversación activa', () => {
    const history = [makeItem()];
    render(
      <AIChatHistory
        history={history}
        activeConversationId="conv-1"
        onSelect={onSelect}
        onDelete={onDelete}
        onNew={onNew}
      />,
    );
    // El botón del item activo tiene aria-current=page
    const activeBtn = screen.getByText('Pregunta sobre facturas').closest('button');
    expect(activeBtn).toHaveAttribute('aria-current', 'page');
  });

  it('llama a onDelete con el id al hacer clic en el botón eliminar', () => {
    const history = [makeItem()];
    render(
      <AIChatHistory
        history={history}
        activeConversationId={null}
        onSelect={onSelect}
        onDelete={onDelete}
        onNew={onNew}
      />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: /Eliminar conversación: Pregunta sobre facturas/i }),
    );
    expect(onDelete).toHaveBeenCalledWith('conv-1');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('muestra el conteo de mensajes', () => {
    render(
      <AIChatHistory
        history={[makeItem({ messageCount: 7 })]}
        activeConversationId={null}
        onSelect={onSelect}
        onDelete={onDelete}
        onNew={onNew}
      />,
    );
    expect(screen.getByText('7 msg')).toBeInTheDocument();
  });
});
