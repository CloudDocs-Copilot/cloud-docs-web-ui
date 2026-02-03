import React, { useMemo } from 'react';
import { Modal, Alert } from 'react-bootstrap';
import type { DocumentPreviewModalProps } from '../../types/preview.types';
import { DocumentPreviewType } from '../../types/preview.types';
import { previewService } from '../../services/preview.service';
import { PDFViewer } from './PDFViewer';
import { ImageViewer } from './ImageViewer';
import { VideoPlayer } from './VideoPlayer';
import { TextViewer } from './TextViewer';
import { OfficeViewer } from './OfficeViewer';
import styles from './DocumentPreviewModal.module.css';

/**
 * Modal principal para preview de documentos
 * Detecta el tipo de documento y muestra el viewer apropiado
 */
export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  show,
  onHide,
  document
}) => {
  // Determinar tipo de preview y URL
  const previewType = useMemo(() => {
    return previewService.getPreviewType(document);
  }, [document]);

  const previewUrl = useMemo(() => {
    return previewService.getPreviewUrl(document);
  }, [document]);

  const canPreview = useMemo(() => {
    return previewService.canPreview(document);
  }, [document]);

  const fileSize = useMemo(() => {
    return previewService.formatFileSize(document.size);
  }, [document.size]);

  /**
   * Renderizar el viewer apropiado según el tipo de documento
   */
  const renderViewer = () => {
    if (!canPreview) {
      return (
        <Alert variant="warning" className="m-4">
          <Alert.Heading>
            <i className="bi bi-exclamation-triangle"></i> Preview Not Available
          </Alert.Heading>
          <p>
            This file type is not supported for preview or the file is too large.
          </p>
          <hr />
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>File:</strong> {document.filename || document.originalname}
              <br />
              <strong>Type:</strong> {document.mimeType}
              <br />
              <strong>Size:</strong> {fileSize}
            </div>
            <a
              className="btn btn-primary"
              href={previewUrl}
              download
            >
              <i className="bi bi-download"></i> Download File
            </a>
          </div>
        </Alert>
      );
    }

    switch (previewType) {
      case DocumentPreviewType.PDF:
        return (
          <PDFViewer
            url={previewUrl}
            filename={document.filename || document.originalname || 'document.pdf'}
          />
        );

      case DocumentPreviewType.IMAGE:
        return (
          <ImageViewer
            url={previewUrl}
            filename={document.filename || document.originalname || 'image'}
            alt={document.originalname}
          />
        );

      case DocumentPreviewType.VIDEO:
        return (
          <VideoPlayer
            url={previewUrl}
            mimeType={document.mimeType}
            filename={document.filename || document.originalname || 'video'}
          />
        );

      case DocumentPreviewType.AUDIO:
        // Por ahora, mostrar un reproductor básico
        return (
          <div className={styles.audioContainer}>
            <audio controls src={previewUrl} className={styles.audioPlayer}>
              Your browser does not support the audio element.
            </audio>
            <p className="text-muted mt-3">{document.filename || document.originalname}</p>
          </div>
        );

      case DocumentPreviewType.TEXT:
      case DocumentPreviewType.CODE:
        return (
          <TextViewer
            url={previewUrl}
            filename={document.filename || document.originalname || 'file.txt'}
            mimeType={document.mimeType}
          />
        );

      case DocumentPreviewType.OFFICE:
        return (
          <OfficeViewer
            url={previewUrl}
            filename={document.filename || document.originalname || 'document'}
          />
        );

      default:
        return (
          <Alert variant="secondary" className="m-4">
            <Alert.Heading>
              <i className="bi bi-file-earmark"></i> Unsupported File Type
            </Alert.Heading>
            <p>Preview is not available for this file type.</p>
            <hr />
            <a
              className="btn btn-primary"
              href={previewUrl}
              download
            >
              <i className="bi bi-download"></i> Download File
            </a>
          </Alert>
        );
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      fullscreen="lg-down"
      className={styles.previewModal}
      centered
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title>
          <i className="bi bi-eye"></i>{' '}
          {document.originalname || document.filename || 'Document Preview'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className={styles.modalBody}>
        {renderViewer()}
      </Modal.Body>
    </Modal>
  );
};

export default DocumentPreviewModal;
