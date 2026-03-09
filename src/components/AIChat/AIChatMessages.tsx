import React, { useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types/ai.types';
import styles from './AIChatMessages.module.css';

interface AIChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

const AI_AVATAR = '✦';

export const AIChatMessages: React.FC<AIChatMessagesProps> = ({
  messages,
  isLoading,
  error,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading && !error) {
    return null;
  }

  return (
    <section
      className={styles.messageList}
      role="log"
      aria-live="polite"
      aria-label="Mensajes de la conversación"
    >
      {messages.map((msg, idx) => (
        <React.Fragment key={msg.id ?? idx}>
          {/* Burbuja del usuario */}
          <div
            className={`${styles.messagePair} ${styles.springIn}`}
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            <div className={styles.userRow}>
              <div className={styles.userBubble} role="article" aria-label="Tu pregunta">
                {msg.question}
              </div>
            </div>

            {/* Burbuja de la IA */}
            <div className={styles.aiRow}>
              <span className={styles.aiAvatar} aria-hidden="true">{AI_AVATAR}</span>
              <div className={styles.aiContent} role="article" aria-label="Respuesta del asistente">
                <div className={styles.aiAnswer}>
                  {msg.answer}
                </div>

                {/* Fuentes / Chunks — una entrada por documento (score más alto) */}
                {msg.chunks && msg.chunks.length > 0 && (() => {
                  const best = Object.values(
                    msg.chunks.reduce<Record<string, typeof msg.chunks[number]>>((acc, chunk) => {
                      const key = chunk.documentId;
                      if (!acc[key] || (chunk.score ?? 0) > (acc[key].score ?? 0)) acc[key] = chunk;
                      return acc;
                    }, {})
                  );
                  return (
                    <div className={styles.sourcesSection} aria-label="Fuentes consultadas">
                      <p className={styles.sourcesTitle}>Fuentes</p>
                      <ul className={styles.sourcesList}>
                        {best.map((chunk, cIdx) => {
                          const highRelevance = (chunk.score ?? 0) > 0.7;
                          const label = chunk.documentName ?? (chunk.documentId ? `Doc ${chunk.documentId.slice(-6)}` : `Fragmento ${cIdx + 1}`);
                          return (
                            <li
                              key={chunk.documentId}
                              className={`${styles.sourceChip} ${highRelevance ? styles.glowGreen : ''}`}
                              style={{ animationDelay: `${cIdx * 50}ms` }}
                              aria-label={`${label}${highRelevance ? ', alta relevancia' : ''}`}
                            >
                              <span className={styles.sourceChipText} title={label}>
                                {label}
                              </span>
                              {chunk.score !== undefined && (
                                <span className={styles.scoreTag} aria-label={`Relevancia ${Math.round(chunk.score * 100)}%`}>
                                  {Math.round(chunk.score * 100)}%
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}

      {/* Indicador de escritura */}
      {isLoading && (
        <div className={styles.typingRow} role="status" aria-label="El asistente está escribiendo">
          <span className={styles.aiAvatar} aria-hidden="true">{AI_AVATAR}</span>
          <div className={styles.typingBubble}>
            <span className={`${styles.dot} ${styles.dot1}`} aria-hidden="true" />
            <span className={`${styles.dot} ${styles.dot2}`} aria-hidden="true" />
            <span className={`${styles.dot} ${styles.dot3}`} aria-hidden="true" />
          </div>
        </div>
      )}

      {/* Error inline */}
      {error && (
        <div className={styles.errorRow} role="alert" aria-live="assertive">
          <span aria-hidden="true">⚠</span>
          {error}
        </div>
      )}

      <div ref={bottomRef} />
    </section>
  );
};
