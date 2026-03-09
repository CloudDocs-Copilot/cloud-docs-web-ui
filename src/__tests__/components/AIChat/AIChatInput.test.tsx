import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIChatInput } from '../../../components/AIChat/AIChatInput';

jest.mock('../../../components/AIChat/AIDocumentSelector', () => ({
  AIDocumentSelector: ({ value, onChange }: { value: string | null; onChange: (id: string, name: string) => void }) => (
    <div data-testid="doc-selector">
      <button onClick={() => onChange('doc-x', 'Doc X')} aria-label="select-doc">
        {value ?? 'Sin documento'}
      </button>
    </div>
  ),
}));

const defaultProps = {
  mode: 'org' as const,
  setMode: jest.fn(),
  inputValue: '',
  setInputValue: jest.fn(),
  selectedDocumentId: null,
  selectedDocumentName: null,
  setSelectedDocument: jest.fn(),
  isLoading: false,
  sendQuestion: jest.fn().mockResolvedValue(undefined),
};

describe('AIChatInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza el toggle de modo', () => {
    render(<AIChatInput {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Buscar en toda la organización/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Buscar en un documento específico/i })).toBeInTheDocument();
  });

  it('llama a setMode("document") al hacer clic en el botón Documento', () => {
    render(<AIChatInput {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Buscar en un documento específico/i }));
    expect(defaultProps.setMode).toHaveBeenCalledWith('document');
  });

  it('no muestra el selector de documento en modo org', () => {
    render(<AIChatInput {...defaultProps} />);
    expect(screen.queryByTestId('doc-selector')).not.toBeInTheDocument();
  });

  it('muestra el selector de documento en modo document', () => {
    render(<AIChatInput {...defaultProps} mode="document" />);
    expect(screen.getByTestId('doc-selector')).toBeInTheDocument();
  });

  it('muestra aviso si modo document y no hay documento seleccionado', () => {
    render(<AIChatInput {...defaultProps} mode="document" selectedDocumentId={null} />);
    expect(screen.getByText(/Selecciona un documento/i)).toBeInTheDocument();
  });

  it('actualiza el inputValue al escribir en el textarea', () => {
    render(<AIChatInput {...defaultProps} />);
    fireEvent.change(screen.getByRole('textbox', { name: /Campo de pregunta/i }), {
      target: { value: 'Hola' },
    });
    expect(defaultProps.setInputValue).toHaveBeenCalledWith('Hola');
  });

  it('llama a sendQuestion al pulsar Enter (sin Shift)', async () => {
    render(<AIChatInput {...defaultProps} inputValue="¿Quién firmó?" />);
    fireEvent.keyDown(screen.getByRole('textbox', { name: /Campo de pregunta/i }), {
      key: 'Enter',
      shiftKey: false,
    });
    expect(defaultProps.sendQuestion).toHaveBeenCalledTimes(1);
  });

  it('NO llama a sendQuestion al pulsar Shift+Enter', () => {
    render(<AIChatInput {...defaultProps} inputValue="¿Quién firmó?" />);
    fireEvent.keyDown(screen.getByRole('textbox', { name: /Campo de pregunta/i }), {
      key: 'Enter',
      shiftKey: true,
    });
    expect(defaultProps.sendQuestion).not.toHaveBeenCalled();
  });

  it('el botón de enviar está deshabilitado cuando inputValue está vacío', () => {
    render(<AIChatInput {...defaultProps} inputValue="" />);
    expect(screen.getByRole('button', { name: /Enviar pregunta/i })).toBeDisabled();
  });

  it('el botón de enviar está habilitado cuando hay texto en modo org', () => {
    render(<AIChatInput {...defaultProps} inputValue="pregunta" />);
    expect(screen.getByRole('button', { name: /Enviar pregunta/i })).not.toBeDisabled();
  });

  it('el botón de enviar está deshabilitado en modo document sin documentId', () => {
    render(
      <AIChatInput
        {...defaultProps}
        mode="document"
        inputValue="pregunta"
        selectedDocumentId={null}
      />,
    );
    expect(screen.getByRole('button', { name: /Enviar pregunta/i })).toBeDisabled();
  });

  it('muestra el spinner cuando isLoading es true', () => {
    render(<AIChatInput {...defaultProps} inputValue="pregunta" isLoading={true} />);
    expect(screen.getByRole('button', { name: /Enviando pregunta/i })).toBeInTheDocument();
  });

  it('muestra el contador de caracteres', () => {
    render(<AIChatInput {...defaultProps} inputValue="hola" />);
    expect(screen.getByText('4/2000')).toBeInTheDocument();
  });
});
