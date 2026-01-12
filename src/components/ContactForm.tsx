import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { useFormValidation } from '../hooks/useFormValidation';
import styles from './ContactForm.module.css';

interface ContactFormProps {
  onSubmit?: (data: ContactFormData) => void;
  buttonText?: string;
  buttonSize?: 'sm' | 'lg';
}

export interface ContactFormData extends Record<string, string> {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactForm: React.FC<ContactFormProps> = ({ 
  onSubmit, 
  buttonText = 'Enviar Mensaje',
  buttonSize = 'lg'
}) => {
  const [formData, setFormData] = React.useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const validationRules = {
    name: (value: string) => {
      if (!value.trim()) return 'El nombre es requerido';
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/;
      if (!nameRegex.test(value.trim())) {
        return 'El nombre debe tener al menos 2 caracteres y solo letras';
      }
      return '';
    },
    email: (value: string) => {
      if (!value.trim()) return 'El email es requerido';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Por favor ingresa un email válido';
      }
      return '';
    },
    subject: (value: string) => {
      if (!value.trim()) return 'El asunto es requerido';
      if (value.trim().length < 5) return 'El asunto debe tener al menos 5 caracteres';
      return '';
    },
    message: (value: string) => {
      if (!value.trim()) return 'El mensaje es requerido';
      if (value.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres';
      return '';
    }
  };

  const {
    errors,
    validateAllFields,
    clearFieldError,
    clearAllErrors,
    handleBlur: validateOnBlur
  } = useFormValidation<ContactFormData>(validationRules);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    clearFieldError(name as keyof ContactFormData);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    validateOnBlur(name as keyof ContactFormData, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validateAllFields(formData);
    
    if (!isValid) {
      return;
    }

    if (onSubmit) {
      onSubmit(formData);
    }
    
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    clearAllErrors();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.contactForm}>
      <Row className="g-3">
        <Col md={6}>
          <input 
            type="text" 
            name="name"
            className={`${styles.contactInput} ${errors.name ? styles.inputError : ''}`}
            placeholder="Nombre"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
        </Col>
        <Col md={6}>
          <input 
            type="email" 
            name="email"
            className={`${styles.contactInput} ${errors.email ? styles.inputError : ''}`}
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
        </Col>
        <Col xs={12}>
          <input 
            type="text" 
            name="subject"
            className={`${styles.contactInput} ${errors.subject ? styles.inputError : ''}`}
            placeholder="Asunto"
            value={formData.subject}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {errors.subject && <div className={styles.errorMessage}>{errors.subject}</div>}
        </Col>
        <Col xs={12}>
          <textarea 
            name="message"
            className={`${styles.contactTextarea} ${errors.message ? styles.inputError : ''}`}
            rows={4} 
            placeholder="Mensaje"
            value={formData.message}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {errors.message && <div className={styles.errorMessage}>{errors.message}</div>}
        </Col>
        <Col xs={12} className="text-center">
          <Button 
            type="submit"
            variant="primary" 
            size={buttonSize}
            className={styles.contactSubmit}
          >
            {buttonText}
          </Button>
        </Col>
      </Row>
    </form>
  );
};

export default ContactForm;
