import { Toast, ToastContainer } from 'react-bootstrap';
import styles from './NotificationToast.module.css';

interface NotificationToastProps {
  show: boolean;
  onClose: () => void;
  message: string;
  variant?: 'success' | 'danger' | 'warning' | 'info';
  title?: string;
}

export function NotificationToast({ 
  show, 
  onClose, 
  message, 
  variant = 'success',
  title
}: NotificationToastProps) {
  // Solo definimos estilos para success y danger por ahora
  // Ajustando a la estética de la imagen: fondos claros y bordes de acento
  const toastClass = variant === 'success' ? styles.toastSuccess : 
                     variant === 'danger' ? styles.toastDanger : '';
  
  const titleClass = variant === 'success' ? styles.successTitle : 
                     variant === 'danger' ? styles.dangerTitle : '';

  const getIcon = () => {
    switch (variant) {
      case 'success': return 'bi-check-circle-fill';
      case 'danger': return 'bi-exclamation-circle-fill';
      default: return 'bi-info-circle-fill';
    }
  };

  // choose appropriate live region and role based on severity
  const live = variant === 'danger' ? 'assertive' : 'polite';
  const role = variant === 'danger' ? 'alert' : 'status';

  return (
    <div aria-live={live} aria-atomic="true">
      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050, position: 'fixed' }}>
        <Toast 
          onClose={onClose} 
          show={show} 
          delay={3000} 
          autohide 
          className={toastClass}
          role={role}
        >
          <Toast.Header closeButton={true} className={styles.toastHeader}>
             <i className={`bi ${getIcon()} ${titleClass} ${styles.icon}`}></i>
            <strong className={`me-auto ${titleClass}`}>{title || 'Notificación'}</strong>
          </Toast.Header>
          <Toast.Body className={styles.toastBody}>
            {message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}
