import React, { useMemo, useState } from 'react';
import { Modal, Alert, Button } from 'react-bootstrap';
import type { DocumentPreviewModalProps } from '../../types/preview.types';
import { DocumentPreviewType } from '../../types/preview.types';
import { previewService } from '../../services/preview.service';
import { PDFViewer } from './PDFViewer';
import { ImageViewer } from './ImageViewer';
import { VideoPlayer } from './VideoPlayer';
import { TextViewer } from './TextViewer';
import { OfficeViewer } from './OfficeViewer';
import Sidebar from '../Sidebar';
import styles from './DocumentPreviewModal.module.css';
import DocumentCommentsPanel from '../Comments/DocumentCommentsPanel';
import useOrganization from '../../hooks/useOrganization';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../api';
import type { Document } from '../../types/document.types';
import FileUploader from '../FileUploader';

/**
 * Modal principal para preview de documentos
 * Detecta el tipo de documento y muestra el viewer apropiado
 */
export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  show,
  onHide,
  document,
}) => {
  const [showReplace, setShowReplace] = useState(false);
  const [localDoc, setLocalDoc] = useState<any>(document);
  const [previewNonce, setPreviewNonce] = useState(0);

  React.useEffect(() => {
    setLocalDoc(document);
    setPreviewNonce(0);
    setShowReplace(false);
  }, [document, show]);

  // Determinar tipo de preview y URL
  const previewType = useMemo(() => {
    return previewService.getPreviewType(localDoc);
  }, [localDoc]);

  const rawPreviewUrl = useMemo(() => {
    return previewService.getPreviewUrl(localDoc);
  }, [localDoc]);

  const previewUrl = useMemo(() => {
    const sep = rawPreviewUrl.includes('?') ? '&' : '?';
    return `${rawPreviewUrl}${sep}_v=${previewNonce}`;
  }, [rawPreviewUrl, previewNonce]);

  const canPreview = useMemo(() => {
    return previewService.canPreview(localDoc);
  }, [localDoc]);

  const fileSize = useMemo(() => {
    return previewService.formatFileSize(localDoc.size);
  }, [localDoc.size]);

  const { activeOrganization } = useOrganization();
  const { user } = useAuth();

  const orgRole: string = (activeOrganization as any)?.role || 'member';

  const canModerateComments = orgRole === 'owner' || orgRole === 'admin';

  const documentId = (localDoc as any)?.id || (localDoc as any)?._id || '';
  const canComment = orgRole !== 'viewer';

  const currentUserId =
    (user as any)?.id || (user as any)?._id || (user as any)?.userId || '';

  const uploadedById =
    (localDoc as any)?.uploadedBy?.id ||
    (localDoc as any)?.uploadedBy?._id ||
    (localDoc as any)?.uploadedBy ||
    '';

  const canReplaceFile =
    orgRole === 'owner' ||
    orgRole === 'admin' ||
    String(uploadedById) === String(currentUserId);

  const handleReplaceUpload = async (files: File[]): Promise<Document[]> => {
    const file = files[0];
    if (!file || !documentId) {
      throw new Error('Missing file or document id');
    }

    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post(
      `/documents/${documentId}/replace`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    const updated = (res as any)?.data?.document;
    if (!updated) {
      throw new Error(
        (res as any)?.data?.message || 'Failed to replace document',
      );
    }

    setLocalDoc(updated);
    setPreviewNonce((n) => n + 1);

    return [updated];
  };

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
              <strong>File:</strong>{' '}
              {localDoc.filename || localDoc.originalname}
              <br />
              <strong>Type:</strong> {localDoc.mimeType}
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
            filename={localDoc.originalname || localDoc.filename || 'document.pdf'}
            onBack={onHide}
            fileSize={localDoc.size}
          />
        );

      case DocumentPreviewType.IMAGE:
        return (
          <ImageViewer
            url={previewUrl}
            filename={localDoc.originalname || localDoc.filename || 'image'}
            alt={localDoc.originalname}
            onBack={onHide}
            fileSize={localDoc.size}
          />
        );

      case DocumentPreviewType.VIDEO:
        return (
          <VideoPlayer
            url={previewUrl}
            mimeType={localDoc.mimeType}
            filename={localDoc.originalname || localDoc.filename || 'video'}
            onBack={onHide}
            fileSize={localDoc.size}
          />
        );

      case DocumentPreviewType.AUDIO:
        // Por ahora, mostrar un reproductor básico
        return (
          <div className={styles.audioContainer}>
            <audio controls src={previewUrl} className={styles.audioPlayer}>
              Your browser does not support the audio element.
            </audio>
            <p className="text-muted mt-3">{localDoc.originalname || localDoc.filename}</p>
          </div>
        );

      case DocumentPreviewType.TEXT:
      case DocumentPreviewType.CODE:
        return (
          <TextViewer
            url={previewUrl}
            filename={localDoc.originalname || localDoc.filename || 'file.txt'}
            mimeType={localDoc.mimeType}
            onBack={onHide}
            fileSize={localDoc.size}
          />
        );

      case DocumentPreviewType.OFFICE:
        return (
          <OfficeViewer
            url={previewUrl}
            filename={localDoc.originalname || localDoc.filename || 'document'}
            onBack={onHide}
            fileSize={localDoc.size}
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

  // Determinar si debe mostrar el header del modal
  const viewersWithOwnHeader = [
    DocumentPreviewType.PDF,
    DocumentPreviewType.IMAGE,
    DocumentPreviewType.VIDEO,
    DocumentPreviewType.TEXT,
    DocumentPreviewType.CODE,
    DocumentPreviewType.OFFICE,
  ] as const;
  
  const shouldShowModalHeader = !viewersWithOwnHeader.some((type) => type === previewType);

  return (
    <>
      <Modal
        show={show}
        onHide={onHide}
        fullscreen
        className={styles.previewModal}
      >
        {shouldShowModalHeader && (
          <Modal.Header closeButton className={styles.modalHeader}>
            <Modal.Title>
              <i className="bi bi-eye"></i>{' '}
              {localDoc.originalname || localDoc.filename || 'Document Preview'}
            </Modal.Title>
          </Modal.Header>
        )}

        <Modal.Body className={styles.modalBody}>
          <Sidebar activeItem="" />

          <div className={styles.contentRow}>
            <div className={styles.viewerWrapper}>
              <div className='d-flex justify-content-end gap-2 mb-2'>
                {canReplaceFile && (
                  <Button
                    variant='outline-primary'
                    size='sm'
                    onClick={() => setShowReplace(true)}
                  >
                    Reemplazar archivo
                  </Button>
                )}
              </div>

              {renderViewer()}
            </div>

            {/* Comments panel */}
            <div className={styles.commentsWrapper}>
              <DocumentCommentsPanel
                documentId={documentId}
                currentUserId={currentUserId}
                canComment={canComment}
                canModerateComments={canModerateComments}
              />
            </div>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showReplace}
        onHide={() => setShowReplace(false)}
        size='lg'
        centered
        backdrop='static'
        keyboard={false}
      >
        <FileUploader
          allowMultiple={false}
          title='Reemplazar Documento'
          uploadHandler={handleReplaceUpload}
          onUploadSuccess={() => {
            setShowReplace(false);
          }}
        />
      </Modal>
    </>
  );
};

export default DocumentPreviewModal;
