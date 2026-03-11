import React, { useState } from 'react';
import { Card, Modal, Button } from 'react-bootstrap';
import { GripVertical } from 'react-bootstrap-icons';
import type { Document } from '../types/document.types';
import { getFileTypeFromMime, formatFileSize } from '../types/document.types';

import { getDocumentDisplayName } from '../utils/documentHelper';
import { DocumentPreviewModal } from './DocumentPreview';
import type { PreviewDocument } from '../types/preview.types';
import { previewService } from '../services/preview.service';
import styles from './DocumentCard.module.css';
import { useDocumentDeletion } from '../hooks/useDocumentDeletion';
import { getActiveOrganizationId, getOrganizationMembers, shareDocument } from '../services/document.service';

interface DocumentCardProps {
  document: Document;
  onDeleted?: () => void;
  onRename?: (document: Document) => void;
  canDelete?: boolean;
}

type ShareMember = {
  userId: string;
  name: string;
  email: string;
};

type UserIdLike = string | { toString?: () => string };

type OrgMemberUser = {
  id?: string;
  _id?: UserIdLike;
  name?: string;
  email?: string;
};

type OrgMemberApi = {
  user?: string | OrgMemberUser | null;
};

function toIdString(value: UserIdLike | undefined): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && typeof value.toString === 'function') return value.toString();
  return '';
}

function getDocumentOwnerId(doc: Document): string {
  const maybe = doc as unknown as { uploadedBy?: UserIdLike };
  return toIdString(maybe.uploadedBy);
}

function getSharedWithIds(doc: Document): string[] {
  const maybe = doc as unknown as { sharedWith?: unknown };
  const raw = maybe.sharedWith;

  if (!Array.isArray(raw)) return [];

  return raw
    .map((v) => {
      if (typeof v === 'string') return v;

      if (typeof v === 'object' && v !== null) {
        const obj = v as { id?: string; _id?: UserIdLike; toString?: () => string };
        if (typeof obj.id === 'string') return obj.id;
        const fromUnderscore = toIdString(obj._id);
        if (fromUnderscore) return fromUnderscore;
        if (typeof obj.toString === 'function') return obj.toString();
      }

      return '';
    })
    .filter((id) => /^[a-fA-F0-9]{24}$/.test(id));
}

function getUserIdFromUserRaw(userRaw: string | OrgMemberUser | null | undefined): string {
  if (!userRaw) return '';
  if (typeof userRaw === 'string') return userRaw;

  if (typeof userRaw.id === 'string') return userRaw.id;

  const fromUnderscore = toIdString(userRaw._id);
  if (fromUnderscore) return fromUnderscore;

  return '';
}

function readJsonFromStorage(key: string): unknown {
  try {
    const v = localStorage.getItem(key);
    if (!v) return null;
    return JSON.parse(v) as unknown;
  } catch {
    return null;
  }
}

