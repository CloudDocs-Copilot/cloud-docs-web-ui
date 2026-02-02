import React, { useState } from "react";
import { Link } from "react-router-dom";
/*import styles from "../components/LoginForm/LoginForm.module.css";*/

import styles from "./ForgotPasswordPage.module.css";

import { usePageTitle } from "../hooks/usePageInfoTitle";
import { useFormValidation } from "../hooks/useFormValidation";
import { forgotPasswordRequest } from "../services/auth.service";

export default function ForgotPasswordPage() {
  usePageTitle({
    title: "Recuperar contraseña",
    subtitle: "Recuperar contraseña",
    documentTitle: "Recuperar contraseña",
    metaDescription: "Solicitud de recuperación de contraseña para CloudDocs Copilot",
  });

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Mensaje genérico (anti-enumeración) – siempre el mismo
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { validateEmail, setFieldError, clearFieldError, errors, handleBlur } =
    useFormValidation<{ email: string }>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMessage(null);

    const normalizedEmail = email.trim().toLowerCase();

    const emailValid = validateEmail(normalizedEmail);
    if (!emailValid) {
      setFieldError("email", "Ingresa un correo válido.");
      return;
    } else {
      clearFieldError("email");
    }

    try {
      setLoading(true);
      const resp = await forgotPasswordRequest(normalizedEmail);
      setSuccessMessage(resp.message || "Si el correo existe, se envió un enlace de recuperación.");
    } catch (err: unknown) {
      if (err instanceof Error) setServerError(err.message);
      else if (typeof err === "string") setServerError(err);
      else setServerError("No se pudo solicitar el enlace de recuperación.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {/* Header (reutiliza el mismo look) */}
        <div className={styles.headerSection}>
          <div className={styles.logoIcon}>
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
          <div className={styles.formTitle}>Recuperar contraseña</div>

          <div style={{ marginBottom: "1rem", color: "#64748b", lineHeight: 1.5 }}>
            ¿Perdiste tu contraseña? Ingresa tu correo electrónico y recibirás un enlace para
            crear una nueva contraseña.
          </div>

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
                onBlur={(e) => handleBlur("email", e.target.value)}
                autoComplete="email"
              />
              {errors.email && (
                <div style={{ color: "#b91c1c", fontSize: "0.875rem" }}>{errors.email}</div>
              )}
            </div>

            {/* Success / Error */}
            {successMessage && (
              <div style={{ color: "#0f766e", fontSize: "0.875rem" }}>{successMessage}</div>
            )}
            {serverError && (
              <div style={{ color: "#b91c1c", fontSize: "0.875rem" }}>{serverError}</div>
            )}

            {/* Submit (reutiliza el estilo del botón del login) */}
            <button className={styles.submitButton} type="submit" disabled={loading}>
              {loading ? "Enviando..." : "Restablecer contraseña"}
            </button>
          </form>

          {/* Back to login */}
          <div className={styles.registerPrompt} style={{ marginTop: "1rem" }}>
            <Link className={styles.registerLink} to="/login">
              Volver a iniciar sesión
            </Link>
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