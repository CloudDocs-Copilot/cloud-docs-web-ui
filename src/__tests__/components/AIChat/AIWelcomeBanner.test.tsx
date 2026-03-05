import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIWelcomeBanner } from '../../../components/AIChat/AIWelcomeBanner';

// Mock del subcomponente para no renderizar el Offcanvas real
jest.mock('../../../components/AIChat/AIHelpPanel', () => ({
  AIHelpPanel: ({ show }: { show: boolean }) =>
    show ? <div data-testid="help-panel" /> : null,
}));

describe('AIWelcomeBanner', () => {
  it('renderiza el título y la descripción', () => {
    render(<AIWelcomeBanner />);
    expect(
      screen.getByText(/Asistente de IA para tus documentos/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/lenguaje natural/i)).toBeInTheDocument();
  });

  it('renderiza las pills informativas', () => {
    render(<AIWelcomeBanner />);
    expect(screen.getByText(/Solo documentos procesados/i)).toBeInTheDocument();
    expect(screen.getByText(/Privado a tu organización/i)).toBeInTheDocument();
  });

  it('renderiza el botón de ayuda', () => {
    render(<AIWelcomeBanner />);
    expect(
      screen.getByRole('button', { name: /Abrir panel de ayuda/i }),
    ).toBeInTheDocument();
  });

  it('abre el panel de ayuda al hacer clic', () => {
    render(<AIWelcomeBanner />);
    expect(screen.queryByTestId('help-panel')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Abrir panel de ayuda/i }));

    expect(screen.getByTestId('help-panel')).toBeInTheDocument();
  });

  it('renderiza los chips de sugerencia cuando se pasa onSuggestionClick', () => {
    const handler = jest.fn();
    render(<AIWelcomeBanner onSuggestionClick={handler} />);

    const chips = screen.getAllByRole('button', { name: /Usar pregunta sugerida/i });
    expect(chips.length).toBeGreaterThan(0);
  });

  it('llama a onSuggestionClick con el texto de la sugerencia', () => {
    const handler = jest.fn();
    render(<AIWelcomeBanner onSuggestionClick={handler} />);

    const [firstChip] = screen.getAllByRole('button', { name: /Usar pregunta sugerida/i });
    fireEvent.click(firstChip);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(typeof handler.mock.calls[0][0]).toBe('string');
  });

  it('no renderiza chips si no se pasa onSuggestionClick', () => {
    render(<AIWelcomeBanner />);
    expect(
      screen.queryByRole('button', { name: /Usar pregunta sugerida/i }),
    ).not.toBeInTheDocument();
  });
});
