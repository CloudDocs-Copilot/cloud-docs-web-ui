import { Modal, Button } from 'react-bootstrap';
import styles from './ImageUploadModal.module.css';

interface ImageUploadModalProps {
  show: boolean;
  imagePreview: string | null;
  onCancel: () => void;
  onSave: () => void;
}

export function ImageUploadModal({ 
  show, 
  imagePreview, 
  onCancel, 
  onSave 
}: ImageUploadModalProps) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      {/* Header con gradiente */}
      <Modal.Header 
        closeButton 
        className={`border-0 ${styles.modalHeader}`}
      >
        <Modal.Title className="fw-semibold">Vista Previa de Imagen</Modal.Title>
      </Modal.Header>

      {/* Preview de la imagen */}
      <Modal.Body className="p-4">
        <div className={styles.previewWrapper}>
          <div className={styles.previewContainer}>
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="Preview" 
                className={styles.previewImage}
              />
            ) : (
              <div className={styles.placeholderContainer}>
                <i className={`bi bi-person-fill text-muted ${styles.placeholderIcon}`}></i>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-muted small mb-0">
          ¿Te gusta cómo se ve tu foto de perfil?
        </p>
      </Modal.Body>

      {/* Botones de acción */}
      <Modal.Footer className="border-0 px-4 pb-4">
        <Button 
          variant="outline-secondary" 
          onClick={onCancel}
          className="flex-fill"
        >
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={onSave}
          className={`flex-fill ${styles.saveButton}`}
        >
          <i className="bi bi-check-circle me-2"></i>
          Guardar imagen
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
