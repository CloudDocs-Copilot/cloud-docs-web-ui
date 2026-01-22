import React from 'react';
import styles from './UploadDocumentModal.module.css';

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatSize = (bytes: number): string => {
  if (bytes === 0) {
    return '0 MB';
  }
  const sizeInMb = bytes / (1024 * 1024);
  return `${sizeInMb.toFixed(2)} MB`;
};

const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setProgress(0);
      setIsAnalyzing(false);
      setIsDragging(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen]);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setProgress(100);
    setIsAnalyzing(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  if (!isOpen) {
    return null;
  }

  const displayName = selectedFile ? selectedFile.name : 'Contrato_Comercial_2025.pdf';
  const displaySize = selectedFile ? formatSize(selectedFile.size) : '2.4 MB';
  const displayStatus = isAnalyzing ? 'IA Analizando...' : 'En espera...';
  const displayProgress = selectedFile ? progress : 0;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3 className={styles.title}>Subir Documento</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2"/>
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2"/>
            </svg>
          </button>
        </div>

        <div className={styles.body}>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dropZoneDragging : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={fileInputRef}
              className={styles.fileInput}
              type="file"
              onChange={handleChange}
              aria-label="Seleccionar documento"
            />
            <div className={styles.iconCard}>
              <div className={styles.sparkleBadge}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2l1.8 4.2L18 8l-4.2 1.8L12 14l-1.8-4.2L6 8l4.2-1.8L12 2z" strokeWidth="1.5"/>
                </svg>
              </div>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" strokeWidth="1.8"/>
                <path d="M14 3v5h5" strokeWidth="1.8"/>
                <path d="M9 13h6" strokeWidth="1.6"/>
                <path d="M9 17h6" strokeWidth="1.6"/>
              </svg>
            </div>

            <div className={styles.fileName}>{displayName}</div>
            <div className={styles.fileSize}>{displaySize}</div>

            <div className={styles.statusRow}>
              <span>{displayStatus}</span>
              <span>{displayProgress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${displayProgress}%` }} />
            </div>
          </div>

          <div className={styles.suggestions}>
            <div className={styles.suggestionsTitle}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2l1.8 4.2L18 8l-4.2 1.8L12 14l-1.8-4.2L6 8l4.2-1.8L12 2z" strokeWidth="1.5"/>
              </svg>
              Sugerencias de IA
            </div>
            <div className={styles.suggestionGrid}>
              <button className={styles.suggestionCard} type="button">
                <div className={styles.suggestionIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="1.8"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.suggestionLabel}>Carpeta sugerida</div>
                  <div className={styles.suggestionValue}>Legal</div>
                </div>
              </button>
              <button className={styles.suggestionCardAlt} type="button">
                <div className={styles.suggestionIconAlt}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.8"/>
                    <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="1.8"/>
                  </svg>
                </div>
                <div>
                  <div className={styles.suggestionLabelAlt}>Fecha detectada</div>
                  <div className={styles.suggestionValueAlt}>10/11/2025</div>
                </div>
              </button>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button className={styles.primaryAction} type="button">Aceptar sugerencias</button>
            <button className={styles.secondaryAction} type="button">Personalizar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadDocumentModal;
