import { getViteEnvVar } from '../env';

// Mock global and process
const originalProcess = global.process;
const originalWindow = global.window;

// Mock import.meta for Jest
const mockImportMeta = {
  env: {}
};

// Mock the global import.meta
Object.defineProperty(global, 'importMeta', {
  value: mockImportMeta,
  writable: true,
  configurable: true
});

describe('getViteEnvVar', () => {
  afterEach(() => {
    // Restore original globals
    global.process = originalProcess;
    global.window = originalWindow;
    delete (global as any).importMetaEnv;
    mockImportMeta.env = {};
  });

  describe('Jest environment (JEST_WORKER_ID present)', () => {
    beforeEach(() => {
      // Mock Jest environment
      global.process = {
        ...originalProcess,
        env: {
          ...originalProcess?.env,
          JEST_WORKER_ID: '1'
        }
      } as any;
    });

    it('should return value from global.importMetaEnv when key exists', () => {
      // Set up global.importMetaEnv
      (global as any).importMetaEnv = {
        VITE_API_URL: 'https://test-api.example.com'
      };

      const result = getViteEnvVar('VITE_API_URL');
      
      expect(result).toBe('https://test-api.example.com');
    });

    it('should return default API URL for VITE_API_BASE_URL in Jest', () => {
      const result = getViteEnvVar('VITE_API_BASE_URL');
      
      expect(result).toBe('http://localhost:4000/api');
    });

    it('should return undefined for non-existent key in Jest', () => {
      const result = getViteEnvVar('NON_EXISTENT_KEY');
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when global.importMetaEnv is not set', () => {
      // Don't set global.importMetaEnv
      const result = getViteEnvVar('SOME_KEY');
      
      expect(result).toBeUndefined();
    });

    it('should prioritize global.importMetaEnv over fallback', () => {
      (global as any).importMetaEnv = {
        VITE_TEST_VAR: 'global-value'
      };

      const result = getViteEnvVar('VITE_TEST_VAR');
      
      expect(result).toBe('global-value');
    });
  });

  describe('Node.js environment fallback', () => {
    beforeEach(() => {
      // Mock Node.js environment without Jest
      global.process = {
        ...originalProcess,
        env: {
          NODE_ENV: 'test',
          CUSTOM_VAR: 'custom-value'
        }
      } as any;
      delete (global.process as any).env.JEST_WORKER_ID;

      // No window
      delete (global as any).window;
    });

    it('should return value from process.env when key exists', () => {
      const result = getViteEnvVar('CUSTOM_VAR');
      
      expect(result).toBe('custom-value');
    });

    it('should return undefined for non-existent key in process.env', () => {
      const result = getViteEnvVar('NON_EXISTENT_VAR');
      
      expect(result).toBeUndefined();
    });

    it('should return NODE_ENV from process.env', () => {
      const result = getViteEnvVar('NODE_ENV');
      
      expect(result).toBe('test');
    });
  });

  describe('No environment available', () => {
    beforeEach(() => {
      // Mock environment with no process or window
      delete (global as any).process;
      delete (global as any).window;
    });

    it('should return undefined when no environment is available', () => {
      const result = getViteEnvVar('ANY_KEY');
      
      expect(result).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    beforeEach(() => {
      // Set up basic process for edge cases
      global.process = {
        ...originalProcess,
        env: {}
      } as any;
      delete (global.process as any).env.JEST_WORKER_ID;
    });

    it('should handle empty string key', () => {
      (global.process as any).env[''] = 'empty-key-value';

      const result = getViteEnvVar('');
      
      expect(result).toBe('empty-key-value');
    });

    it('should handle special characters in key', () => {
      (global.process as any).env['VITE_API_URL_2024'] = 'special-key-value';

      const result = getViteEnvVar('VITE_API_URL_2024');
      
      expect(result).toBe('special-key-value');
    });

    it('should handle undefined key parameter', () => {
      const result = getViteEnvVar(undefined as any);
      
      expect(result).toBeUndefined();
    });
  });

  describe('Complex environment scenarios', () => {
    it('should work with mixed environment variables', () => {
      global.process = {
        ...originalProcess,
        env: {
          VITE_APP_VERSION: '1.0.0',
          NODE_ENV: 'production',
          CUSTOM_SETTING: 'enabled'
        }
      } as any;

      expect(getViteEnvVar('VITE_APP_VERSION')).toBe('1.0.0');
      expect(getViteEnvVar('NODE_ENV')).toBe('production');
      expect(getViteEnvVar('CUSTOM_SETTING')).toBe('enabled');
      expect(getViteEnvVar('NON_EXISTENT')).toBeUndefined();
    });

    it('should handle numeric-like environment values', () => {
      global.process = {
        ...originalProcess,
        env: {
          VITE_PORT: '3000',
          VITE_DEBUG: 'true',
          VITE_TIMEOUT: '0'
        }
      } as any;

      expect(getViteEnvVar('VITE_PORT')).toBe('3000');
      expect(getViteEnvVar('VITE_DEBUG')).toBe('true');
      expect(getViteEnvVar('VITE_TIMEOUT')).toBe('0');
    });
  });
});