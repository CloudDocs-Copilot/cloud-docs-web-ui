import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button, Spinner, Alert } from 'react-bootstrap';
import type { TextViewerProps } from '../../types/preview.types';
import { previewService } from '../../services/preview.service';
import { PreviewHeader } from './PreviewHeader';
import styles from './TextViewer.module.css';

/**
 * Componente para visualizar archivos de texto con syntax highlighting
 */
export const TextViewer: React.FC<TextViewerProps> = ({ url, filename, mimeType, language, onBack, fileSize }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lineNumbers, setLineNumbers] = useState<boolean>(true);
  const [wrapLines, setWrapLines] = useState<boolean>(false);

  // Detectar lenguaje automáticamente si no se proporciona
  const detectedLanguage = language || previewService.getCodeLanguage(filename);
  const isCodeFile = detectedLanguage !== 'text' && detectedLanguage !== 'plain';

  /**
   * Cargar contenido del archivo
   */
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(url, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch file content');
        }

        const text = await response.text();
        setContent(text);
      } catch (err) {
        console.error('Error loading text file:', err);
        setError(err instanceof Error ? err.message : 'Failed to load file');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [url]);

  /**
   * Alternar números de línea
   */
  const toggleLineNumbers = () => {
    setLineNumbers(!lineNumbers);
  };

  /**
   * Alternar ajuste de líneas
   */
  const toggleWrapLines = () => {
    setWrapLines(!wrapLines);
  };

  /**
   * Copiar contenido al portapapeles
   */
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      // Podría mostrar un toast de éxito aquí
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  /**
   * Descargar archivo
   */
  const downloadFile = () => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.textViewer}>
      {/* Header */}
      <PreviewHeader
        filename={filename}
        fileSize={fileSize}
        fileInfo={content ? `${content.split('\n').length} líneas` : ''}
        onBack={onBack}
        onDownload={downloadFile}
      >
        {isCodeFile && (
          <>
            <Button
              variant="link"
              className={styles.iconButton}
              onClick={toggleLineNumbers}
              title={lineNumbers ? 'Ocultar números de línea' : 'Mostrar números de línea'}
            >
              <i className="bi bi-list-ol"></i>
            </Button>

            <Button
              variant="link"
              className={styles.iconButton}
              onClick={toggleWrapLines}
              title={wrapLines ? 'Desactivar ajuste de líneas' : 'Activar ajuste de líneas'}
            >
              <i className="bi bi-text-wrap"></i>
            </Button>
          </>
        )}

        <Button
          variant="link"
          className={styles.iconButton}
          onClick={copyToClipboard}
          disabled={loading || !!error}
          title="Copiar al portapapeles"
        >
          <i className="bi bi-clipboard"></i>
        </Button>
      </PreviewHeader>

      {/* Content Area */}
      <div className={styles.contentContainer}>
        {loading && (
          <div className={styles.loadingState}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading file...</span>
            </Spinner>
            <p className="mt-3">Loading file content...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="m-3">
            <Alert.Heading>Error Loading File</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        {!loading && !error && content && (
          <>
            {isCodeFile ? (
              <SyntaxHighlighter
                language={detectedLanguage}
                style={vscDarkPlus}
                showLineNumbers={lineNumbers}
                wrapLines={wrapLines}
                wrapLongLines={wrapLines}
                customStyle={{
                  margin: 0,
                  borderRadius: 0,
                  fontSize: '0.875rem',
                  height: '100%'
                }}
                className={styles.codeBlock}
              >
                {content}
              </SyntaxHighlighter>
            ) : (
              <pre className={styles.plainText}>{content}</pre>
            )}
          </>
        )}
      </div>
    </div>
  );
};
