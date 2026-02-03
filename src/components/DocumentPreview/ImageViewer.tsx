import React, { useState, useEffect } from 'react';
import { Button, Spinner, Alert } from 'react-bootstrap';
import type { ImageViewerProps } from '../../types/preview.types';
import styles from './ImageViewer.module.css';

/**
 * Componente para visualizar imágenes con zoom y controles
 */
export const ImageViewer: React.FC<ImageViewerProps> = ({ url, filename, alt }) => {
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  /**
   * Cargar imagen con autenticación
   */
  useEffect(() => {
    const loadImage = async () => {
      try {
        const response = await fetch(url, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to load image');
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setImageLoaded(true);
      } catch (err) {
        console.error('Error loading image:', err);
        setError('Failed to load image');
      }
    };

    loadImage();

    // Cleanup: revocar blob URL cuando se desmonte el componente
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [url]);

  /**
   * Aumentar zoom
   */
  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 5.0));
  };

  /**
   * Reducir zoom
   */
  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.25));
  };

  /**
   * Resetear vista
   */
  const resetView = () => {
    setScale(1.0);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  /**
   * Rotar imagen 90 grados
   */
  const rotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  /**
   * Ajustar imagen a la ventana
   */
  const fitToWindow = () => {
    setScale(1.0);
    setPosition({ x: 0, y: 0 });
  };

  /**
   * Manejo de arrastre de imagen
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className={styles.imageViewer}>
      {/* Toolbar de controles */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarGroup}>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={zoomOut}
            disabled={scale <= 0.25}
            title="Zoom Out"
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
            disabled={scale >= 5.0}
            title="Zoom In"
          >
            <i className="bi bi-zoom-in"></i>
          </Button>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={fitToWindow}
            title="Fit to Window"
          >
            <i className="bi bi-arrows-fullscreen"></i>
          </Button>
        </div>

        <div className={styles.toolbarGroup}>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={rotate}
            title="Rotate 90°"
          >
            <i className="bi bi-arrow-clockwise"></i>
          </Button>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={resetView}
            title="Reset View"
          >
            <i className="bi bi-arrow-counterclockwise"></i> Reset
          </Button>
        </div>
      </div>

      {/* Área de visualización de la imagen */}
      <div
        className={`${styles.imageContainer} ${isDragging ? styles.dragging : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {!imageLoaded && !error && (
          <div className={styles.loadingState}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading image...</span>
            </Spinner>
            <p className="mt-3">Loading image...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="m-3">
            <Alert.Heading>Error Loading Image</Alert.Heading>
            <p>{error}</p>
          </Alert>
        )}

        {blobUrl && (
          <img
            src={blobUrl}
            alt={alt || filename}
            className={styles.image}
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            draggable={false}
          />
        )}
      </div>

      {/* Footer con información */}
      <div className={styles.footer}>
        <small className="text-muted">{filename}</small>
      </div>
    </div>
  );
};
