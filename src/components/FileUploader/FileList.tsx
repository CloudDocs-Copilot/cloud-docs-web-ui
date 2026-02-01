/**
 * Lista de archivos en cola de subida
 * @module FileList
 */

import React from 'react';
import type { UploadFile } from '../../types/upload.types';
import { FileItem } from './FileItem';
import styles from './FileUploader.module.css';

interface FileListProps {
  /** Lista de archivos a mostrar */
  files: UploadFile[];
  /** Callback para remover un archivo */
  onRemove: (fileId: string) => void;
  /** Callback para cancelar una subida */
  onCancel: (fileId: string) => void;
  /** Callback para reintentar una subida */
  onRetry: (fileId: string) => void;
}

/**
 * Componente que muestra la lista de archivos en la cola de subida
 */
export const FileList: React.FC<FileListProps> = ({
  files,
  onRemove,
  onCancel,
  onRetry,
}) => {
  if (files.length === 0) {
    return null;
  }

  return (
    <div className={styles.fileList} role="list" aria-label="Lista de archivos para subir">
      {files.map((file) => (
        <FileItem
          key={file.id}
          file={file}
          onRemove={onRemove}
          onCancel={onCancel}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
};

export default FileList;
