import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import styles from './SecuritySection.module.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface SecuritySectionProps {
  onPasswordChange?: (currentPassword: string, newPassword: string) => void;
}

export function SecuritySection({ onPasswordChange: _ }: SecuritySectionProps) {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <div className="mb-4">
      <div className={styles.header}>
        <h3 className={styles.title}>Seguridad</h3>
        <Button
          variant="link"
          size="sm"
          className={styles.changePasswordLink}
          onClick={() => setIsEditingPassword(!isEditingPassword)}
        >
          {isEditingPassword ? 'Cancelar cambio' : 'Cambiar contraseña'}
        </Button>
      </div>

      {isEditingPassword && (
        <div className={styles.passwordContainer}>
          <Form.Group className="mb-3">
            <Form.Label className={styles.label}>
              <i className="bi bi-lock me-2"></i>
              Contraseña actual
            </Form.Label>
            <Form.Control
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className={styles.input}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className={styles.label}>Nueva contraseña</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              className={styles.input}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className={styles.label}>Confirmar nueva contraseña</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              isInvalid={confirmPassword !== '' && newPassword !== confirmPassword}
              className={styles.input}
            />
            <Form.Control.Feedback type="invalid">
              Las contraseñas no coinciden
            </Form.Control.Feedback>
          </Form.Group>
        </div>
      )}

      {!isEditingPassword && (
        <p className={styles.message}>
          Tu contraseña está protegida. Haz clic en "Cambiar contraseña" para actualizarla.
        </p>
      )}
    </div>
  );
}
