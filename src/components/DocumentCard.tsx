import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import type { Document } from '../types/document.types';
import { getFileTypeFromMime, formatFileSize } from '../types/document.types';
import styles from './DocumentCard.module.css';

interface DocumentCardProps {
  document: Document;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
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

  return (
    <Card className={styles.documentCard}>
      <div className={styles.cardOptions}>
        <button className={styles.optionBtn} title="Compartir">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="16 6 12 2 8 6" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="2" x2="12" y2="15" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button className={styles.optionBtn} title="Descargar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" strokeLinecap="round"/>
            <polyline points="7 10 12 15 17 10" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        <button className={styles.optionBtn} title="Más opciones">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
      </div>
      
      <Card.Body className={styles.cardBody}>
        <div className={styles.documentIconWrapper}>
          {getFileIcon(fileType)}
        </div>
        <h6 className={styles.documentName}>{document.originalname || document.filename}</h6>
        <Badge 
          className={styles.documentBadge} 
          style={{ backgroundColor: getCategoryColor(folderName) }}
        >
          ⭐ {folderName}
        </Badge>
        <div className={styles.documentMeta}>
          <span className={styles.documentDate}>{formatDate(document.uploadedAt)}</span>
          <span className={styles.documentSize}>{formatFileSize(document.size)}</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default DocumentCard;
