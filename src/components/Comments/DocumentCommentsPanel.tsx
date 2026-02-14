import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import type { Comment } from '../../types/comment.types';
import { commentsService } from '../../services/comments.service';
import styles from './DocumentCommentsPanel.module.css';

interface Props {
  documentId: string;
  currentUserId: string;
  canComment: boolean;
  canModerateComments?: boolean;
}

export const DocumentCommentsPanel: React.FC<Props> = ({
  documentId,
  currentUserId,
  canComment,
  canModerateComments = false,
}) => {
  const [items, setItems] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');

  const canSubmit = useMemo(
    () => canComment && content.trim().length > 0 && !saving,
    [canComment, content, saving]
  );

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

  const canEditComment = (comment: Comment) => {
    const createdById =
      (comment as any)?.createdBy?._id ||
      (comment as any)?.createdBy?.id ||
      (comment as any)?.createdBy;

    const isOwner = String(createdById || '') === String(currentUserId || '');
    return isOwner || canModerateComments;
  };

  const startEdit = (comment: Comment) => {
    if (!canEditComment(comment)) return;
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

    const target = items.find((c) => (c.id || (c as any)._id) === editingId);
    if (!target || !canEditComment(target)) {
      setError('No tienes permisos para editar este comentario');
      cancelEdit();
      return;
    }

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
          className={styles.iconBtn}
        >
          ↻
        </Button>
      </div>

      <div className={styles.newComment}>
        <div className={styles.inputWrap}>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder={canComment ? 'Escribe un comentario...' : 'No tienes permisos para comentar'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={saving || !canComment}
            className={styles.textarea}
          />
          <div className={styles.composerFooter}>
            <div className={styles.hint}>
              {!canComment
                ? 'Solo editores o usuarios con permiso de comentar pueden escribir.'
                : content.trim().length === 0
                ? 'Sé claro y breve.'
                : `${content.trim().length} caracteres`}
            </div>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!canSubmit}
              className={styles.primaryBtn}
            >
              {saving ? 'Guardando...' : 'Comentar'}
            </Button>
          </div>
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
            const canEdit = canEditComment(c);

            return (
              <div key={cid} className={styles.item}>
                <div className={styles.avatar} aria-hidden="true">
                  {(authorName || 'U').trim().charAt(0).toUpperCase()}
                </div>

                <div className={styles.body}>
                  <div className={styles.meta}>
                    <div className={styles.authorRow}>
                      <div className={styles.author}>{authorName}</div>
                      <div className={styles.dot} />
                      <div className={styles.date}>{formatDate(c.createdAt)}</div>
                    </div>

                    {!isEditing ? (
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => startEdit(c)}
                        disabled={saving || !canEdit}
                        className={styles.ghostBtn}
                      >
                        Editar
                      </Button>
                    ) : null}
                  </div>

                  {!isEditing ? (
                    <div className={styles.content}>{c.content}</div>
                  ) : (
                    <div className={styles.editWrap}>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        disabled={saving}
                        className={styles.textarea}
                      />
                      <div className={styles.editActions}>
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={saveEdit}
                          disabled={saving || !editingValue.trim()}
                          className={styles.primaryBtnSm}
                        >
                          Guardar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={cancelEdit}
                          disabled={saving}
                          className={styles.ghostBtn}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
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
