import { API_BASE_URL } from '../config/env';

/**
 * Helper to safely access Vite env variables in any environment (Vite, Jest, Node).
 * Delegates the canonical API URL to `src/config/env.ts` and falls back to
 * other sources for non-API keys.
 */
export function getViteEnvVar(key: string): string | undefined {
  if (key === 'VITE_API_BASE_URL') return API_BASE_URL;

  // Jest / Node: prefer explicit process.env overrides
  try {
    if (typeof process !== 'undefined' && process.env && key in process.env) {
      return (process.env as Record<string, string>)[key];
    }
  } catch {
    // ignore
  }

  // Some tests may expose a global import-like shim
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const maybeGlobal = (globalThis as any).importMetaEnv as Record<string, string> | undefined;
    if (maybeGlobal && key in maybeGlobal) return maybeGlobal[key];
  } catch {
    // ignore
  }

  // Runtime Vite environment (only when built by Vite)
  try {
    // Access import.meta.env only at runtime inside the function
    // @ts-expect-error -- runtime access to import.meta in Vite-built environment
    const im = import.meta;
    // @ts-expect-error -- import.meta.env is only available in Vite runtime
    if (im && im.env && key in im.env) {
      // @ts-expect-error -- import.meta.env is only available in Vite runtime
      return im.env[key];
    }
  } catch {
    // ignore
  }

  return undefined;
}
