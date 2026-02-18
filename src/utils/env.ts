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
    // Prefer explicit process.env overrides in Jest tests when provided
    // Prefer explicit process.env overrides in Jest tests when provided
    try {
      // First try the real process.env
      if (typeof process !== 'undefined' && process.env && key in process.env) {
        return (process.env as Record<string, string>)[key];
      }
    } catch {
      // ignore
    }

    // Then try any test-provided global process replacement (some tests replace globalThis.process)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maybeGlobalProcess = (globalThis as any).process as { env?: Record<string, string> } | undefined;
      if (maybeGlobalProcess && maybeGlobalProcess.env && key in maybeGlobalProcess.env) {
        return maybeGlobalProcess.env[key] as string;
      }
    } catch {
      // ignore
    }

    if (key === 'VITE_API_BASE_URL') {
      return 'http://localhost:4000/api';
    }
    return undefined;
  }

  // Only reference import.meta inside a function, never at top level
  function getViteEnv() {
    // @ts-expect-error -- import.meta.env access allowed at runtime in Vite-built environment
    if (typeof window !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
      // @ts-expect-error -- import.meta.env access allowed at runtime in Vite-built environment
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
