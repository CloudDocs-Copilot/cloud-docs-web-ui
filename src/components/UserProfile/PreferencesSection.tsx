import { Form } from 'react-bootstrap';
import styles from './PreferencesSection.module.css';

export function PreferencesSection() {
  return (
    <div className="mb-4">
      <h3 className={styles.title}>Preferencias</h3>
      <div className="d-flex flex-column gap-3">
        <div className={styles.item}>
          <span className={styles.text}>Notificaciones por email</span>
          <Form.Check type="switch" defaultChecked />
        </div>
        <div className={styles.item}>
          <span className={styles.text}>Actualizaciones de documentos</span>
          <Form.Check type="switch" defaultChecked />
        </div>
        <div className={styles.item}>
          <span className={styles.text}>Análisis con IA automático</span>
          <Form.Check type="switch" defaultChecked />
        </div>
      </div>
    </div>
  );
}
