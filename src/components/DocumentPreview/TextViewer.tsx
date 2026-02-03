import React, { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button, Spinner, Alert } from 'react-bootstrap';
import type { TextViewerProps } from '../../types/preview.types';
import { previewService } from '../../services/preview.service';
import styles from './TextViewer.module.css';

/**
 * Componente para visualizar archivos de texto con syntax highlighting
 */
export const TextViewer: React.FC<TextViewerProps> = ({ url, filename, mimeType, language }) => {
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
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <span className={styles.fileInfo}>
            <i className="bi bi-file-text"></i>
            {isCodeFile && (
              <span className={styles.languageBadge}>{detectedLanguage}</span>
            )}
          </span>
        </div>

        <div className={styles.toolbarGroup}>
          {isCodeFile && (
            <>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={toggleLineNumbers}
                active={lineNumbers}
              >
                <i className="bi bi-list-ol"></i> Line Numbers
              </Button>

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={toggleWrapLines}
                active={wrapLines}
              >
                <i className="bi bi-text-wrap"></i> Wrap
              </Button>
            </>
          )}

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={copyToClipboard}
            disabled={loading || !!error}
          >
            <i className="bi bi-clipboard"></i> Copy
          </Button>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={downloadFile}
            disabled={loading || !!error}
          >
            <i className="bi bi-download"></i> Download
          </Button>
        </div>
      </div>

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

      {/* Footer */}
      <div className={styles.footer}>
        <small className="text-muted">
          {filename} • {content.split('\n').length} lines
        </small>
      </div>
    </div>
  );
};
