import React, { useState } from 'react';
import type { HistoryItem } from '../../types/ai.types';
import ConfirmActionModal from '../ConfirmActionModal';
import styles from './AIChatHistory.module.css';

interface AIChatHistoryProps {
  history: HistoryItem[];
  activeConversationId: string | null;
  onSelect: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onNew: () => void;
}

function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Hace ${diffH} h`;
  const diffD = Math.floor(diffH / 24);
  return `Hace ${diffD} d`;
}

export const AIChatHistory: React.FC<AIChatHistoryProps> = ({
  history,
  activeConversationId,
  onSelect,
  onDelete,
  onNew,
}) => {
  const [pendingDelete, setPendingDelete] = useState<HistoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    await onDelete(pendingDelete.conversationId);
    setDeleting(false);
    setPendingDelete(null);
  };

  return (
    <>
      <aside className={styles.panel} aria-label="Historial de conversaciones">
        <div className={styles.header}>
          <h2 className={styles.heading}>Conversaciones</h2>
        </div>

        <button
          className={styles.newBtn}
          onClick={onNew}
          aria-label="Iniciar nueva conversación"
        >
          <span aria-hidden="true">＋</span>
          Nueva conversación
        </button>

        {history.length === 0 ? (
          <div className={styles.emptyState} role="status">
            <span className={styles.emptyIcon} aria-hidden="true">🗂️</span>
            <p>Sin conversaciones</p>
            <p className={styles.emptyHint}>Empieza haciendo una pregunta</p>
          </div>
        ) : (
          <ul className={styles.list} role="list" aria-label="Conversaciones anteriores">
            {history.map((item, idx) => (
              <li
                key={item.conversationId}
                className={styles.itemWrapper}
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <button
                  className={`${styles.item} ${item.conversationId === activeConversationId ? styles.itemActive : ''}`}
                  onClick={() => void onSelect(item.conversationId)}
                  aria-current={item.conversationId === activeConversationId ? 'page' : undefined}
                >
                  <span className={styles.modeBadge} aria-hidden="true">🗂️</span>
                  <span className={styles.itemContent}>
                    <span className={styles.itemTitle}>{item.title}</span>
                    <span className={styles.itemMeta}>
                      <span>{formatRelativeTime(item.timestamp)}</span>
                      {item.messageCount !== undefined && (
                        <span>{item.messageCount} msg</span>
                      )}
                    </span>
                  </span>
                </button>

                <button
                  className={styles.deleteBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPendingDelete(item);
                  }}
                  aria-label={`Eliminar conversación: ${item.title}`}
                  title="Eliminar conversación"
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <ConfirmActionModal
        show={pendingDelete !== null}
        title="Eliminar conversación"
        confirmLabel="Eliminar"
        confirmVariant="danger"
        processing={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDeleteConfirm}
      >
        <p>
          ¿Eliminar la conversación{' '}
          <strong>&ldquo;{pendingDelete?.title}&rdquo;</strong>?
        </p>
        <p className={styles.deleteWarning}>Esta acción no se puede deshacer.</p>
      </ConfirmActionModal>
    </>
  );
};
