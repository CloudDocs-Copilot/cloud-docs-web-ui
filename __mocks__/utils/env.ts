// __mocks__/utils/env.ts
export function getViteEnvVar(key: string): string | undefined {
  // Mock values for Vite env variables used in tests
  if (key === 'VITE_API_BASE_URL') return 'http://localhost:4000/api';
  if (key === 'VITE_PREVIEW_WORKER_URL') return '/pdf.worker.min.mjs';
  return undefined;
}
