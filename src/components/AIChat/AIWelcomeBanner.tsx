import React, { useState } from 'react';
import { AIHelpPanel } from './AIHelpPanel';
import styles from './AIWelcomeBanner.module.css';

const SUGGESTIONS = [
  '¿Cuál es el importe total de la última factura?',
  '¿Qué cláusulas hablan de rescisión anticipada?',
  '¿Quién firmó el contrato de servicios?',
  'Resume el informe anual de 2024',
];

interface AIWelcomeBannerProps {
  onSuggestionClick?: (question: string) => void;
}

export const AIWelcomeBanner: React.FC<AIWelcomeBannerProps> = ({ onSuggestionClick }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <div className={styles.wrapper} role="region" aria-label="Bienvenida al asistente de IA">
        {/* Ícono central */}
        <div className={styles.iconRing} aria-hidden="true">✦</div>

        <h2 className={styles.title}>Asistente de IA para tus documentos</h2>

        <p className={styles.description}>
          Haz preguntas en lenguaje natural sobre el contenido de tus archivos
          y obtén respuestas con las fuentes exactas. Busca en toda tu organización
          o limita la búsqueda a un documento concreto.
        </p>

        {/* Pills informativas */}
        <div className={styles.infoRow} aria-hidden="true">
          <span className={styles.infoPill}>
            <span className={styles.pillDot} />
            Solo documentos procesados
          </span>
          <span className={styles.infoPill}>
            <span className={styles.pillDot} />
            Privado a tu organización
          </span>
          <span className={styles.infoPill}>
            <span className={styles.pillDot} />
            Sin acceso a internet
          </span>
        </div>

        {/* Botón de ayuda */}
        <button
          className={styles.helpBtn}
          onClick={() => setShowHelp(true)}
          aria-label="Abrir panel de ayuda sobre la IA"
        >
          <span aria-hidden="true">❓</span>
          ¿Cómo funciona?
        </button>

        {/* Sugerencias de preguntas */}
        {onSuggestionClick && (
          <>
            <p className={styles.suggestionsTitle} aria-hidden="true">
              Puedes preguntar cosas como…
            </p>
            <ul className={styles.suggestions} role="list" aria-label="Preguntas sugeridas">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button
                    className={styles.suggestionChip}
                    onClick={() => onSuggestionClick(s)}
                    aria-label={`Usar pregunta sugerida: ${s}`}
                  >
                    <span aria-hidden="true">💬</span>
                    {s}
                    <span className={styles.chipArrow} aria-hidden="true">›</span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <AIHelpPanel show={showHelp} onHide={() => setShowHelp(false)} />
    </>
  );
};
