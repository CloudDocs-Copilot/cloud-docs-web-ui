import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import type { Comment } from '../../types/comment.types';
import { commentsService } from '../../services/comments.service';
import styles from './DocumentCommentsPanel.module.css';

interface Props {
  documentId: string;
}

export const DocumentCommentsPanel: React.FC<Props> = ({ documentId }) => {
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const canSubmit = useMemo(() => content.trim().length > 0 && !saving, [content, saving]);

  const fetchComments = async () => {
    if (!documentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await commentsService.listByDocument(documentId);
      setItems(res.comments || []);
    } catch (e: any) {
      setError(e?.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const handleCreate = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const res = await commentsService.create(documentId, content.trim());
      setItems((prev) => [res.comment, ...prev]);
      setContent('');
    } catch (e: any) {
      setError(e?.message || 'Failed to create comment');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (comment: Comment) => {
    const cid = comment.id || (comment as any)._id;
    setEditingId(cid);
    setEditingValue(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editingValue.trim()) return;

    setSaving(true);
    setError(null);
    try {
      const res = await commentsService.update(editingId, editingValue.trim());
      setItems((prev) =>
        prev.map((c) => {
          const cid = c.id || (c as any)._id;
          return cid === editingId ? res.comment : c;
        })
      );
      cancelEdit();
    } catch (e: any) {
      setError(e?.message || 'Failed to update comment');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.title}>Comentarios</div>
        <Button
          size="sm"
          variant="outline-secondary"
          onClick={fetchComments}
          disabled={loading || saving}
        >
          ↻
        </Button>
      </div>

      <div className={styles.newComment}>
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Escribe un comentario..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={saving}
        />
        <div className={styles.newActions}>
          <Button variant="primary" onClick={handleCreate} disabled={!canSubmit}>
            {saving ? 'Guardando...' : 'Comentar'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className={styles.alert}>
          {error}
        </Alert>
      )}

      <div className={styles.list}>
        {loading ? (
          <div className={styles.center}>
            <Spinner animation="border" size="sm" />
            <span className={styles.centerText}>Cargando comentarios...</span>
          </div>
        ) : items.length === 0 ? (
          <div className={styles.empty}>Aún no hay comentarios.</div>
        ) : (
          items.map((c) => {
            const cid = c.id || (c as any)._id;
            const authorName = c.createdBy?.name || c.createdBy?.email || 'Usuario';
            const isEditing = editingId === cid;

            return (
              <div key={cid} className={styles.item}>
                <div className={styles.meta}>
                  <div className={styles.author}>{authorName}</div>
                  <div className={styles.date}>{formatDate(c.createdAt)}</div>
                </div>

                {!isEditing ? (
                  <div className={styles.content}>{c.content}</div>
                ) : (
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    disabled={saving}
                  />
                )}

                <div className={styles.actions}>
                  {!isEditing ? (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => startEdit(c)}
                      disabled={saving}
                    >
                      Editar
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={saveEdit}
                        disabled={saving || !editingValue.trim()}
                      >
                        Guardar
                      </Button>
                      <Button size="sm" variant="outline-secondary" onClick={cancelEdit} disabled={saving}>
                        Cancelar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DocumentCommentsPanel;
