import { useState } from 'react';
import { useFormValidation } from '../hooks/useFormValidation';
import { useHttpRequest } from '../hooks/useHttpRequest';
import { Sparkles, User, Mail, Lock } from 'lucide-react';
import styles from './RegisterForm.module.css';
import { NotificationToast } from './NotificationToast';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import { useNavigate } from 'react-router-dom';

/* Interfaces y types para el response del API */
  interface IUserPreferences {
    emailNotifications: boolean;
    documentUpdates: boolean;
    aiAnalysis: boolean;
  }
interface IUserDTO {
    name: string;
    email: string;
    role: 'user' | 'admin';
    active: boolean;
    tokenVersion: number;
    lastPasswordChange?: string | null;
    organization?: string | null;
    rootFolder?: string | null;
    storageUsed: number;
    avatar?: string | null;
    preferences: IUserPreferences;
    createdAt: string;
    updatedAt: string;
  }

  interface RegisterApiResponse {
    message: string;
    user: IUserDTO;
  }
interface RegisterFormProps {
  onRegister?: (data: { name: string; email: string; password: string }) => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = () => {

  usePageTitle({
        title: 'Register',
        subtitle: 'Register',
        documentTitle: 'Registro de usuario',
        metaDescription: 'Página de registro para CloudDocs Copilot'
      });
    
  const navigate = useNavigate(); 

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Toast state para notificaciones
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('danger');

  

  

  // Hook genérico para llamadas HTTP
  const { execute,  error: apiError } = useHttpRequest<RegisterApiResponse>();

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
      if (!/[^A-Za-z0-9]/.test(value)) return 'Debe tener un carácter especial.';
      
      return '';
    },
    confirm: (value: string) => {
      if (!value) return 'Confirma tu contraseña.';
      if (value !== form.password) return 'Las contraseñas no coinciden.';
      return '';
    }
  };

  const {
   
    validateAllFields,
    getFieldError,
    clearAllErrors
  } = useFormValidation<typeof form>(validationRules);

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

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirm,
    };

    // Ejecutar la petición usando el hook genérico
    const result = await execute({ method: 'POST', url: '/auth/register', data: payload });

    if (result) {
      setSuccess(result.message || 'Registro exitoso. Revisa tu email para confirmar tu cuenta.');
      setForm({ name: '', email: '', password: '', confirm: '' });
      navigate('/login');
    } else {
      const msg = apiError?.message || 'Error al registrar usuario.';
      setError(msg);
      setToastMessage(msg);
      setToastVariant('danger');
      setShowToast(true);
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
            <button type="button" onClick={() => navigate('/login')} className={styles.registerLink}>
              Inicia sesión aquí
            </button>
          </div>
        </div>
      </div>
      <NotificationToast
        show={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        variant={toastVariant}
        title={toastVariant === 'danger' ? 'Error' : 'Notificación'}
      />
    </div>
  );
};

export default RegisterForm;