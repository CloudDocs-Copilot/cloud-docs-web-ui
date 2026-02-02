import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useFormValidation } from "../hooks/useFormValidation";
import { resetPasswordRequest } from "../services/auth.service";

// Reutiliza el MISMO CSS module del Forgot (para mantener diseño consistente)
// Si tu Forgot usa otro nombre, pon aquí el mismo import que usaste ahí.
import styles from "./ForgotPasswordPage.module.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    validatePassword,
    setFieldError,
    clearFieldError,
    errors,
    handleBlur,
  } = useFormValidation<{ newPassword: string; confirmPassword: string }>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMsg(null);

    // 1) Validar password policy
    const passOk = validatePassword(newPassword);
    if (!passOk) {
      setFieldError(
        "newPassword",
        "La contraseña debe tener mínimo 8 caracteres y cumplir la política (mayúscula, minúscula, número y símbolo)."
      );
    } else {
      clearFieldError("newPassword");
    }

    // 2) Validar confirmación
    const confirmOk = newPassword === confirmPassword;
    if (!confirmOk) {
      setFieldError("confirmPassword", "Las contraseñas no coinciden.");
    } else {
      clearFieldError("confirmPassword");
    }

    if (!passOk || !confirmOk) return;

    // 3) Token requerido
    if (!token) {
      setServerError("El enlace no contiene token. Solicita uno nuevo.");
      return;
    }

    try {
      setLoading(true);

      await resetPasswordRequest({token, newPassword, confirmPassword});

      // Limpieza recomendada por consistencia
      localStorage.removeItem("user");

      setSuccessMsg("Contraseña actualizada. Ahora puedes iniciar sesión.");

      // Redirige al login
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (err: unknown) {
      // Mensaje amigable
      setServerError(
        err instanceof Error
          ? err.message
          : "No se pudo restablecer la contraseña. El enlace puede haber expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  // Si no hay token, muestra pantalla útil
  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <div className={styles.card}>
            <div className={styles.formTitle}>Enlace inválido</div>
            <p style={{ marginTop: 8, color: "#6b7280" }}>
              El enlace no es válido o no contiene token. Solicita uno nuevo.
            </p>

            <div style={{ marginTop: 16 }}>
              <Link className={styles.forgotPasswordLink} to="/auth/forgot-password">
                Ir a recuperar contraseña
              </Link>
            </div>

            <div style={{ marginTop: 16 }}>
              <Link className={styles.backLink} to="/login">
                Volver a iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render normal con token
  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <div className={styles.formTitle}>Nueva contraseña</div>

          <p style={{ marginTop: 8, color: "#6b7280" }}>
            Ingresa tu nueva contraseña y confírmala para finalizar el cambio.
          </p>

          <form className={styles.form} onSubmit={onSubmit}>
            {/* New Password */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="newPassword">
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onBlur={(e) => handleBlur("newPassword", e.target.value)}
                autoComplete="new-password"
              />
              {errors.newPassword && (
                <div style={{ color: "#b91c1c", fontSize: "0.875rem" }}>
                  {errors.newPassword}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirmPassword">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                className={styles.input}
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={(e) => handleBlur("confirmPassword", e.target.value)}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <div style={{ color: "#b91c1c", fontSize: "0.875rem" }}>
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            {/* Mensajes */}
            {serverError && (
              <div style={{ color: "#b91c1c", fontSize: "0.875rem" }}>
                {serverError}
              </div>
            )}

            {successMsg && (
              <div style={{ color: "#065f46", fontSize: "0.875rem" }}>
                {successMsg}
              </div>
            )}

            {/* Submit */}
            <button className={styles.submitButton} type="submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar nueva contraseña"}
            </button>
          </form>

          <div style={{ marginTop: 16 }}>
            <Link className={styles.backLink} to="/login">
              Volver a iniciar sesión
            </Link>
          </div>
        </div>

        <div className={styles.footer}>
          <p>© 2026 CloudDocs Copilot</p>
        </div>
      </div>
    </div>
  );
}