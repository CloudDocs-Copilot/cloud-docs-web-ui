import { useState } from 'react';
import { Sparkles, User, Mail, Lock } from 'lucide-react';
import styles from './RegisterForm.module.css';

interface RegisterFormProps {
  onRegister?: (data: { name: string; email: string; password: string }) => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirm) {
      setError('Completa todos los campos.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    onRegister?.({ name, email, password });
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
              <input className={styles.input} value={name} onChange={e => setName(e.target.value)} placeholder="Juan Pérez" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                <Mail className={styles.labelIcon} /> Correo electrónico
              </label>
              <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                <Lock className={styles.labelIcon} /> Contraseña
              </label>
              <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                <Lock className={styles.labelIcon} /> Confirmar contraseña
              </label>
              <input className={styles.input} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required />
            </div>
            {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
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