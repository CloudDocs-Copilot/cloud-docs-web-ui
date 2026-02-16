// Type declaration for global.importMetaEnv to fix implicit 'any' errors
declare global {
  // eslint-disable-next-line no-var
  var importMetaEnv: { [key: string]: string } | undefined;
}
// src/utils/env.ts

/**
 * Helper to safely access Vite env variables in any environment (Vite, Jest, Node).
 * Returns undefined if not available.
 */
export function getViteEnvVar(key: string): string | undefined {
  // Acceso seguro a import.meta.env solo si el entorno lo permite
  // Jest: mock import.meta.env
  if (typeof process !== 'undefined' && process.env && process.env.JEST_WORKER_ID) {
    if (typeof global !== 'undefined' && global.importMetaEnv && key in global.importMetaEnv) {
      return global.importMetaEnv[key];
    }
    if (key === 'VITE_API_BASE_URL') {
      return 'http://localhost:4000/api';
    }
    return undefined;
  }

  // Only reference import.meta inside a function, never at top level
  function getViteEnv() {
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
      // @ts-ignore
      return import.meta.env[key];
    }
    return undefined;
  }

  // Try to get from Vite env
  const viteEnv = getViteEnv();
  if (viteEnv !== undefined) {
    return viteEnv;
  }

  // Node.js fallback (for tests or SSR)
  if (typeof process !== 'undefined' && typeof process.env !== 'undefined' && key in process.env) {
    return (process.env as Record<string, string>)[key];
  }
  return undefined;
}
