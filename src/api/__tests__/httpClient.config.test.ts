/// <reference types="jest" />
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-require-imports */

// Ensure process.env is available before any imports or mocks
if (typeof (globalThis as Record<string, any>).process === 'undefined') {
  (globalThis as Record<string, any>).process = { env: { VITE_API_BASE_URL: 'http://localhost:3000/api' } };
}

import '@testing-library/jest-dom';

// Hoist axios mock before importing httpClient.config
let capturedResponseErrorInterceptor: ((error: unknown) => unknown) | null = null;
const requestHandlers: { request: ((req: unknown) => unknown) | null; response: ((err: unknown) => unknown) | null } = { 
  request: null, 
  response: null 
};

// Keep a reference to created instances for testing
const createdInstances: any[] = [];

jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');

  const mockCreate = jest.fn((config: any) => {
    const instance = {
      interceptors: {
        request: {
          use: jest.fn((req: (req: unknown) => unknown) => {
            requestHandlers.request = req;
            return 0;
          }),
        },
        response: {
          use: jest.fn((_onFulfilled: unknown, onRejected: (error: unknown) => unknown) => {
            capturedResponseErrorInterceptor = onRejected;
            requestHandlers.response = onRejected;
            return 1;
          }),
        },
      },
      defaults: { headers: { common: {} }, baseURL: config?.baseURL },
      get: jest.fn(() => Promise.resolve({ data: { token: 'mock-csrf' } })),
      post: jest.fn(),
    };
    createdInstances.push(instance);
    return instance;
  });

  return {
    ...actualAxios,
    create: mockCreate,
    default: {
      ...actualAxios.default,
      create: mockCreate,
    },
    get: jest.fn(() => Promise.resolve({ data: { token: 'mock-csrf' } })),
    post: jest.fn(),
    __handlers: requestHandlers,
  };
});

