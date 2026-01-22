import { useState, useCallback, useRef, useEffect } from 'react';
import type { AxiosResponse } from 'axios';
import { apiClient, sanitizeData, ApiStatus } from '../api';
import type {
  ApiState,
  ExecuteParams,
  ApiErrorResponse,
  ApiAxiosError,
  ValidationConfig,
  UseHttpRequestOptions,
} from '../api';

/**
 * Hook genérico para consumir APIs con validaciones y seguridad
 * @template TResponse - Tipo de respuesta esperada de la API
 * @template TRequest - Tipo de datos de la petición
 * @param options - Opciones de configuración del hook
 * @returns Estado y métodos para ejecutar peticiones HTTP
 * 
 * @example
 * ```tsx
 * const { execute, data, isLoading, error } = useHttpRequest<User>();
 * 
 * const fetchUser = async () => {
 *   await execute({
 *     method: 'GET',
 *     url: '/users/1'
 *   });
 * };
 * ```
 */
export const useHttpRequest = <TResponse = unknown, TRequest = unknown>(
  options: UseHttpRequestOptions<TResponse> = {}
) => {
  const {
    onSuccess,
    onError,
    onSettled,
    retry = 0,
    retryDelay = 1000,
    enabled = true,
    refetchOnWindowFocus = false,
  } = options;

  // Refs para callbacks (evitar recreación de execute)
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onSettledRef = useRef(onSettled);

  // Actualizar refs cuando cambien los callbacks
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
    onSettledRef.current = onSettled;
  }, [onSuccess, onError, onSettled]);

  // Estado del hook
  const [state, setState] = useState<ApiState<TResponse>>({
    data: null,
    error: null,
    status: ApiStatus.IDLE,
    isLoading: false,
    isError: false,
    isSuccess: false,
    isIdle: true,
  });

  // Estado para conteo de reintentos
  const [retryCount, setRetryCount] = useState(0);

  // Refs para evitar memory leaks en componentes desmontados
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Valida los datos de entrada
   */
  const validateRequestData = useCallback(
    <T>(data: T, validation?: ValidationConfig<T>): { isValid: boolean; error?: string } => {
      if (!data) {
        return { isValid: true };
      }

      // Validación personalizada si se proporciona
      if (validation?.validate) {
        const validationResult = validation.validate(data);
        if (typeof validationResult === 'string') {
          return { isValid: false, error: validationResult };
        }
        if (!validationResult) {
          return { isValid: false, error: 'Validación de datos fallida' };
        }
      }

      // Validación básica: no permitir objetos vacíos en POST/PUT/PATCH
      if (typeof data === 'object' && Object.keys(data as object).length === 0) {
        return { isValid: false, error: 'Los datos no pueden estar vacíos' };
      }

      return { isValid: true };
    },
    []
  );

  /**
   * Procesa los errores de la API y los convierte a un formato estandarizado
   */
  const processError = useCallback((error: ApiAxiosError): ApiErrorResponse => {
    if (error.response) {
      // Error con respuesta del servidor
      return {
        message: error.response.data?.message || 'Error en la petición',
        errors: error.response.data?.errors,
        status: error.response.status,
        code: error.response.data?.code,
      };
    } else if (error.request) {
      // Error sin respuesta del servidor
      return {
        message: 'No se pudo conectar con el servidor',
        status: 0,
      };
    } else {
      // Error en la configuración de la petición
      return {
        message: error.message || 'Error desconocido',
      };
    }
  }, []);

  /**
   * Actualiza el estado de forma segura (solo si el componente está montado)
   */
  const updateState = useCallback((newState: Partial<ApiState<TResponse>>) => {
    if (isMountedRef.current) {
      setState((prev) => {
        const finalStatus = newState.status ?? prev.status;
        return {
          ...prev,
          ...newState,
          status: finalStatus,
          isLoading: finalStatus === ApiStatus.LOADING,
          isError: finalStatus === ApiStatus.ERROR,
          isSuccess: finalStatus === ApiStatus.SUCCESS,
          isIdle: finalStatus === ApiStatus.IDLE,
        };
      });
    }
  }, []);

  /**
   * Ejecuta una petición HTTP con reintentos automáticos
   */
  const executeWithRetry = useCallback(
    async <T = TRequest>(
      params: ExecuteParams<T>
    ): Promise<TResponse | null> => {
      let currentRetry = 0;
      let lastError: ApiAxiosError | null = null;

      while (currentRetry <= retry) {
        try {
          const { method, url, data, config } = params;

          // Solo cancelar petición anterior si es un nuevo request (no un retry)
          if (currentRetry === 0 && abortControllerRef.current) {
            abortControllerRef.current.abort();
          }

          // Crear nuevo AbortController solo si no existe o es el primer intento
          if (currentRetry === 0 || !abortControllerRef.current) {
            abortControllerRef.current = new AbortController();
          }

          // Preparar datos sanitizados si es necesario
          const sanitizedData = data ? sanitizeData(data) : undefined;

          // Ejecutar petición
          const response: AxiosResponse<TResponse> = await apiClient.request({
            method: method.toLowerCase(),
            url,
            data: sanitizedData,
            signal: abortControllerRef.current.signal,
            ...config,
          });

          // Reset retry counter on success
          setRetryCount(0);

          return response.data;
        } catch (error) {
          const apiError = error as ApiAxiosError;
          lastError = apiError;

          // No reintentar si la petición fue cancelada - y no lanzar error
          if (apiError.code === 'ERR_CANCELED' || apiError.message === 'canceled') {
            // Resetear estado inmediatamente cuando se cancela
            if (isMountedRef.current) {
              setState({
                data: null,
                error: null,
                status: ApiStatus.IDLE,
                isLoading: false,
                isError: false,
                isSuccess: false,
                isIdle: true,
              });
            }
            return null;
          }

          // Verificar si debemos reintentar (error 5xx o error de red)
          const shouldRetry =
            currentRetry < retry &&
            (!apiError.response || apiError.response.status >= 500);

          if (shouldRetry) {
            currentRetry++;
            setRetryCount(currentRetry);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            // Continuar al siguiente intento
            continue;
          }

          // No se puede reintentar, lanzar error
          throw apiError;
        }
      }

      // Si llegamos aquí, agotamos todos los reintentos
      throw lastError;
    },
    [retry, retryDelay]
  );

  /**
   * Ejecuta una petición HTTP
   */
  const execute = useCallback(
    async <T = TRequest>(
      params: ExecuteParams<T>,
      validation?: ValidationConfig<T>
    ): Promise<TResponse | null> => {
      if (!enabled) {
        return null;
      }

      // Validar datos de entrada
      if (params.data) {
        const validationResult = validateRequestData(params.data, validation);
        if (!validationResult.isValid) {
          const error: ApiErrorResponse = {
            message: validationResult.error || 'Validación fallida',
          };
          updateState({
            error,
            status: ApiStatus.ERROR,
          });
          onErrorRef.current?.(error);
          onSettledRef.current?.();
          return null;
        }
      }

      // Actualizar estado a loading
      updateState({
        status: ApiStatus.LOADING,
        error: null,
      });

      try {
        const data = await executeWithRetry(params);

        if (data !== null) {
          updateState({
            data,
            error: null,
            status: ApiStatus.SUCCESS,
          });
          onSuccessRef.current?.(data);
        } else {
          // Si data es null (petición cancelada), resetear a IDLE
          updateState({
            status: ApiStatus.IDLE,
          });
        }

        onSettledRef.current?.();
        return data;
      } catch (error) {
        const apiError = processError(error as ApiAxiosError);
        
        updateState({
          error: apiError,
          status: ApiStatus.ERROR,
        });

        onErrorRef.current?.(apiError);
        onSettledRef.current?.();
        return null;
      }
    },
    [
      enabled,
      validateRequestData,
      executeWithRetry,
      updateState,
      processError,
    ]
  );

  /**
   * Resetea el estado del hook
   */
  const reset = useCallback(() => {
    updateState({
      data: null,
      error: null,
      status: ApiStatus.IDLE,
    });
    setRetryCount(0);
  }, [updateState]);

  /**
   * Cancela la petición en curso
   */
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cancel();
    };
  }, [cancel]);

  // Refetch on window focus si está habilitado
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      // Implementar lógica de refetch aquí si es necesario
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus]);

  return {
    ...state,
    execute,
    reset,
    cancel,
    retryCount,
  };
};

export default useHttpRequest;
