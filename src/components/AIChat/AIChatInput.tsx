import React, { useRef } from 'react';
import { Spinner } from 'react-bootstrap';
import type { ChatMode } from '../../types/ai.types';
import { AIDocumentSelector } from './AIDocumentSelector';
import styles from './AIChatInput.module.css';

interface AIChatInputProps {
  mode: ChatMode;
  setMode: (mode: ChatMode) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  selectedDocumentId: string | null;
  selectedDocumentName: string | null;
  setSelectedDocument: (id: string, name: string) => void;
  isLoading: boolean;
  sendQuestion: (question?: string) => Promise<void>;
}

export const AIChatInput: React.FC<AIChatInputProps> = ({
  mode,
  setMode,
  inputValue,
  setInputValue,
  selectedDocumentId,
  setSelectedDocument,
  isLoading,
  sendQuestion,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && inputValue.trim()) {
        void sendQuestion();
      }
    }
  };

  const handleSend = () => {
    if (!isLoading && inputValue.trim()) {
      void sendQuestion();
    }
  };

  const canSend =
    !isLoading &&
    inputValue.trim().length > 0 &&
    (mode === 'org' || selectedDocumentId !== null);

  return (
    <div className={styles.wrapper} role="region" aria-label="Área de entrada de pregunta">
      {/* Toggle de modo */}
      <div className={styles.modeToggle} role="group" aria-label="Modo de búsqueda">
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'org' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('org')}
          aria-pressed={mode === 'org'}
          aria-label="Buscar en toda la organización"
        >
          <span aria-hidden="true">🏢</span>
          Organización
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'document' ? styles.modeBtnActive : ''}`}
          onClick={() => setMode('document')}
          aria-pressed={mode === 'document'}
          aria-label="Buscar en un documento específico"
        >
          <span aria-hidden="true">📄</span>
          Documento
        </button>
      </div>

      {/* Selector de documento (modo documento) */}
      {mode === 'document' && (
        <div className={`${styles.docSelectorWrapper} ${styles.docSelectorVisible}`} aria-label="Selección de documento">
          <AIDocumentSelector value={selectedDocumentId} onChange={setSelectedDocument} />
        </div>
      )}

      {/* Advertencia si está en modo documento pero sin seleccionar */}
      {mode === 'document' && selectedDocumentId === null && (
        <p className={styles.docWarning} role="note">
          Selecciona un documento para continuar
        </p>
      )}

      {/* Área de texto + botón */}
      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu pregunta… (Enter para enviar, Shift+Enter para nueva línea)"
          disabled={isLoading}
          rows={2}
          maxLength={2000}
          aria-label="Campo de pregunta"
          aria-multiline="true"
        />

        <button
          type="button"
          className={`${styles.sendBtn} ${canSend ? styles.sendBtnReady : ''}`}
          onClick={handleSend}
          disabled={!canSend}
          aria-label={isLoading ? 'Enviando pregunta…' : 'Enviar pregunta'}
          title="Enviar"
        >
          {isLoading ? (
            <Spinner animation="border" size="sm" aria-hidden="true" />
          ) : (
            <span className={styles.sendIcon} aria-hidden="true">➤</span>
          )}
        </button>
      </div>

      {/* Contador de caracteres */}
      <div className={styles.charCount} aria-live="polite" aria-atomic="true">
        {inputValue.length}/2000
      </div>
    </div>
  );
};
