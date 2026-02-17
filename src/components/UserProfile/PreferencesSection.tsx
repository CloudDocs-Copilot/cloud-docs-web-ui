import { Form } from 'react-bootstrap';
import styles from './PreferencesSection.module.css';
import type { UserPreferences } from '../../types/user.types';

interface PreferencesSectionProps {
  preferences?: UserPreferences;
  onPreferenceChange?: (key: keyof UserPreferences, value: boolean) => void;
}

export function PreferencesSection({ preferences, onPreferenceChange }: PreferencesSectionProps) {
  return (
    <div className="mb-4">
      <h3 className={styles.title}>Preferencias</h3>
      <div className="d-flex flex-column gap-3">
        <div className={styles.item}>
          <span className={styles.text}>Notificaciones por email</span>
          <Form.Check
            type="switch"
            checked={preferences?.emailNotifications ?? true}
            onChange={(e) => onPreferenceChange?.('emailNotifications', e.target.checked)}
            aria-label="Notificaciones por email"
          />
        </div>
        <div className={styles.item}>
          <span className={styles.text}>Actualizaciones de documentos</span>
          <Form.Check
            type="switch"
            checked={preferences?.documentUpdates ?? true}
            onChange={(e) => onPreferenceChange?.('documentUpdates', e.target.checked)}
            aria-label="Actualizaciones de documentos"
          />
        </div>
        <div className={styles.item}>
          <span className={styles.text}>Análisis con IA automático</span>
          <Form.Check
            type="switch"
            checked={preferences?.aiAnalysis ?? true}
            onChange={(e) => onPreferenceChange?.('aiAnalysis', e.target.checked)}
            aria-label="Análisis con IA automático"
          />
        </div>
      </div>
    </div>
  );
}
