import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Spinner, Alert } from 'react-bootstrap';
import type { PDFViewerProps } from '../../types/preview.types';
import { previewService } from '../../services/preview.service';
import { PreviewHeader } from './PreviewHeader';
import styles from './PDFViewer.module.css';

// Configurar worker de PDF.js usando el paquete npm
try {
  // Use a public CDN worker to avoid `import.meta.url` parsing issues
  // during tests/coverage collection where TS may use CommonJS.
  pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js';
} catch (e) {
  // Best-effort: ignore if setting the worker fails in some envs
}

/**
 * Componente para visualizar documentos PDF con navegación de páginas
 */
export const PDFViewer: React.FC<PDFViewerProps> = ({ url, filename, onBack, fileSize }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  
  // Por ahora solo mostramos la primera página
  const pageNumber = 1;

  /**
   * Cargar PDF con autenticación
   */
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[PDFViewer] Loading PDF from URL:', url);
        
        // Usar credentials: 'include' para enviar cookies de autenticación
        const response = await fetch(url, {
          credentials: 'include'
        });

        console.log('[PDFViewer] Response status:', response.status);
        console.log('[PDFViewer] Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[PDFViewer] Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        console.log('[PDFViewer] Blob created, size:', blob.size, 'type:', blob.type);
        
        // Verificar que es realmente un PDF
        if (!blob.type.includes('pdf')) {
          console.error('[PDFViewer] Invalid blob type:', blob.type);
          throw new Error(`Expected PDF but got ${blob.type}`);
        }
        
        const objectUrl = URL.createObjectURL(blob);
        console.log('[PDFViewer] Object URL created:', objectUrl);
        
        setBlobUrl(objectUrl);
        // No cambiar loading aquí, se cambiará en onDocumentLoadSuccess
      } catch (err) {
        console.error('[PDFViewer] Error loading PDF:', err);
        setError(`Failed to load PDF: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };

    loadPDF();

    // Cleanup: revocar blob URL cuando se desmonte
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  /**
   * Callback cuando el PDF se carga exitosamente
   */
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  /**
   * Callback cuando hay error al cargar el PDF
   */
  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading PDF:', error);
    setError('Failed to load PDF document. Please try again.');
    setLoading(false);
  };

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
  const fileInfo = numPages 
    ? `${formattedFileSize}${formattedFileSize ? ' • ' : ''}${numPages} página${numPages !== 1 ? 's' : ''}`
    : formattedFileSize;

  return (
    <div className={styles.pdfViewer}>
      {/* Header con nombre de archivo y controles */}
      <PreviewHeader
        filename={filename}
        fileSize={fileSize}
        fileInfo={fileInfo}
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

      {/* Área de visualización del PDF */}
      <div className={styles.documentContainer}>
        {loading && (
          <div className={styles.loadingState}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading PDF...</span>
            </Spinner>
            <p className="mt-3">Loading PDF document...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="m-3">
            <Alert.Heading>Error Loading PDF</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        {blobUrl && (
          <Document
            file={blobUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={<></>} // Usamos nuestro propio loading state
            error={<></>}   // Usamos nuestro propio error state
            className={styles.pdfDocument}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              loading={
                <div className={styles.pageLoading}>
                  <Spinner animation="border" size="sm" />
                </div>
              }
              className={styles.pdfPage}
            />
          </Document>
        )}
      </div>
    </div>
  );
};
