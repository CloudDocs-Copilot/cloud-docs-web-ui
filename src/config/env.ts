/**
 * Configuración de variables de entorno
 * 
 * En desarrollo/build (Vite): usa import.meta.env que Vite reemplaza con valores del .env
 * En tests (Jest): import.meta.env no existe, así que usamos valores mockeados o por defecto
 */

// Función helper para obtener variables de entorno de forma segura
const getEnvVar = (key: string, defaultValue: string): string => {
  // En contexto de Vite (desarrollo/build), import.meta.env está disponible
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const value = import.meta.env[key];
    if (typeof value === 'string' && value !== '') {
      return value;
    }
  }
  
  // Fallback al valor por defecto
  return defaultValue;
};

/**
 * URL base de la API
 * - En desarrollo: lee de .env (VITE_API_BASE_URL)
 * - En producción: usa el valor compilado por Vite
 * - En tests: usa el mock o valor por defecto
 */
export const API_BASE_URL = getEnvVar('VITE_API_BASE_URL', 'http://localhost:4000/api');

/**
 * Timeout para peticiones HTTP (en milisegundos)
 */
export const REQUEST_TIMEOUT_MS = 30000; // 30 segundos

/**
 * Entorno de la aplicación
 */
export const APP_ENV = getEnvVar('VITE_APP_ENV', 'development');