describe('httpClient.config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedResponseErrorInterceptor = null;
    requestHandlers.request = null;
    requestHandlers.response = null;
    createdInstances.length = 0;
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Ensure process exists for tests
    if (!(globalThis as any).process) {
      (globalThis as any).process = { env: {} };
    }
  });

  afterEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
    delete (globalThis as any).__VITE_ENV__;
    if ((globalThis as any).process) {
      delete (globalThis as any).process.env.VITE_API_BASE_URL;
    }
  });

  describe('Configuration and Helpers', () => {
    it('uses process.env when available for baseURL', () => {
      jest.resetModules();
      (globalThis as any).process = { env: { VITE_API_BASE_URL: 'http://proc/api' } };
      const { apiClient } = require('../httpClient.config');
      expect(apiClient.defaults.baseURL).toBe('http://proc/api');
    });

    it('falls back to __VITE_ENV__ when process.env not set', () => {
      jest.resetModules();
      
      // Remove and save original process
      const originalProcess = (globalThis as any).process;
      
      // Set up the environment to use __VITE_ENV__
      (globalThis as any).process = { env: {} };
      (globalThis as any).__VITE_ENV__ = { VITE_API_BASE_URL: 'http://global/api' };
      
      const { apiClient } = require('../httpClient.config');
      expect(apiClient.defaults.baseURL).toBe('http://global/api');
      
      // Restore process
      (globalThis as any).process = originalProcess;
    });

    it('createConfig merges headers', () => {
      jest.resetModules();
      const { createConfig } = require('../httpClient.config');
      const cfg = createConfig({ headers: { 'x-test': '1' } });
      expect(cfg.headers['Content-Type']).toBe('application/json');
      expect(cfg.headers['x-test']).toBe('1');
    });

    it('picks VITE_API_BASE_URL from global __VITE_ENV__ when present', () => {
      (globalThis as any).__VITE_ENV__ = { VITE_API_BASE_URL: 'https://example.test' };
      const axios = require('axios');
      require('../httpClient.config');
      const created = axios.create.mock.calls[0][0];
      expect(created.baseURL).toBe('https://example.test');
    });

    it('prefers process.env VITE_API_BASE_URL when present', () => {
      (process.env as any).VITE_API_BASE_URL = 'https://env.example/api';
      const axios = require('axios');
      require('../httpClient.config');
      const calledWith = axios.create.mock.calls[0][0];
      expect(calledWith.baseURL).toBe('https://env.example/api');
    });
  });

  describe('Request Interceptor', () => {
    it('adds _t timestamp param for GET requests', async () => {
      require('../httpClient.config');

      const req: any = { method: 'get', url: '/foo', params: { a: 1 } };
      const out = await requestHandlers.request!(req);

      expect((out as any).params).toBeDefined();
      expect((out as any).params._t).toBeDefined();
      expect((out as any).params.a).toBe(1);
    });

    it('adds x-csrf-token header for mutating methods', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({ data: { token: 'csrf-123' } });
      require('../httpClient.config');

      const req: any = { method: 'post', url: '/documents/create', headers: {} };
      const out = await requestHandlers.request!(req);

      expect((out as any).headers['x-csrf-token'] || (out as any).headers['X-CSRF-Token']).toBeDefined();
    });
  });

  describe('Error Handling - Response Interceptor', () => {
    it('handles 404 error', async () => {
      require('../httpClient.config');
      expect(capturedResponseErrorInterceptor).not.toBeNull();

      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
      };

      await expect(capturedResponseErrorInterceptor!(error)).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith('Resource not found');
    });

    it('handles 500 server error', async () => {
      require('../httpClient.config');

      const error = {
        response: {
          status: 500,
          data: { message: 'Internal server error' },
        },
      };

      await expect(capturedResponseErrorInterceptor!(error)).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith('Server error. Please try again later');
    });

    it('handles 502 bad gateway', async () => {
      require('../httpClient.config');

      const error = {
        response: {
          status: 502,
          data: {},
        },
      };

      await expect(capturedResponseErrorInterceptor!(error)).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith('Server error. Please try again later');
    });

    it('handles 503 service unavailable', async () => {
      require('../httpClient.config');

      const error = {
        response: {
          status: 503,
          data: {},
        },
      };

      await expect(capturedResponseErrorInterceptor!(error)).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith('Server error. Please try again later');
    });

    it('handles error.request (no response from server)', async () => {
      require('../httpClient.config');

      const error = {
        request: {},
        message: 'Network Error',
      };

      await expect(capturedResponseErrorInterceptor!(error)).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith('No response received from server');
    });

    it('handles setup error (no request or response)', async () => {
      require('../httpClient.config');

      const error = {
        message: 'Request setup failed',
      };

      await expect(capturedResponseErrorInterceptor!(error)).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith('Error setting up the request:', 'Request setup failed');
    });

    it('handles default error status', async () => {
      require('../httpClient.config');

      const error = {
        response: {
          status: 418,
          data: { error: 'Teapot error' },
        },
      };

      await expect(capturedResponseErrorInterceptor!(error)).rejects.toEqual(error);
      expect(console.error).toHaveBeenCalledWith('Request error:', { error: 'Teapot error' });
    });
  });

  describe('Authentication and Security', () => {
    it('handles 401 by removing localStorage and dispatching event', async () => {
      require('../httpClient.config');

      const removeSpy = jest.spyOn(Storage.prototype, 'removeItem');
      const dispatchSpy = jest.spyOn(window, 'dispatchEvent');

      const fakeError = { response: { status: 401, data: {} } };

      await (requestHandlers.response!(fakeError) as Promise<unknown>).catch(() => {});

      expect(removeSpy).toHaveBeenCalledWith('auth_user');
      expect(dispatchSpy).toHaveBeenCalled();

      removeSpy.mockRestore();
      dispatchSpy.mockRestore();
    });

    it('handles 403 EBADCSRFTOKEN by attempting to fetch new token', async () => {
      const axios = require('axios');
      axios.get.mockResolvedValueOnce({ data: { token: 'new-token' } });

      require('../httpClient.config');

      const fakeError = { 
        response: { 
          status: 403, 
          data: { code: 'EBADCSRFTOKEN', message: 'CSRF invalid' } 
        } 
      };

      await (requestHandlers.response!(fakeError) as Promise<unknown>).catch(() => {});

      expect(axios.get).toHaveBeenCalled();
    });
  });
});
