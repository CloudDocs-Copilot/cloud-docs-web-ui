// src/components/LoginForm/LoginForm.tsx
import React, { useState } from "react";
import styles from "./LoginForm.module.css";
import { useNavigate, Link } from "react-router-dom";
import { usePageTitle } from "../../hooks/usePageInfoTitle";
import { useAuth } from "../../hooks/useAuth";
import { useFormValidation } from "../../hooks/useFormValidation";
import axios from "axios";


function getHumanLoginError(err: unknown): string {
  // Si NO es axios
  if (!axios.isAxiosError(err)) {
    return "Ocurrió un error inesperado. Intenta de nuevo.";
  }

  const status = err.response?.status;
  const data: any = err.response?.data;

  // Tu backend a veces manda { success:false, error:"Missing required fields" }
  // o { message:"..." }
  const raw =
    data?.message ||
    data?.error ||
    (typeof data === "string" ? data : "") ||
    err.message ||
    "";

  const msg = String(raw).toLowerCase();

  // Casos típicos del login
  if (status === 400) {
    if (msg.includes("missing required fields")) {
      return "Completa tu correo y contraseña para iniciar sesión.";
    }
    return "Revisa los datos ingresados e inténtalo de nuevo.";
  }

  if (status === 401) {
    return "Correo o contraseña incorrectos.";
  }

  if (status === 404) {
    const url = `${err.config?.baseURL ?? ""}${err.config?.url ?? ""}`;

    // Si el 404 viene del login, para el usuario significa credenciales inválidas
    // (muchos backends responden 404 cuando el usuario no existe).
    if (url.includes("/auth/login")) {
      return "Correo o contraseña incorrectos.";
    }

    // Para cualquier otra ruta, sí es un “no encontrado” real
    return "No se encontró el recurso solicitado.";
  }

  // Errores de red
  if (err.code === "ERR_NETWORK" || msg.includes("network error") || msg.includes("connection refused")) {
    return "No se pudo conectar con el servidor. Verifica que el backend esté corriendo.";
  }

  // Servidor
  if (status && status >= 500) {
    return "El servidor tuvo un problema. Intenta nuevamente en unos minutos.";
  }

  // Fallback: si el backend manda algo útil (aunque venga en inglés)
  return /*raw ||*/ "No se pudo iniciar sesión. Intenta de nuevo.";
}



export default function LoginForm() {
  const navigate = useNavigate();
  usePageTitle({
      title: 'Login',
      subtitle: 'Login',
      documentTitle: 'Inicio de sesión',
      metaDescription: 'Página de inicio de sesión para CloudDocs Copilot'
    });
  


  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    validateEmail,
    setFieldError,
    clearFieldError,
    errors,
    handleBlur,
  } = useFormValidation<{ email: string; password: string }>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // validate email using hook helper
   // 1) Validar email
  const emailNormalized = email.trim().toLowerCase();
  const emailValid = validateEmail(emailNormalized);

  if (!emailValid) {
    setFieldError("email", "Ingresa un correo válido.");
  } else {
    clearFieldError("email");
  }

  // 2) Validar password requerido
  const passValid = password.trim().length > 0;
  if (!passValid) {
    setFieldError("password", "Ingresa tu contraseña.");
  } else {
    clearFieldError("password");
  }

  // 3) Si falla algo, no pegarle al backend
  if (!emailValid || !passValid) return;

  try {
    setLoading(true);
    await login(emailNormalized, password);
    navigate("/dashboard", { replace: true });
  } catch (err: unknown) {
    setServerError(getHumanLoginError(err));
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
                onBlur={(e) => handleBlur('email', e.target.value)}
                autoComplete="email"
              />
              {errors.email && (
                <div style={{ color: "#b91c1c", fontSize: "0.875rem" }}>{errors.email}</div>
              )}
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
                onBlur={(e) => handleBlur('password', e.target.value)}
                autoComplete="current-password"
              />

              {errors.password && (
              <div style={{ color: "#b91c1c", fontSize: "0.875rem" }}>{errors.password}</div>
              )}

            </div>

            {/* Remember + Forgot */}
            <div className={styles.rememberRow}>

              <label className={styles.rememberLabel}>
                <input
                  type="checkbox"
                  className={styles.checkbox} 
                />
                Recordarme
              </label>              

              <Link className={styles.forgotPasswordLink} to="/auth/forgot-password">
              ¿Olvidaste tu contraseña?
              </Link>

            </div>

            {/* Error */}
            {serverError && (
              <div style={{ color: "#b91c1c", fontSize: "0.875rem" }}>{serverError}</div>
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
            <a className={styles.registerLink} href="/register">
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
