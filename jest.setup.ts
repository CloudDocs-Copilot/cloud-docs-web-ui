import '@testing-library/jest-dom';

// Mock de import.meta para Jest
globalThis.import = {
  meta: {
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000/api',
    },
  },
} as any;
