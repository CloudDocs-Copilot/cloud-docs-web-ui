import React, { useState } from 'react';
import styles from './RegisterForm.module.css';
import { useRegisterValidation } from '../hooks/useRegisterValidation';
import { registerUser } from '../services/authService';

const RegisterForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [serverError, setServerError] = useState('');
  const { errors, validate } = useRegisterValidation();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setSuccess('');
    if (!validate(email, password)) return;
    setLoading(true);
    try {
      await registerUser({ name, email, password });
      setSuccess('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      if (err.response?.status === 409) {
        setServerError('El email ya está registrado.');
      } else {
        setServerError('Error al registrar. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <h2>Crear Cuenta</h2>
      <div>
        <label htmlFor="name">Nombre</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>
      <div>
        <label htmlFor="password">Contraseña</label>
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {errors.password && <span className={styles.error}>{errors.password}</span>}
      </div>
      <button type="submit" disabled={loading}>{loading ? 'Registrando...' : 'Registrarse'}</button>
      {serverError && <div className={styles.error}>{serverError}</div>}
      {success && <div className={styles.success}>{success}</div>}
    </form>
  );
};

export default RegisterForm;
