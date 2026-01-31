/**
 * Zona de drag & drop para selección de archivos
 * @module DropZone
 */

import React, { useCallback, useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import styles from './FileUploader.module.css';
import {
  ALLOWED_EXTENSIONS,
  UPLOAD_CONSTRAINTS,
  formatFileSize,
  getAllowedTypesDisplay,
} from '../../types/upload.types';

interface DropZoneProps {
  /** Callback cuando se seleccionan archivos */
  onFilesSelected: (files: FileList | File[]) => void;
  /** Deshabilita la zona de drop */
  disabled?: boolean;
  /** Número máximo de archivos que se pueden agregar */
  maxFiles?: number;
}

/**
 * Componente de zona de arrastre para subida de archivos
 */
export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  disabled = false,
  maxFiles = UPLOAD_CONSTRAINTS.MAX_SIMULTANEOUS_UPLOADS,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [disabled, onFilesSelected]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFilesSelected(files);
      }
      // Reset input para permitir seleccionar el mismo archivo
      e.target.value = '';
    },
    [onFilesSelected]
  );

  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
        e.preventDefault();
        fileInputRef.current?.click();
      }
    },
    [disabled]
  );

  const acceptTypes = ALLOWED_EXTENSIONS.join(',');

  return (
    <div
      className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''} ${
        disabled ? styles.disabled : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label="Zona para arrastrar archivos o hacer clic para seleccionar"
      aria-disabled={disabled}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptTypes}
        onChange={handleFileInputChange}
        className={styles.hiddenInput}
        disabled={disabled}
        aria-hidden="true"
      />

      <div className={styles.dropZoneContent}>
        <div className={styles.uploadIconWrapper}>
          <Upload className={styles.uploadIcon} size={48} />
        </div>

        <p className={styles.dropZoneText}>
          {isDragOver
            ? 'Suelta los archivos aquí'
            : 'Arrastra archivos aquí o haz clic para seleccionar'}
        </p>

        <p className={styles.dropZoneHint}>
          Máximo {maxFiles} archivos • {formatFileSize(UPLOAD_CONSTRAINTS.MAX_FILE_SIZE)} por archivo
          <br />
          {getAllowedTypesDisplay()}
        </p>
      </div>
    </div>
  );
};

export default DropZone;
