import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useHttpRequest } from '../useHttpRequest';
import { apiClient } from '../../api/httpClient.config';
import { ApiStatus } from '../../types/api.types';

// Mock de axios
jest.mock('../../api/httpClient.config', () => ({
  apiClient: {
    request: jest.fn(),
  },
  sanitizeData: jest.fn((data) => data),
}));

describe('useHttpRequest Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Estado inicial', () => {
    it('debe inicializar con estado IDLE', () => {
      const { result } = renderHook(() => useHttpRequest());

      expect(result.current.status).toBe(ApiStatus.IDLE);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isIdle).toBe(true);
    });
  });

  describe('Petición GET exitosa', () => {
    it('debe ejecutar una petición GET y actualizar el estado correctamente', async () => {
      const mockData = { id: 1, name: 'Test User' };
      (apiClient.request as jest.Mock).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useHttpRequest<typeof mockData>());

      expect(result.current.isIdle).toBe(true);

      // Ejecutar petición
      act(() => {
        result.current.execute({
          method: 'GET',
          url: '/users/1',
        });
      });

      // Verificar estado de loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Verificar estado de success
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Petición POST exitosa', () => {
    it('debe ejecutar una petición POST con datos y recibir respuesta', async () => {
      const requestData = { name: 'New User', email: 'user@test.com' };
      const mockResponse = { id: 2, ...requestData };
      (apiClient.request as jest.Mock).mockResolvedValueOnce({ data: mockResponse });

      const { result } = renderHook(() => useHttpRequest<typeof mockResponse>());

      await act(async () => {
        await result.current.execute({
          method: 'POST',
          url: '/users',
          data: requestData,
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockResponse);
      expect(apiClient.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'post',
          url: '/users',
          data: requestData,
        })
      );
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar errores 404 correctamente', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'Usuario no encontrado',
          },
        },
      };
      (apiClient.request as jest.Mock).mockRejectedValueOnce(errorResponse);

      const { result } = renderHook(() => useHttpRequest());

      await act(async () => {
        await result.current.execute({
          method: 'GET',
          url: '/users/999',
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual({
        message: 'Usuario no encontrado',
        errors: undefined,
        status: 404,
        code: undefined,
      });
      expect(result.current.data).toBeNull();
    });

    it('debe manejar errores de red', async () => {
      const networkError = {
        request: {},
        message: 'Network Error',
      };
      (apiClient.request as jest.Mock).mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useHttpRequest());

      await act(async () => {
        await result.current.execute({
          method: 'GET',
          url: '/users',
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('No se pudo conectar con el servidor');
    });

    it('debe manejar errores 500 del servidor', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            message: 'Error interno del servidor',
          },
        },
      };
      (apiClient.request as jest.Mock).mockRejectedValueOnce(serverError);

      const { result } = renderHook(() => useHttpRequest());

      await act(async () => {
        await result.current.execute({
          method: 'POST',
          url: '/users',
          data: { name: 'Test' },
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.status).toBe(500);
      expect(result.current.error?.message).toBe('Error interno del servidor');
    });
  });

  describe('Callbacks', () => {
    it('debe llamar onSuccess cuando la petición es exitosa', async () => {
      const mockData = { id: 1, name: 'Test' };
      const onSuccess = jest.fn();
      (apiClient.request as jest.Mock).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useHttpRequest({ onSuccess }));

      await act(async () => {
        await result.current.execute({
          method: 'GET',
          url: '/users/1',
        });
      });

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockData);
      });
    });

  it('debe llamar onError cuando la petición falla', async () => {
      const onError = jest.fn();
      const errorResponse = {
        response: {
          status: 400,
          data: { message: 'Bad Request' },
        },
      };
      (apiClient.request as jest.Mock).mockRejectedValueOnce(errorResponse);

      const { result } = renderHook(() => useHttpRequest({ onError }));

      await act(async () => {
        await result.current.execute({
          method: 'POST',
          url: '/users',
          data: { name: 'Test User' },
        });
      });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Bad Request',
            status: 400,
          })
        );
      });
    });

    it('debe llamar onSettled tanto en éxito como en error', async () => {
      const onSettled = jest.fn();
      (apiClient.request as jest.Mock).mockResolvedValueOnce({ data: {} });

      const { result } = renderHook(() => useHttpRequest({ onSettled }));

      await act(async () => {
        await result.current.execute({
          method: 'GET',
          url: '/test',
        });
      });

      await waitFor(() => {
        expect(onSettled).toHaveBeenCalledTimes(1);
      });

      onSettled.mockClear();

      (apiClient.request as jest.Mock).mockRejectedValueOnce({
        response: { status: 500, data: {} },
      });

      await act(async () => {
        await result.current.execute({
          method: 'GET',
          url: '/test',
        });
      });

      await waitFor(() => {
        expect(onSettled).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Reintentos', () => {
    it('debe reintentar la petición en caso de error 500', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Server Error' },
        },
      };
      const mockData = { id: 1, name: 'Success' };

      (apiClient.request as jest.Mock)
        .mockRejectedValueOnce(serverError)
        .mockRejectedValueOnce(serverError)
        .mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() =>
        useHttpRequest({
          retry: 2, // 2 reintentos después de la llamada inicial
          retryDelay: 100,
        })
      );

      await act(async () => {
        await result.current.execute({
          method: 'GET',
          url: '/users',
        });
      });

      await waitFor(
        () => {
          expect(result.current.isSuccess).toBe(true);
        },
        { timeout: 1000 }
      );

      // 1 inicial + 2 reintentos = 3 llamadas
      expect(apiClient.request).toHaveBeenCalledTimes(3);
      expect(result.current.data).toEqual(mockData);
    });

    it('no debe reintentar en errores 4xx', async () => {
      const clientError = {
        response: {
          status: 404,
          data: { message: 'Not Found' },
        },
      };

      (apiClient.request as jest.Mock).mockRejectedValueOnce(clientError);

      const { result } = renderHook(() =>
        useHttpRequest({
          retry: 3,
          retryDelay: 100,
        })
      );

      await act(async () => {
        await result.current.execute({
          method: 'GET',
          url: '/users/999',
        });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(apiClient.request).toHaveBeenCalledTimes(1);
    });
  });

  describe('Métodos auxiliares', () => {
    it('debe resetear el estado', async () => {
      const mockData = { id: 1 };
      (apiClient.request as jest.Mock).mockResolvedValueOnce({ data: mockData });

      const { result } = renderHook(() => useHttpRequest());

      await act(async () => {
        await result.current.execute({
          method: 'GET',
          url: '/test',
        });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe(ApiStatus.IDLE);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('debe poder cancelar una petición', async () => {
      let abortSignal: AbortSignal | undefined;
      
      (apiClient.request as jest.Mock).mockImplementationOnce(
        (config) => {
          abortSignal = config.signal;
          return new Promise((_, reject) => {
            setTimeout(() => {
              if (abortSignal?.aborted) {
                reject({ code: 'ERR_CANCELED' });
              }
            }, 100);
          });
        }
      );

      const { result } = renderHook(() => useHttpRequest());

      await act(async () => {
        result.current.execute({
          method: 'GET',
          url: '/slow-endpoint',
        });
        
        // Cancelar inmediatamente
        result.current.cancel();
        
        // Esperar a que se procese
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      // El estado puede quedar en loading debido a la naturaleza asíncrona,
      // pero el AbortController debería haber sido llamado
      expect(abortSignal?.aborted).toBe(true);
    });
  });

  describe('Validaciones', () => {
    it('debe validar datos antes de enviar la petición', async () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useHttpRequest({ onError }));

      await act(async () => {
        await result.current.execute(
          {
            method: 'POST',
            url: '/users',
            data: { name: 'Test' },
          },
          {
            validate: () => 'Nombre inválido',
          }
        );
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Nombre inválido');
      expect(apiClient.request).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalled();
    });

    it('debe rechazar objetos vacíos en peticiones POST', async () => {
      const { result } = renderHook(() => useHttpRequest());

      await act(async () => {
        await result.current.execute(
          {
            method: 'POST',
            url: '/users',
            data: {},
          },
          {
            validate: (data) => Object.keys(data as object).length > 0,
          }
        );
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(apiClient.request).not.toHaveBeenCalled();
    });
  });

  describe('Opción enabled', () => {
    it('no debe ejecutar peticiones cuando enabled es false', async () => {
      const { result } = renderHook(() => useHttpRequest({ enabled: false }));

      const response = await act(async () => {
        return await result.current.execute({
          method: 'GET',
          url: '/users',
        });
      });

      expect(response).toBeNull();
      expect(apiClient.request).not.toHaveBeenCalled();
      expect(result.current.isIdle).toBe(true);
    });
  });
});

