import '@testing-library/jest-dom';

// Mock simple de import.meta para evitar errores de TS
// Usamos (globalThis as any) para evitar errores de tipado estricto
(globalThis as any).import = {
  meta: {
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000/api',
    },
  },
};
