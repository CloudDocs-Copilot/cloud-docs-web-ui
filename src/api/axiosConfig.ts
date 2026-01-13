import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig, type AxiosError } from 'axios';

/**
 * Configuración base de la instancia de axios
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const TIMEOUT = 30000; // 30 segundos

/**
 * Crea y configura una instancia de axios con interceptors de seguridad
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor de solicitud - añade token de autenticación si existe
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Obtener token del localStorage
      const token = localStorage.getItem('authToken');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Añadir timestamp para evitar caché
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          _t: Date.now(),
        };
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de respuesta - maneja errores globalmente
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        switch (error.response.status) {
          case 401:
            // Token expirado o no válido - limpiar localStorage y redirigir a login
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = '/login';
            break;
          case 403:
            // Acceso prohibido
            console.error('Acceso prohibido a este recurso');
            break;
          case 404:
            // Recurso no encontrado
            console.error('Recurso no encontrado');
            break;
          case 500:
          case 502:
          case 503:
            // Error del servidor
            console.error('Error del servidor. Por favor, inténtelo más tarde');
            break;
          default:
            console.error('Error en la petición:', error.response.data);
        }
      } else if (error.request) {
        // La solicitud fue hecha pero no se recibió respuesta
        console.error('No se recibió respuesta del servidor');
      } else {
        // Algo sucedió al configurar la solicitud
        console.error('Error al configurar la petición:', error.message);
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Instancia configurada de axios para uso global
 */
export const apiClient = createAxiosInstance();

/**
 * Función helper para crear configuración personalizada de axios
 */
export const createConfig = (config?: AxiosRequestConfig): AxiosRequestConfig => {
  return {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      ...config?.headers,
    },
  };
};

/**
 * Sanitiza los datos de entrada para prevenir inyección de código
 */
export { sanitizeData } from './sanitizer';

export default apiClient;
