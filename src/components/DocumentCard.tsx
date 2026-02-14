import React, { useState } from 'react';
import { Card, Badge, Modal, Button } from 'react-bootstrap';
import type { Document } from '../types/document.types';
import { getFileTypeFromMime, formatFileSize } from '../types/document.types';
import { useDocumentDeletion } from '../hooks/useDocumentDeletion';
import { DocumentPreviewModal } from './DocumentPreview';
import type { PreviewDocument } from '../types/preview.types';
import { previewService } from '../services/preview.service';
import styles from './DocumentCard.module.css';

interface DocumentCardProps {
  document: Document;
  onDeleted?: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onDeleted }) => {
  const { moveToTrash, loading } = useDocumentDeletion();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  /**
   * Maneja el movimiento a papelera
   */
  const handleMoveToTrash = async () => {
    const documentId = document.id || (document as any)._id;
    const deleted = await moveToTrash(documentId);
    if (deleted) {
      setShowDeleteModal(false);
      onDeleted?.();
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

  /**
   * Convertir Document a PreviewDocument para el modal de preview
   */
  const previewDocument: PreviewDocument = {
    id: document.id || (document as any)._id, // Usar _id si id no existe (MongoDB)
    filename: document.filename || document.originalname || 'unknown',
    originalname: document.originalname,
    mimeType: document.mimeType,
    size: document.size,
    url: document.url,
    path: document.path
  };

  console.log('[DocumentCard] Preview document:', {
    originalId: document.id,
    mongoId: (document as any)._id,
    finalId: previewDocument.id,
    filename: previewDocument.filename
  });

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
      <Card className={styles.documentCard} onClick={handlePreviewClick} style={{ cursor: canPreview ? 'pointer' : 'default' }}>
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
              <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </Card>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Mover a papelera</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Deseas mover este documento a la papelera?</p>
          <p className="text-muted">
            <strong>{document.originalname || document.filename}</strong>
          </p>
          <p className="text-muted small">
            El documento se eliminará automáticamente después de 30 días. Puedes restaurarlo desde la papelera antes de ese tiempo.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="danger" 
            onClick={handleMoveToTrash}
            disabled={loading}
          >
            {loading ? 'Moviendo...' : 'Mover a papelera'}
          </Button>
        </Modal.Footer>
      </Modal>

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
