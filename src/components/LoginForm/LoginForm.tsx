// src/components/LoginForm/LoginForm.tsx
import React, { useState } from "react";
import styles from "./LoginForm.module.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidEmail = (v: string) =>
    /^[^\s@]+@([^\s@.]+\.)+[^\s@.]{2,}$/.test(v.trim().toLowerCase());

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !isValidEmail(email)) {
      setError("Ingresa un correo válido.");
      return;
    }
    if (!password) {
      setError("La contraseña es requerida.");
      return;
    }

    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password, rememberMe);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header (logo + textos) */}
        <div className={styles.headerSection}>
          <div className={styles.logoIcon}>
            {/* Icono (puedes sustituirlo por tu SVG final cuando lo tengas) */}
            <svg
              className={styles.logoIconSvg}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 2l1.2 4.3L17.5 8 13.2 9.2 12 13.5 10.8 9.2 6.5 8l4.3-1.7L12 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M19 11l.7 2.5L22 14l-2.3.5L19 17l-.7-2.5L16 14l2.3-.5L19 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className={styles.appTitle}>CloudDocs Copilot</div>
          <div className={styles.appSubtitle}>Gestión documental inteligente con IA</div>
        </div>

        {/* Card */}
        <div className={styles.card}>
          <div className={styles.formTitle}>Iniciar sesión</div>

          <form className={styles.form} onSubmit={onSubmit}>
            {/* Email */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {/* Remember + Forgot */}
            <div className={styles.rememberRow}>
              <label className={styles.rememberLabel}>
                <input
                  className={styles.checkbox}
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Recordarme</span>
              </label>

              <a className={styles.forgotPasswordLink} href="#">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Error */}
            {error && (
              <div style={{ color: "#b91c1c", fontSize: "0.875rem" }}>{error}</div>
            )}

            {/* Submit */}
            <button className={styles.submitButton} type="submit" disabled={loading}>
              {/* Icono del botón (estilo Figma) */}
              <svg
                className={styles.buttonIcon}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M10 17l5-5-5-5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 12h11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <div className={styles.dividerLine} />
            <div className={styles.dividerText}>o</div>
            <div className={styles.dividerLine} />
          </div>

          {/* Register */}
          <div className={styles.registerPrompt}>
            ¿No tienes una cuenta?{" "}
            <a className={styles.registerLink} href="#">
              Regístrate aquí
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <p>© 2026 CloudDocs Copilot</p>
        </div>
      </div>
    </div>
  );
}
