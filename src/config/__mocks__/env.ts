/**
 * Mock de configuración de entorno para tests
 * Jest usa este archivo en lugar del real cuando ejecuta tests
 */

// En tests, usar process.env que Jest puede configurar
type ViteEnvMock = { VITE_API_BASE_URL?: string; VITE_APP_ENV?: string };
const globalVite = (globalThis as unknown as { __VITE_ENV__?: ViteEnvMock }).__VITE_ENV__ || {};
const nodeEnv = process.env as NodeJS.ProcessEnv;
export const API_BASE_URL = nodeEnv.VITE_API_BASE_URL || globalVite.VITE_API_BASE_URL || 'http://localhost:4000/api';
export const REQUEST_TIMEOUT_MS = 30000;
export const APP_ENV = nodeEnv.VITE_APP_ENV || globalVite.VITE_APP_ENV || 'test';
