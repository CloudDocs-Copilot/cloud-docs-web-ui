import { Form } from 'react-bootstrap';
import styles from './PersonalInfoSection.module.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface PersonalInfoSectionProps {
  name: string;
  email: string;
  onNameChange: (name: string) => void;
  onEmailChange: (email: string) => void;
  errors?: { name?: string; email?: string };
  onBlur?: (field: "name" | "email", value: string) => void;
}

export function PersonalInfoSection({ 
  name, 
  email, 
  onNameChange, 
  onEmailChange,
  errors = {},
  onBlur = () => {}
}: PersonalInfoSectionProps) {
  return (
    <div className="mb-4">
      <h3 className={styles.title}>Información Personal</h3>
      
      <Form.Group className="mb-4" controlId="name">
        <Form.Label className={styles.label}>
          <i className="bi bi-person me-2"></i>
          Nombre completo
        </Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onBlur={(e) => onBlur("name", e.target.value)}
          isInvalid={!!errors.name}
          required
          className={styles.input}
        />
        <Form.Control.Feedback type="invalid">
          {errors.name}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-4" controlId="email">
        <Form.Label className={styles.label}>
          <i className="bi bi-envelope me-2"></i>
          Correo electrónico
        </Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          onBlur={(e) => onBlur("email", e.target.value)}
          isInvalid={!!errors.email}
          required
          className={styles.input}
        />
        <Form.Control.Feedback type="invalid">
          {errors.email}
        </Form.Control.Feedback>
      </Form.Group>
    </div>
  );
}
