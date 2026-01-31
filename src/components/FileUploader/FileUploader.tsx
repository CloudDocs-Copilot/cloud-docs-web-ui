/**
 * Componente principal de subida de archivos
 * @module FileUploader
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, ProgressBar } from 'react-bootstrap';
import { Upload, X, CheckCircle } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { DropZone } from './DropZone';
import { FileList } from './FileList';
import { UPLOAD_CONSTRAINTS } from '../../types/upload.types';
import type { Document } from '../../types/document.types';
import styles from './FileUploader.module.css';

interface FileUploaderProps {
  /** ID de la carpeta destino (opcional) */
  folderId?: string;
  /** Callback cuando se completan todas las subidas exitosamente */
  onUploadSuccess?: (documents: Document[]) => void;
  /** Callback para cerrar el uploader */
  onClose?: () => void;
}

/**
 * Componente completo para subida de archivos con drag & drop
 */
export const FileUploader: React.FC<FileUploaderProps> = ({
  folderId,
  onUploadSuccess,
  onClose,
}) => {
  const [validationErrors, setValidationErrors] = useState<
    Array<{ fileName: string; message: string }>
  >([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    files,
    isUploading,
    totalProgress,
    addFiles,
    removeFile,
    uploadAll,
    cancelUpload,
    cancelAll,
    retryUpload,
    clearCompleted,
    reset,
    pendingCount,
    successCount,
    errorCount,
  } = useFileUpload({
    folderId,
    onAllComplete: (completedFiles) => {
      const successDocs = completedFiles
        .filter((f) => f.status === 'success' && f.result)
        .map((f) => f.result!);

      if (successDocs.length > 0 && completedFiles.every((f) => f.status === 'success')) {
        setShowSuccess(true);
        
        // Auto-cerrar después de mostrar éxito
        setTimeout(() => {
          onUploadSuccess?.(successDocs);
          onClose?.();
        }, UPLOAD_CONSTRAINTS.SUCCESS_CLOSE_DELAY_MS);
      }
    },
  });

  // Limpiar errores de validación después de un tiempo
  useEffect(() => {
    if (validationErrors.length > 0) {
      const timer = setTimeout(() => {
        setValidationErrors([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [validationErrors]);

  /**
   * Maneja la selección de archivos
   */
  const handleFilesSelected = (selectedFiles: FileList | File[]) => {
    const result = addFiles(selectedFiles);

    if (result.invalid.length > 0) {
      setValidationErrors(
        result.invalid.map(({ file, error }) => ({
          fileName: file.name,
          message: error.message,
        }))
      );
    }
  };

  /**
   * Inicia la subida de archivos
   */
  const handleUpload = async () => {
    setValidationErrors([]);
    await uploadAll();
  };

  /**
   * Maneja el cierre del uploader
   */
  const handleClose = () => {
    if (isUploading) {
      cancelAll();
    }
    reset();
    onClose?.();
  };

  const hasFiles = files.length > 0;
  const canUpload = pendingCount > 0 && !isUploading;
  const maxFilesReached = files.length >= UPLOAD_CONSTRAINTS.MAX_SIMULTANEOUS_UPLOADS;

  return (
    <Card className={styles.uploaderCard}>
      {/* Header */}
      <Card.Header className={styles.header}>
        <div className={styles.headerTitle}>
          <Upload size={20} />
          <h5>Subir Documentos</h5>
        </div>
        {onClose && (
          <Button
            variant="link"
            onClick={handleClose}
            className={styles.closeBtn}
            aria-label="Cerrar"
          >
            <X size={20} />
          </Button>
        )}
      </Card.Header>

      <Card.Body className={styles.body}>
        {/* Estado de éxito */}
        {showSuccess && (
          <Alert variant="success" className={styles.successAlert}>
            <CheckCircle size={20} />
            <span>
              ¡{successCount} {successCount === 1 ? 'archivo subido' : 'archivos subidos'} exitosamente!
            </span>
          </Alert>
        )}

        {/* Zona de Drop */}
        {!showSuccess && (
          <DropZone
            onFilesSelected={handleFilesSelected}
            disabled={isUploading || maxFilesReached}
            maxFiles={UPLOAD_CONSTRAINTS.MAX_SIMULTANEOUS_UPLOADS - files.length}
          />
        )}

        {/* Errores de validación */}
        {validationErrors.length > 0 && (
          <Alert
            variant="warning"
            className={styles.validationAlert}
            dismissible
            onClose={() => setValidationErrors([])}
          >
            <Alert.Heading className={styles.alertHeading}>
              Archivos no válidos
            </Alert.Heading>
            <ul className={styles.errorList}>
              {validationErrors.map((err, idx) => (
                <li key={idx}>
                  <strong>{err.fileName}:</strong> {err.message}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Lista de archivos */}
        {hasFiles && !showSuccess && (
          <FileList
            files={files}
            onRemove={removeFile}
            onCancel={cancelUpload}
            onRetry={retryUpload}
          />
        )}

        {/* Barra de progreso total */}
        {isUploading && (
          <div className={styles.totalProgress}>
            <div className={styles.progressLabel}>
              <span>Progreso total</span>
              <span>{totalProgress}%</span>
            </div>
            <ProgressBar
              now={totalProgress}
              variant="primary"
              animated
              className={styles.totalProgressBar}
            />
          </div>
        )}
      </Card.Body>

      {/* Footer */}
      {!showSuccess && (
        <Card.Footer className={styles.footer}>
          <div className={styles.stats}>
            {pendingCount > 0 && (
              <span className={styles.statPending}>
                {pendingCount} {pendingCount === 1 ? 'pendiente' : 'pendientes'}
              </span>
            )}
            {successCount > 0 && (
              <span className={styles.statSuccess}>
                {successCount} {successCount === 1 ? 'completado' : 'completados'}
              </span>
            )}
            {errorCount > 0 && (
              <span className={styles.statError}>
                {errorCount} {errorCount === 1 ? 'fallido' : 'fallidos'}
              </span>
            )}
          </div>

          <div className={styles.actions}>
            {successCount > 0 && !isUploading && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearCompleted}
              >
                Limpiar completados
              </Button>
            )}

            {isUploading ? (
              <Button variant="danger" onClick={cancelAll}>
                Cancelar todo
              </Button>
            ) : (
              <>
                {hasFiles && (
                  <Button
                    variant="outline-secondary"
                    onClick={reset}
                  >
                    Limpiar
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={!canUpload}
                >
                  {pendingCount > 0 ? `Subir (${pendingCount})` : 'Subir'}
                </Button>
              </>
            )}
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default FileUploader;
