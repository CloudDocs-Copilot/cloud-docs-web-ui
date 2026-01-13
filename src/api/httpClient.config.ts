import axios, { type AxiosInstance, type AxiosRequestConfig, type InternalAxiosRequestConfig, type AxiosError } from 'axios';

/**
 * Configuración base de la instancia de axios
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const REQUEST_TIMEOUT_MS = 30000; // 30 segundos

/**
 * Crea y configura una instancia de axios con interceptors de seguridad
 */
const createAxiosInstance = (): AxiosInstance => {
  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor de solicitud - añade token de autenticación si existe
  axiosInstance.interceptors.request.use(
    (requestConfig: InternalAxiosRequestConfig) => {
      // Obtener token del localStorage
      const authToken = localStorage.getItem('authToken');
      
      if (authToken && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${authToken}`;
      }

      // Añadir timestamp para evitar caché
      if (requestConfig.method === 'get') {
        requestConfig.params = {
          ...requestConfig.params,
          _t: Date.now(),
        };
      }

      return requestConfig;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Interceptor de respuesta - maneja errores globalmente
  axiosInstance.interceptors.response.use(
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

  return axiosInstance;
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
export { sanitizeData } from './dataSanitizer';

export default apiClient;
