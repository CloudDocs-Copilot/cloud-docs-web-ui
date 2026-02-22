import React, { useState } from 'react';
import { Card, Badge, Modal, Button } from 'react-bootstrap';
import { GripVertical } from 'react-bootstrap-icons';
import type { Document } from '../types/document.types';
import { getFileTypeFromMime, formatFileSize } from '../types/document.types';

import { getDocumentDisplayName } from '../utils/documentHelper';
import { DocumentPreviewModal } from './DocumentPreview';
import type { PreviewDocument } from '../types/preview.types';
import { previewService } from '../services/preview.service';
import styles from './DocumentCard.module.css';
import { useDocumentDeletion } from '../hooks/useDocumentDeletion';

interface DocumentCardProps {
  document: Document;
  onDeleted?: () => void;
  onRename?: (document: Document) => void;
  canDelete?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDeleted, onRename, canDelete = true }) => {
  const { moveToTrash, loading } = useDocumentDeletion();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [, setError] = useState<string | null>(null);

  /**
   * Elimina el documento directamente
   */
  const handleMoveToTrash = async () => {
    try {
      const documentId = document.id ?? document._id ?? '';
      const deleted = await moveToTrash(documentId);
      if (deleted) {
        setShowDeleteModal(false);
        onDeleted?.();
      } else {
        setError('No se pudo mover el documento a la papelera');
      }
    } catch (err: unknown) {
      console.error('Error deleting document:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar el documento');
    }
  };

  // Mapeo de folder IDs a nombres de categorías
  const getFolderName = (folderId: string): string => {
    const folderMap: { [key: string]: string } = {
      'folder_legal': 'Legal',
      'folder_finanzas': 'Finanzas',
      'folder_proyectos': 'Proyectos',
      'folder_tecnico': 'Técnico',
      'folder_marketing': 'Marketing'
    };
    return folderMap[folderId] || 'General';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Legal': '#fbbf24',
      'Finanzas': '#10b981',
      'Proyectos': '#a855f7',
      'Técnico': '#f97316',
      'Marketing': '#a855f7',
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
  const folderName = getFolderName(document.folder);

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
            <Badge 
              className={styles.categoryBadge}
              style={{ backgroundColor: getCategoryColor(folderName) }}
            >
              <span className={styles.badgeIcon}>✨</span>
              {folderName}
            </Badge>
          </div>

          {/* Footer con fecha y tamaño */}
          <div className={styles.cardFooter}>
            <span className={styles.documentDate}>
              {formatDate(document.uploadedAt)}
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
            {/* <h6 className={styles.documentName}>{document.originalname || document.filename}</h6> */}
            </>
          )}
>>>>>>> d1e68ce6e7c73c34a1148a744a8e6ed335856b0d
        </div>
      </Card>

      {/* Modal de confirmación de eliminación */}
      {canDelete && (
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Mover a papelera</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>¿Deseas mover este documento a la papelera?</p>
            <p className="text-muted">
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

      {/* Modal de preview */}
      <DocumentPreviewModal
        show={showPreview}
        onHide={handleClosePreview}
        document={previewDocument}
      />
    </>
  );
};

export default DocumentCard;
