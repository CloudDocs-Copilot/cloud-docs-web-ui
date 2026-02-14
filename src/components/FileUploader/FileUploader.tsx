/**
 * Componente principal de subida de archivos
 * @module FileUploader
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, ProgressBar, Spinner } from 'react-bootstrap';
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
  /** Custom upload handler (e.g. replace/overwrite) */
  uploadHandler?: (files: File[]) => Promise<Document[]>;
  /** Allow selecting multiple files (default true for normal upload, false recommended for replace) */
  allowMultiple?: boolean;
  /** Optional title override */
  title?: string;
}

/**
 * Componente completo para subida de archivos con drag & drop
 */
export const FileUploader: React.FC<FileUploaderProps> = ({
  folderId,
  onUploadSuccess,
  onClose,
  uploadHandler,
  allowMultiple = true,
  title,
}) => {
  const [validationErrors, setValidationErrors] = useState<
    Array<{ fileName: string; message: string }>
  >([]);
  const [showSuccess, setShowSuccess] = useState(false);

  const [customFiles, setCustomFiles] = useState<File[]>([]);
  const [customUploading, setCustomUploading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const isCustomMode = typeof uploadHandler === 'function';

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
    if (isCustomMode) {
      const list = Array.isArray(selectedFiles) ? selectedFiles : Array.from(selectedFiles);
      setCustomError(null);

      if (!allowMultiple && list.length > 1) {
        setValidationErrors([
          { fileName: list[0].name, message: 'Solo puedes seleccionar un archivo.' },
        ]);
        setCustomFiles([list[0]]);
        return;
      }

      if (!allowMultiple && list.length === 1) {
        setCustomFiles([list[0]]);
        return;
      }

      setCustomFiles(list);
      return;
    }

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

    if (isCustomMode) {
      if (!customFiles.length || customUploading) return;
      setCustomUploading(true);
      setCustomError(null);

      try {
        const docs = await uploadHandler!(customFiles);
        setShowSuccess(true);

        setTimeout(() => {
          onUploadSuccess?.(docs);
          onClose?.();
        }, UPLOAD_CONSTRAINTS.SUCCESS_CLOSE_DELAY_MS);
      } catch (e: any) {
        setCustomError(e?.message || 'Error al subir el archivo');
      } finally {
        setCustomUploading(false);
      }
      return;
    }

    await uploadAll();
  };

  /**
   * Maneja el cierre del uploader
   */
  const handleClose = () => {
    if (isCustomMode) {
      setCustomFiles([]);
      setCustomError(null);
      setCustomUploading(false);
      setShowSuccess(false);
      setValidationErrors([]);
      onClose?.();
      return;
    }

    if (isUploading) {
      cancelAll();
    }
    reset();
    onClose?.();
  };

  const hasFiles = isCustomMode ? customFiles.length > 0 : files.length > 0;
  const canUpload = isCustomMode
    ? customFiles.length > 0 && !customUploading
    : pendingCount > 0 && !isUploading;

  const maxFilesReached = isCustomMode
    ? (!allowMultiple && customFiles.length >= 1)
    : files.length >= UPLOAD_CONSTRAINTS.MAX_SIMULTANEOUS_UPLOADS;

  const effectiveTitle = title || (isCustomMode ? 'Reemplazar Documento' : 'Subir Documentos');

  const handleCustomRemove = (idx: number) => {
    setCustomFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCustomReset = () => {
    setCustomFiles([]);
    setCustomError(null);
    setShowSuccess(false);
    setValidationErrors([]);
  };

  return (
    <Card className={styles.uploaderCard}>
      {/* Header */}
      <Card.Header className={styles.header}>
        <div className={styles.headerTitle}>
          <Upload size={20} />
          <h5>{effectiveTitle}</h5>
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
              ¡{isCustomMode ? 'Archivo reemplazado' : `${successCount} ${successCount === 1 ? 'archivo subido' : 'archivos subidos'}`} exitosamente!
            </span>
          </Alert>
        )}

        {/* Zona de Drop */}
        {!showSuccess && (
          <DropZone
            onFilesSelected={handleFilesSelected}
            disabled={(isCustomMode ? customUploading : isUploading) || maxFilesReached}
            maxFiles={
              isCustomMode
                ? (allowMultiple ? UPLOAD_CONSTRAINTS.MAX_SIMULTANEOUS_UPLOADS : 1) - customFiles.length
                : UPLOAD_CONSTRAINTS.MAX_SIMULTANEOUS_UPLOADS - files.length
            }
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

        {customError && (
          <Alert variant="danger" className={styles.validationAlert} dismissible onClose={() => setCustomError(null)}>
            {customError}
          </Alert>
        )}

        {/* Lista de archivos */}
        {hasFiles && !showSuccess && !isCustomMode && (
          <FileList
            files={files}
            onRemove={removeFile}
            onCancel={cancelUpload}
            onRetry={retryUpload}
          />
        )}

        {hasFiles && !showSuccess && isCustomMode && (
          <div>
            <ul className={styles.errorList} style={{ marginBottom: 0 }}>
              {customFiles.map((f, idx) => (
                <li key={`${f.name}-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <span>{f.name}</span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => handleCustomRemove(idx)}
                    disabled={customUploading}
                    style={{ padding: 0 }}
                  >
                    <X size={16} />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {isUploading && !isCustomMode && (
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

        {customUploading && isCustomMode && (
          <div className={styles.totalProgress}>
            <div className={styles.center}>
              <Spinner animation="border" size="sm" />
              <span className={styles.centerText}>Reemplazando archivo...</span>
            </div>
          </div>
        )}
      </Card.Body>

      {/* Footer */}
      {!showSuccess && (
        <Card.Footer className={styles.footer}>
          <div className={styles.stats}>
            {!isCustomMode && pendingCount > 0 && (
              <span className={styles.statPending}>
                {pendingCount} {pendingCount === 1 ? 'pendiente' : 'pendientes'}
              </span>
            )}
            {!isCustomMode && successCount > 0 && (
              <span className={styles.statSuccess}>
                {successCount} {successCount === 1 ? 'completado' : 'completados'}
              </span>
            )}
            {!isCustomMode && errorCount > 0 && (
              <span className={styles.statError}>
                {errorCount} {errorCount === 1 ? 'fallido' : 'fallidos'}
              </span>
            )}
          </div>

          <div className={styles.actions}>
            {!isCustomMode && successCount > 0 && !isUploading && (
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={clearCompleted}
              >
                Limpiar completados
              </Button>
            )}

            {isCustomMode ? (
              <>
                {hasFiles && (
                  <Button
                    variant="outline-secondary"
                    onClick={handleCustomReset}
                    disabled={customUploading}
                  >
                    Limpiar
                  </Button>
                )}
                <Button
                  variant="primary"
                  onClick={handleUpload}
                  disabled={!canUpload}
                >
                  Reemplazar
                </Button>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default FileUploader;