function getCurrentUserIdFromStorage(): string {
  const auth = localStorage.getItem('auth_user');
  const direct = JSON.parse(auth!)?.id;
  if (direct && /^[a-fA-F0-9]{24}$/.test(direct)) return direct;

  const candidates = ['user', 'authUser', 'currentUser'];
  for (const key of candidates) {
    const parsed = readJsonFromStorage(key);
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as { id?: string; _id?: UserIdLike; user?: { id?: string; _id?: UserIdLike } };
      const nested = obj.user;
      const id =
        (typeof obj.id === 'string' ? obj.id : '') ||
        toIdString(obj._id) ||
        (nested && typeof nested.id === 'string' ? nested.id : '') ||
        (nested ? toIdString(nested._id) : '');

      if (id && /^[a-fA-F0-9]{24}$/.test(id)) return id;
    }
  }

  return '';
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDeleted, onRename, canDelete = true }) => {
  const { moveToTrash, loading } = useDocumentDeletion();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [, setError] = useState<string | null>(null);

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [members, setMembers] = useState<ShareMember[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState('');

  const ownerId = getDocumentOwnerId(document);
  const currentUserId = getCurrentUserIdFromStorage();
  const canShare = !!ownerId && (!currentUserId || ownerId === currentUserId);

  /**
   * Elimina el documento directamente
   */
  const handleMoveToTrash = async () => {
    try {
      const documentId = document.id || '';
      const deleted = await moveToTrash(documentId);
      if (deleted) {
        setShowDeleteModal(false);
        onDeleted?.();
      } else {
        setError('No se pudo mover el documento a la papelera');
      }
    } catch (err: unknown) {
      console.error('Error deleting document:', err);
      setError('Error al eliminar el documento');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Contrato': '#fbbf24',
      'Factura': '#10b981',
      'Informe': '#3b82f6',
      'Manual': '#f97316',
      'Política': '#8b5cf6',
      'Presentación': '#ec4899',
      'Reporte Financiero': '#059669',
      'Acta de Reunión': '#6366f1',
      'Propuesta': '#14b8a6',
      'Recibo': '#84cc16',
      'Nómina': '#22c55e',
      'Certificado': '#f59e0b',
      'Documento Fiscal': '#ef4444',
      'Carta': '#06b6d4',
      'Solicitud': '#a855f7',
      'Cotización': '#fb923c',
      'Presupuesto': '#0d9488',
      'Factura Proforma': '#65a30d',
      'Factura Simplificada': '#0891b2',
      'Orden de Compra': '#ea580c',
      'Hoja de Cálculo': '#16a34a',
      'Imagen/Fotografía': '#d946ef',
      'Presentación Técnica': '#2563eb',
      'Política Interna': '#7c3aed',
      'Carta Comercial': '#047857',
      'Declaración': '#d97706',
      'Permiso': '#0e7490',
      'Licencia': '#15803d',
      'Resumen Ejecutivo': '#9333ea',
      'Checklist': '#ca8a04',
      'Formulario': '#475569',
      'Otro': '#6b7280',
      'General': '#6b7280'
    };
    return colors[category] || '#6b7280';
  };

  const getFileIcon = (type: string) => {
    const iconClass = type === 'pdf' 
      ? styles.fileIconPdf 
      : type === 'excel' 
      ? styles.fileIconExcel 
      : styles.fileIconWord;

    return (
      <svg className={`${styles.fileIcon} ${iconClass}`} viewBox="0 0 24 24" fill="currentColor">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
      </svg>
    );
  };

  // Formatear fecha a formato legible
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return dateObj.toLocaleDateString('es-ES', options);
  };

  // Obtener tipo de archivo desde MIME type
  const fileType = getFileTypeFromMime(document.mimeType);
  const categoryName = document.aiCategory || 'General';

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'document',
      id: document.id
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  /**
   * Convertir Document a PreviewDocument para el modal de preview
   */
  const previewDocument: PreviewDocument = {
    id: document.id,
    filename: document.filename || document.originalname || 'unknown',
    originalname: document.originalname,
    mimeType: document.mimeType,
    size: document.size,
    url: document.url,
    path: document.path
  };

  /**
   * Verificar si el documento puede tener preview
   */
  const canPreview = previewService.canPreview(previewDocument);

  /**
   * Abrir modal de preview
   */
  const handlePreviewClick = () => {
    if (canPreview) {
      setShowPreview(true);
    }
  };

  /**
   * Cerrar modal de preview
   */
  const handleClosePreview = () => {
    setShowPreview(false);
  };

  /**
   * Descargar documento
   */
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const downloadUrl = previewService.getDownloadUrl(previewDocument);
    window.open(downloadUrl, '_blank');
  };

  const loadShareMembers = async () => {
    setShareError(null);
    setMembersLoading(true);

    try {
      const activeOrgId = await getActiveOrganizationId();
      const rawMembers = (await getOrganizationMembers(activeOrgId)) as unknown as OrgMemberApi[];

      const alreadySharedIds = new Set(getSharedWithIds(document));

      console.log('Document rawMembers:', rawMembers);
      const mapped: ShareMember[] = rawMembers
        .map((m) => {
          const userRaw = m.user;

          const userId = String(getUserIdFromUserRaw(userRaw));

          const email = typeof userRaw === 'string' ? '' : String(userRaw?.email || '');
          const name = typeof userRaw === 'string' ? 'Usuario' : String(userRaw?.name || email || 'Usuario');

          return { userId, name, email };
        })
        .filter((m) => /^[a-fA-F0-9]{24}$/.test(m.userId))
        .filter((m) => !ownerId || m.userId !== ownerId)
        .filter((m) => !alreadySharedIds.has(m.userId));

      console.log('Mapped members for sharing:', mapped);
      setMembers(mapped);
    } catch (err: unknown) {
      console.error('Error loading members:', err);
      setShareError(err instanceof Error ? err.message : 'Error al cargar miembros');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleOpenShareModal = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUserId && ownerId && currentUserId !== ownerId) {
      setShareError('Solo el propietario del documento puede compartirlo.');
      setShowShareModal(true);
      return;
    }
    setShowShareModal(true);
    setSelectedUserIds([]);
    setMemberSearch('');
    await loadShareMembers();
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setShareError(null);
    setMembers([]);
    setSelectedUserIds([]);
    setMemberSearch('');
  };

  const toggleSelected = (userId: string) => {
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) return prev.filter((id) => id !== userId);
      return [...prev, userId];
    });
  };

  const handleConfirmShare = async () => {
    setShareError(null);

    const documentId = document.id ?? '';
    if (!documentId) {
      setShareError('Documento inválido');
      return;
    }

    if (selectedUserIds.length === 0) {
      setShareError('Selecciona al menos un miembro');
      return;
    }

    setShareLoading(true);
    try {
      await shareDocument(documentId, selectedUserIds);
      handleCloseShareModal();
    } catch (err: unknown) {
      console.error('Error sharing document:', err);
      setShareError(err instanceof Error ? err.message : 'Error al compartir el documento');
    } finally {
      setShareLoading(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    console.log('Filtering member:', m, 'with search:', memberSearch);
    const q = memberSearch.trim().toLowerCase();
    if (!q) return true;
    return (m.name || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q);
  });

  return (
    <>
      <Card 
        className={`${styles.documentCard} ${isDragging ? styles.dragging : ''}`}
        onClick={handlePreviewClick} 
        style={{ cursor: 'grab' }}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Indicador de arrastre */}
        <div className={styles.dragHandle}>
          <GripVertical size={14} className="text-muted" />
        </div>
        <Card.Body className={styles.cardBody}>
          {/* Ícono del documento */}
          <div className={styles.iconWrapper}>
            {getFileIcon(fileType)}
          </div>

          {/* Nombre del documento */}
          <h3 className={styles.documentTitle}>
            {document.originalname || document.filename || 'Sin nombre'}
          </h3>

          {/* Badge de categoría con ícono */}
          <div className={styles.badgeWrapper}>
            <span
              className={styles.categoryBadge}
              style={{ backgroundColor: getCategoryColor(categoryName) }}
            >
              <span className={styles.badgeIcon}>✨</span>
              {categoryName}
            </span>
          </div>

          {/* Footer con fecha y tamaño */}
          <div className={styles.cardFooter}>
            <span className={styles.documentDate}>
              {document.uploadedAt ? formatDate(document.uploadedAt) : '—'}
            </span>
            <span className={styles.documentSize}>
              {formatFileSize(document.size)}
            </span>
          </div>
        </Card.Body>

        {/* Botones de opciones (aparecen en hover) */}
        <div className={styles.cardOptions}>
          {canPreview && (
            <button
              className={styles.optionBtn}
              title="Vista previa"
              onClick={(e) => {
                e.stopPropagation();
                handlePreviewClick();
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}
          <button 
            className={styles.optionBtn} 
            title="Descargar"
            onClick={handleDownload}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round"/>
              <polyline points="7 10 12 15 17 10" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {onRename && (
            <button 
              className={styles.optionBtn} 
              title="Renombrar"
              onClick={(e) => {
                e.stopPropagation();
                onRename(document);
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          )}

          {canShare && (
            <button
              className={styles.optionBtn}
              title="Compartir"
              onClick={handleOpenShareModal}
              disabled={membersLoading || shareLoading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="18" cy="5" r="3" strokeWidth="2" strokeLinecap="round" />
                <circle cx="6" cy="12" r="3" strokeWidth="2" strokeLinecap="round" />
                <circle cx="18" cy="19" r="3" strokeWidth="2" strokeLinecap="round" />
                <line x1="8.7" y1="10.7" x2="15.3" y2="6.3" strokeWidth="2" strokeLinecap="round" />
                <line x1="8.7" y1="13.3" x2="15.3" y2="17.7" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}

          {canDelete && (
            <button
              className={styles.optionBtn}
              title="Mover a papelera"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteModal(true);
              }}
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </Card>

      {/* Modal de compartir */}
      <Modal show={showShareModal} onHide={handleCloseShareModal}>
        <Modal.Header closeButton>
          <Modal.Title>Compartir documento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-2">
            Selecciona miembros de tu organización para compartir:
          </p>

          <p className="text-muted">
            <strong>{getDocumentDisplayName(document)}</strong>
          </p>

          {shareError && (
            <div className="alert alert-danger" role="alert">
              {shareError}
            </div>
          )}

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o email..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
            />
          </div>

          {membersLoading ? (
            <p className="text-muted">Cargando miembros...</p>
          ) : (
            <div style={{ maxHeight: 280, overflowY: 'auto' }}>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((m) => {
                  const checked = selectedUserIds.includes(m.userId);
                  return (
                    <div
                      key={m.userId}
                      className="d-flex align-items-center justify-content-between py-2 border-bottom"
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleSelected(m.userId)}
                      role="button"
                      tabIndex={0}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{m.name}</div>
                        {m.email ? <div className="text-muted small">{m.email}</div> : null}
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleSelected(m.userId)}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted mb-0">No hay miembros disponibles para compartir.</p>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseShareModal} disabled={shareLoading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirmShare}
            disabled={shareLoading || membersLoading || selectedUserIds.length === 0}
          >
            {shareLoading ? 'Compartiendo...' : `Compartir (${selectedUserIds.length})`}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      {canDelete && (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Mover a papelera</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Deseas mover este documento a la papelera?</p>
            <p className="text-muted" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
              <strong>{getDocumentDisplayName(document)}</strong>
            </p>
            <p className="text-muted small">
              El documento se eliminará automáticamente después de 30 días. Puedes restaurarlo desde la papelera antes de
              ese tiempo.
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleMoveToTrash} disabled={loading}>
              {loading ? 'Moviendo...' : 'Mover a papelera'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Modal de preview - solo renderizar cuando se muestra */}
      {showPreview && (
        <DocumentPreviewModal
          show={showPreview}
          onHide={handleClosePreview}
          document={previewDocument}
        />
      )}
    </>
  );
};

export default DocumentCard;
