import { Spinner } from 'react-bootstrap';
import styles from './Loader.module.css';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loader({ message = 'Cargando...', fullScreen = false }: LoaderProps) {
  if (fullScreen) {
    return (
      <div className={styles.fullScreenOverlay}>
        <div className={styles.loaderContent}>
          <Spinner animation="border" role="status" className={styles.spinner}>
            <span className="visually-hidden">{message}</span>
          </Spinner>
          <p className={styles.message}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.inlineLoader}>
      <Spinner animation="border" role="status" size="sm" className={styles.spinner}>
        <span className="visually-hidden">{message}</span>
      </Spinner>
      <span className={styles.message}>{message}</span>
    </div>
  );
}
