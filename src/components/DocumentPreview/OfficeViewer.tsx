import React, { useState, useEffect } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { apiClient } from '../../api/httpClient.config';
import styles from './OfficeViewer.module.css';

interface OfficeViewerProps {
  url: string;
  filename: string;
}

/**
 * Visor de documentos Office (Word, Excel, PowerPoint)
 * Carga el HTML convertido desde el backend y lo renderiza de forma segura
 */
export const OfficeViewer: React.FC<OfficeViewerProps> = ({ url, filename }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        // Hacer fetch del HTML convertido
        const response = await fetch(url, {
          credentials: 'include', // Incluir cookies de autenticación
        });

        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.statusText}`);
        }

        const html = await response.text();
        setHtmlContent(html);
      } catch (err) {
        console.error('[OfficeViewer] Error loading document:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [url]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading document...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-4">
        <Alert.Heading>
          <i className="bi bi-exclamation-triangle"></i> Error Loading Document
        </Alert.Heading>
        <p>{error}</p>
        <hr />
        <a href={url} download className="btn btn-primary">
          <i className="bi bi-download"></i> Download Original File
        </a>
      </Alert>
    );
  }

  return (
    <div className={styles.viewerContainer}>
      <div className={styles.toolbar}>
        <span className="text-muted">
          <i className="bi bi-file-earmark-word"></i> {filename}
        </span>
        <a
          className="btn btn-sm btn-outline-primary"
          href={url}
          download
        >
          <i className="bi bi-download"></i> Download
        </a>
      </div>
      <div 
        className={styles.contentContainer}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
};

export default OfficeViewer;
