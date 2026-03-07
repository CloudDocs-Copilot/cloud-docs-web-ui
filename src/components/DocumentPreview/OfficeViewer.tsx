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
 * - Word: Convierte a HTML en backend y renderiza
 * - Excel: Usa componente especializado ExcelPreview
 * - PowerPoint: Descarga segura (sin conversión servidor, mantiene privacidad)
 */
export const OfficeViewer: React.FC<OfficeViewerProps> = ({ url, filename, onBack, fileSize }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [excelFile, setExcelFile] = useState<File | Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);

  // Detectar tipo de archivo
  const isPowerPoint = filename.toLowerCase().endsWith('.ppt') || filename.toLowerCase().endsWith('.pptx');
  const isExcel = filename.toLowerCase().endsWith('.xlsx') || filename.toLowerCase().endsWith('.xls');
  const isOldWord = filename.toLowerCase().endsWith('.doc'); // Word antiguo (.doc) - no soporta conversión

  useEffect(() => {
    // PowerPoint: no cargar contenido, solo mostrar interfaz de descarga
    if (isPowerPoint) {
      setLoading(false);
      return;
    }

    // Word antiguo (.doc): no intentar cargar, evitar loop infinito
    if (isOldWord) {
      setLoading(false);
      return;
    }

    // Excel: cargar como blob
    if (isExcel) {
      const fetchExcel = async () => {
        try {
          setLoading(true);
          const response = await fetch(url, { credentials: 'include' });
          if (!response.ok) throw new Error(`Failed to load Excel: ${response.statusText}`);
          const blob = await response.blob();
          setExcelFile(blob);
        } catch (err) {
          console.error('[OfficeViewer] Error loading Excel:', err);
          setError(err instanceof Error ? err.message : 'Failed to load Excel');
        } finally {
          setLoading(false);
        }
      };
      fetchExcel();
      return;
    }

    // Word: cargar HTML convertido
    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Fallo al cargar el documento: ${response.statusText}`);
        }

        const html = await response.text();
        setHtmlContent(html);
      } catch (err) {
        console.error('[OfficeViewer] Error loading document:', err);
        setError(err instanceof Error ? err.message : 'Fallo al cargar el documento');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [url, filename, isPowerPoint, isExcel, isOldWord]);

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

  // PowerPoint: Interfaz de descarga segura (no requiere instalación de LibreOffice)
  if (isPowerPoint && !loading) {
    return (
      <div className={styles.viewerContainer}>
        <PreviewHeader
          filename={filename}
          fileSize={fileSize}
          fileInfo={formattedFileSize}
          onBack={onBack}
        />
        
        <div className={styles.documentContainer}>
          <div className={styles.powerPointContainer}>
            <div className={styles.powerPointIcon}>
              <i className="bi bi-file-earmark-ppt" style={{ fontSize: '4rem', color: '#D24726' }}></i>
            </div>
            
            <h4 className="mt-3">{filename}</h4>
            {fileSize && <p className="text-muted">{formattedFileSize}</p>}
            
            <Alert variant="info" className="mt-4 text-start">
              <Alert.Heading>
                <i className="bi bi-shield-check me-2"></i>
                Visualización Segura de PowerPoint
              </Alert.Heading>
              <p>
                Para proteger la <strong>confidencialidad de tus documentos</strong>, 
                no enviamos presentaciones a servicios externos de terceros ni requerimos software adicional en el servidor.
              </p>
              <p className="mb-0">
                Descarga el archivo para visualizarlo de forma segura en tu dispositivo con:
              </p>
              <ul className="mt-2">
                <li><strong>Microsoft PowerPoint</strong> (Windows/Mac)</li>
                <li><strong>Google Slides</strong> (Web/Gratis - sube el archivo)</li>
                <li><strong>LibreOffice Impress</strong> (Gratis/Open Source)</li>
                <li><strong>Apple Keynote</strong> (Mac/iOS)</li>
              </ul>
            </Alert>
            
            <Button 
              variant="primary" 
              size="lg" 
              className="mt-3"
              onClick={() => window.open(url.replace('/preview/', '/download/'), '_blank')}
            >
              <i className="bi bi-download me-2"></i>
              Descargar Presentación
            </Button>
            
            <p className="text-muted mt-3" style={{ fontSize: '0.875rem' }}>
              <i className="bi bi-lock-fill me-1"></i>
              Tus documentos permanecen en tu infraestructura. Nunca compartimos datos con terceros.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Word antiguo (.doc): Interfaz de descarga (evitar loop infinito)
  if (isOldWord && !loading) {
    return (
      <div className={styles.viewerContainer}>
        <PreviewHeader
          filename={filename}
          fileSize={fileSize}
          fileInfo={formattedFileSize}
          onBack={onBack}
        />
        
        <div className={styles.documentContainer}>
          <div className={styles.powerPointContainer}>
            <div className={styles.powerPointIcon}>
              <i className="bi bi-file-earmark-word" style={{ fontSize: '4rem', color: '#2B579A' }}></i>
            </div>
            
            <h4 className="mt-3">{filename}</h4>
            {fileSize && <p className="text-muted">{formattedFileSize}</p>}
            
            <Alert variant="info" className="mt-4 text-start">
              <Alert.Heading>
                <i className="bi bi-info-circle me-2"></i>
                Formato Word Antiguo (.doc)
              </Alert.Heading>
              <p>
                Los archivos <strong>.doc</strong> (Word 97-2003) requieren conversión especial. 
                Por el momento, descarga el archivo para visualizarlo.
              </p>
              <p className="mb-0">
                Puedes abrir este archivo con:
              </p>
              <ul className="mt-2">
                <li><strong>Microsoft Word</strong> (Windows/Mac)</li>
                <li><strong>Google Docs</strong> (Web/Gratis - sube el archivo)</li>
                <li><strong>LibreOffice Writer</strong> (Gratis/Open Source)</li>
                <li><strong>Pages</strong> (Mac/iOS)</li>
              </ul>
              <p className="mt-2 mb-0">
                <small className="text-muted">
                  <i className="bi bi-lightbulb me-1"></i>
                  <strong>Sugerencia:</strong> Considera convertir el archivo a formato .docx para mejor compatibilidad.
                </small>
              </p>
            </Alert>
            
            <Button 
              variant="primary" 
              size="lg" 
              className="mt-3"
              onClick={() => window.open(url.replace('/preview/', '/download/'), '_blank')}
            >
              <i className="bi bi-download me-2"></i>
              Descargar Documento
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
