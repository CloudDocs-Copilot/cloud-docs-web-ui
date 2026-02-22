import React, { useState, useEffect } from 'react';
import { Alert, Spinner, Button } from 'react-bootstrap';
import { PreviewHeader } from './PreviewHeader';
import { previewService } from '../../services/preview.service';
import { ExcelPreview } from './ExcelPreview';
import styles from './OfficeViewer.module.css';

interface OfficeViewerProps {
  url: string;
  filename: string;
  mimeType?: string;
  onBack?: () => void;
  fileSize?: number;
}

/**
 * Visor de documentos Office (Word, Excel, PowerPoint)
 * Carga el HTML convertido desde el backend y lo renderiza de forma segura
 */
export const OfficeViewer: React.FC<OfficeViewerProps> = ({ url, filename, onBack, fileSize }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [excelFile, setExcelFile] = useState<File | Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);

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
    // Detect Excel
    if (filename.endsWith('.xlsx')) {
      const fetchExcel = async () => {
        const response = await fetch(url, { credentials: 'include' });
        if (!response.ok) throw new Error(`Failed to load Excel: ${response.statusText}`);
        const blob = await response.blob();
        setExcelFile(blob);
        setLoading(false);
      };
      fetchExcel();
      return;
    }
  }, [url, filename]);

  /**
   * Aumentar zoom
   */
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  };

  /**
   * Reducir zoom
   */
  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  };

  const formattedFileSize = fileSize ? previewService.formatFileSize(fileSize) : '';

    // Render Excel preview
    if (excelFile) {
      return (
        <div className={styles.viewerContainer}>
          <PreviewHeader filename={filename} fileSize={fileSize} onBack={onBack} />
          <ExcelPreview file={excelFile} />
        </div>
      );
    }
  return (
    <div className={styles.viewerContainer}>
      <PreviewHeader
        filename={filename}
        fileSize={fileSize}
        fileInfo={formattedFileSize}
        onBack={onBack}
        onDownload={() => window.open(url, '_blank')}
      >
        <Button
          variant="link"
          className={styles.zoomButton}
          onClick={zoomOut}
          disabled={scale <= 0.5}
          title="Reducir zoom"
        >
          <i className="bi bi-dash"></i>
        </Button>
        
        <span className={styles.zoomLevel}>
          {Math.round(scale * 100)}%
        </span>
        
        <Button
          variant="link"
          className={styles.zoomButton}
          onClick={zoomIn}
          disabled={scale >= 3.0}
          title="Aumentar zoom"
        >
          <i className="bi bi-plus"></i>
        </Button>
      </PreviewHeader>
      
      <div className={styles.documentContainer}>
        {loading && (
          <div className={styles.loadingState}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading document...</span>
            </Spinner>
            <p className="mt-3">Loading document...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="m-3">
            <Alert.Heading>Error Loading Document</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        {!loading && !error && (
          <div 
            className={styles.contentContainer}
            style={{ 
              transform: `scale(${scale})`,
              transformOrigin: 'top center'
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </div>
    </div>
  );
};

export default OfficeViewer;
