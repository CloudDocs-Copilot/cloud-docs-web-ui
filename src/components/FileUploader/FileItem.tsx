/**
 * Item individual de archivo con barra de progreso
 * @module FileItem
 */

import React from 'react';
import { ProgressBar, Button } from 'react-bootstrap';
import { X, RotateCcw, Trash2, CheckCircle, AlertCircle, Clock, Loader } from 'lucide-react';
import type { UploadFile } from '../../types/upload.types';
import { formatFileSize, getFileTypeName } from '../../types/upload.types';
import styles from './FileUploader.module.css';

interface FileItemProps {
  /** Archivo a mostrar */
  file: UploadFile;
  /** Callback para remover el archivo */
  onRemove: (fileId: string) => void;
  /** Callback para cancelar la subida */
  onCancel: (fileId: string) => void;
  /** Callback para reintentar la subida */
  onRetry: (fileId: string) => void;
}

/**
 * Componente que muestra un archivo individual con su estado y progreso
 */
export const FileItem: React.FC<FileItemProps> = ({
  file,
  onRemove,
  onCancel,
  onRetry,
}) => {
  /**
   * Obtiene la variante de color para la barra de progreso
   */
  const getProgressVariant = (): 'primary' | 'success' | 'danger' | 'warning' | 'secondary' => {
    switch (file.status) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'uploading':
        return 'primary';
      case 'cancelled':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  /**
   * Obtiene el texto de estado
   */
  const getStatusText = (): string => {
    switch (file.status) {
      case 'pending':
        return 'Pendiente';
      case 'validating':
        return 'Validando...';
      case 'uploading':
        return `Subiendo ${file.progress}%`;
      case 'success':
        return 'Completado';
      case 'error':
        return file.error?.message || 'Error';
      case 'cancelled':
        return 'Cancelado';
      default:
        return '';
    }
  };

  /**
   * Obtiene el icono de estado
   */
  const getStatusIcon = () => {
    switch (file.status) {
      case 'pending':
        return <Clock size={16} className={styles.statusIconPending} />;
      case 'uploading':
        return <Loader size={16} className={`${styles.statusIconUploading} ${styles.spinning}`} />;
      case 'success':
        return <CheckCircle size={16} className={styles.statusIconSuccess} />;
      case 'error':
        return <AlertCircle size={16} className={styles.statusIconError} />;
      case 'cancelled':
        return <AlertCircle size={16} className={styles.statusIconCancelled} />;
      default:
        return null;
    }
  };

  const fileTypeName = getFileTypeName(file.file.type);

  return (
    <div className={`${styles.fileItem} ${styles[`fileItem${file.status.charAt(0).toUpperCase() + file.status.slice(1)}`]}`}>
      <div className={styles.fileItemMain}>
        {/* Info del archivo */}
        <div className={styles.fileInfo}>
          <span className={styles.fileName} title={file.file.name}>
            {file.file.name}
          </span>
          <span className={styles.fileMeta}>
            {fileTypeName} • {formatFileSize(file.file.size)}
          </span>
        </div>

        {/* Acciones */}
        <div className={styles.fileActions}>
          {/* Cancelar durante subida */}
          {file.status === 'uploading' && (
            <Button
              variant="link"
              size="sm"
              onClick={() => onCancel(file.id)}
              title="Cancelar subida"
              className={styles.actionBtn}
              aria-label="Cancelar subida"
            >
              <X size={18} />
            </Button>
          )}

          {/* Reintentar en error o cancelado */}
          {(file.status === 'error' || file.status === 'cancelled') && (
            <Button
              variant="link"
              size="sm"
              onClick={() => onRetry(file.id)}
              title="Reintentar"
              className={styles.actionBtn}
              aria-label="Reintentar subida"
            >
              <RotateCcw size={18} />
            </Button>
          )}

          {/* Eliminar en cualquier estado excepto uploading */}
          {file.status !== 'uploading' && (
            <Button
              variant="link"
              size="sm"
              onClick={() => onRemove(file.id)}
              title="Eliminar"
              className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
              aria-label="Eliminar archivo de la lista"
            >
              <Trash2 size={18} />
            </Button>
          )}
        </div>
      </div>

      {/* Barra de progreso o estado */}
      <div className={styles.fileStatus}>
        {file.status === 'uploading' ? (
          <ProgressBar
            now={file.progress}
            variant={getProgressVariant()}
            className={styles.progressBar}
            animated
            aria-label={`Progreso de subida: ${file.progress}%`}
          />
        ) : (
          <div className={`${styles.statusBadge} ${styles[`status${file.status.charAt(0).toUpperCase() + file.status.slice(1)}`]}`}>
            {getStatusIcon()}
            <span className={styles.statusText}>{getStatusText()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileItem;
