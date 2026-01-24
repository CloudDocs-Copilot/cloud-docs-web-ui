// src/services/api.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let cachedCsrfToken: string | null = null;

/**
 * Pide token CSRF al backend y lo cachea en memoria.
 * Importante: credentials: "include" para que el backend pueda setear la cookie CSRF.
 */
export async function getCsrfToken(): Promise<string> {
  if (cachedCsrfToken) return cachedCsrfToken;

  const resp = await fetch(`${API_URL}/api/csrf-token`, {
    method: "GET",
    credentials: "include",
  });

  if (!resp.ok) {
    throw new Error(`CSRF token request failed (${resp.status})`);
  }

  const data = (await resp.json()) as { token: string };
  cachedCsrfToken = data.token;
  return cachedCsrfToken;
}

/**
 * Wrapper de fetch que:
 * - siempre manda cookies (credentials include)
 * - para métodos mutables agrega x-csrf-token
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (isMutating) {
    const csrf = await getCsrfToken();
    headers.set("x-csrf-token", csrf);
  }

  const resp = await fetch(`${API_URL}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  // intenta parsear JSON aunque sea error
  const text = await resp.text();
  const json = text ? JSON.parse(text) : null;

  if (!resp.ok) {
    const msg = json?.error || json?.message || `Request failed (${resp.status})`;
    throw new Error(msg);
  }

  return json as T;
}
