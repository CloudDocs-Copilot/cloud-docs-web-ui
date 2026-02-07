import React from 'react';
import { Button } from 'react-bootstrap';
import { previewService } from '../../services/preview.service';
import styles from './PreviewHeader.module.css';

interface PreviewHeaderProps {
  filename: string;
  fileSize?: number;
  fileInfo?: string;
  onBack?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  children?: React.ReactNode;
}

/**
 * Header reutilizable para todos los viewers de documentos
 */
export const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  filename,
  fileSize,
  fileInfo,
  onBack,
  onDownload,
  onShare,
  children
}) => {
  const formattedFileSize = fileSize ? previewService.formatFileSize(fileSize) : '';
  const displayInfo = fileInfo || formattedFileSize;

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        {onBack && (
          <Button
            variant="link"
            className={styles.backButton}
            onClick={onBack}
          >
            <i className="bi bi-arrow-left"></i>
          </Button>
        )}
        <div className={styles.fileInfo}>
          <div className={styles.filename}>{filename}</div>
          {displayInfo && (
            <>
              <span className={styles.separator}>•</span>
              <div className={styles.fileDetails}>{displayInfo}</div>
            </>
          )}
        </div>
      </div>

      <div className={styles.headerControls}>
        {children}
        
        {onDownload && (
          <Button
            variant="link"
            className={styles.iconButton}
            onClick={onDownload}
            title="Descargar"
          >
            <i className="bi bi-download"></i>
          </Button>
        )}

        {onShare && (
          <Button
            variant="link"
            className={styles.iconButton}
            onClick={onShare}
            title="Compartir"
          >
            <i className="bi bi-share"></i>
          </Button>
        )}
      </div>
    </div>
  );
};
