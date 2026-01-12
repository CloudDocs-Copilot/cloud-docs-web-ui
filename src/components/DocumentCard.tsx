import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import type { Document } from '../types/document.types';
import styles from './DocumentCard.module.css';

interface DocumentCardProps {
  document: Document;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Legal': '#fbbf24',
      'Finanzas': '#10b981',
      'Proyectos': '#a855f7',
      'Técnico': '#f97316',
      'Marketing': '#a855f7'
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
          {getFileIcon(document.type)}
        </div>
        <h6 className={styles.documentName}>{document.name}</h6>
        <Badge 
          className={styles.documentBadge} 
          style={{ backgroundColor: getCategoryColor(document.category) }}
        >
          ⭐ {document.category}
        </Badge>
        <div className={styles.documentMeta}>
          <span className={styles.documentDate}>{document.date}</span>
          <span className={styles.documentSize}>{document.size}</span>
        </div>
      </Card.Body>
    </Card>
  );
};

export default DocumentCard;
