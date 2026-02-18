import { API_BASE_URL, REQUEST_TIMEOUT_MS, APP_ENV } from '../env';

describe('Environment Configuration', () => {
  it('should export API_BASE_URL', () => {
    expect(API_BASE_URL).toBeDefined();
    expect(typeof API_BASE_URL).toBe('string');
  });

  it('should export REQUEST_TIMEOUT_MS', () => {
    expect(REQUEST_TIMEOUT_MS).toBeDefined();
    expect(typeof REQUEST_TIMEOUT_MS).toBe('number');
    expect(REQUEST_TIMEOUT_MS).toBe(30000);
  });

  it('should export APP_ENV', () => {
    expect(APP_ENV).toBeDefined();
    expect(typeof APP_ENV).toBe('string');
  });

  it('should use mock values in test environment', () => {
    // En tests, el mock usa process.env o valores por defecto
    // Este test verifica que estamos usando el mock correctamente
    expect(API_BASE_URL).toBe(process.env.VITE_API_BASE_URL || 'http://localhost:4000/api');
  });

  it('should allow process.env override in tests', async () => {
    // Simular cambio de variable de entorno
    const originalEnv = process.env;
    // Replace process.env for this test in a type-safe way (avoid `any`)
    Object.defineProperty(process as unknown as { env: NodeJS.ProcessEnv }, 'env', {
      value: { ...originalEnv, VITE_API_BASE_URL: 'http://custom-test-url.com/api' },
      configurable: true,
    });

    // Re-importar el módulo para que tome el nuevo valor
    jest.resetModules();
    const { API_BASE_URL: newUrl } = await import('../env');

    expect(newUrl).toBe('http://custom-test-url.com/api');

    // Restaurar valor original
    Object.defineProperty(process as unknown as { env: NodeJS.ProcessEnv }, 'env', {
      value: originalEnv,
      configurable: true,
    });
    jest.resetModules();
  });
});
