import { useState } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { Sparkles, User, Mail, Lock } from 'lucide-react';
import styles from './RegisterForm.module.css';

interface RegisterFormProps {
  onRegister?: (data: { name: string; email: string; password: string }) => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin }) => {

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [success, setSuccess] = useState('');

  // Validaciones por campo
  const validationRules = {
    name: (value: string) => {
      if (!value) return 'El nombre es obligatorio.';
      return !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,}$/.test(value.trim()) ? 'Nombre no válido.' : '';
    },
    email: (value: string) => {
      if (!value) return 'El email es obligatorio.';
      return !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value) ? 'Email no válido.' : '';
    },
    password: (value: string) => {
      if (!value) return 'La contraseña es obligatoria.';
      if (value.length < 8) return 'Mínimo 8 caracteres.';
      if (!/[A-Z]/.test(value)) return 'Debe tener una mayúscula.';
      if (!/[0-9]/.test(value)) return 'Debe tener un número.';
      return '';
    },
    confirm: (value: string) => {
      if (!value) return 'Confirma tu contraseña.';
      if (value !== form.password) return 'Las contraseñas no coinciden.';
      return '';
    }
  };

  const {
    errors,
    validateAllFields,
    getFieldError,
    clearAllErrors
  } = useFormValidation<typeof form>(validationRules);

  const [error, setError] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    clearAllErrors();
    if (!validateAllFields(form)) {
      setError('Corrige los errores antes de continuar.');
      return;
    }
    try {
      const res = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, confirmPassword: form.confirm })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error al registrar usuario.');
      } else {
        setSuccess(data.message || 'Registro exitoso. Revisa tu email para confirmar tu cuenta.');
        setForm({ name: '', email: '', password: '', confirm: '' });
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.headerSection}>
          <div className={styles.logoIcon}>
            <Sparkles className={styles.logoIconSvg} />
          </div>
          <h1 className={styles.appTitle}>CloudDocs Copilot</h1>
          <p className={styles.appSubtitle}>Crea tu cuenta y comienza a organizar</p>
        </div>
        <div className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form} autoComplete="off">
            <div className={styles.field}>
              <label className={styles.label}>
                <User className={styles.labelIcon} /> Nombre completo
              </label>
              <input
                className={styles.input}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Juan Pérez"
                required
              />
              {getFieldError('name') && <div style={{ color: 'red' }}>{getFieldError('name')}</div>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                <Mail className={styles.labelIcon} /> Correo electrónico
              </label>
              <input
                className={styles.input}
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
              />
              {getFieldError('email') && <div style={{ color: 'red' }}>{getFieldError('email')}</div>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                <Lock className={styles.labelIcon} /> Contraseña
              </label>
              <input
                className={styles.input}
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              {getFieldError('password') && <div style={{ color: 'red' }}>{getFieldError('password')}</div>}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                <Lock className={styles.labelIcon} /> Confirmar contraseña
              </label>
              <input
                className={styles.input}
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
              {getFieldError('confirm') && <div style={{ color: 'red' }}>{getFieldError('confirm')}</div>}
            </div>
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
            {success && <div style={{ color: 'green', marginBottom: 8 }}>{success}</div>}
            <button type="submit" className={styles.submitButton}>
              <User className={styles.labelIcon} /> Crear cuenta
            </button>
          </form>
          <div className={styles.registerPrompt}>
            ¿Ya tienes una cuenta?{' '}
            <button type="button" onClick={onSwitchToLogin} className={styles.registerLink}>
              Inicia sesión aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;