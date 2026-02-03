import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button, Spinner, Alert } from 'react-bootstrap';
import type { PDFViewerProps } from '../../types/preview.types';
import styles from './PDFViewer.module.css';

// Configurar worker de PDF.js usando el paquete npm
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Componente para visualizar documentos PDF con navegación de páginas
 */
export const PDFViewer: React.FC<PDFViewerProps> = ({ url, filename }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

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
   * Navegar a la página anterior
   */
  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  /**
   * Navegar a la página siguiente
   */
  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
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

  /**
   * Resetear zoom
   */
  const resetZoom = () => {
    setScale(1.0);
  };

  return (
    <div className={styles.pdfViewer}>
      {/* Toolbar de controles */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
          >
            <i className="bi bi-chevron-left"></i> Previous
          </Button>
          
          <span className={styles.pageInfo}>
            Page {pageNumber} of {numPages || '...'}
          </span>
          
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
          >
            Next <i className="bi bi-chevron-right"></i>
          </Button>
        </div>

        <div className={styles.toolbarGroup}>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            <i className="bi bi-zoom-out"></i>
          </Button>
          
          <span className={styles.zoomLevel}>
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={zoomIn}
            disabled={scale >= 3.0}
          >
            <i className="bi bi-zoom-in"></i>
          </Button>
          
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={resetZoom}
          >
            Reset
          </Button>
        </div>
      </div>

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

      {/* Footer con información del documento */}
      <div className={styles.footer}>
        <small className="text-muted">{filename}</small>
      </div>
    </div>
  );
};
