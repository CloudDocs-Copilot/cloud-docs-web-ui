import '@testing-library/jest-dom';

// Mock simple de import.meta para evitar errores de TS
interface ImportMeta {
  env: Record<string, string>;
}

interface GlobalThisWithImport {
  import?: {
    meta: ImportMeta;
  };
}

(globalThis as unknown as GlobalThisWithImport).import = {
  meta: {
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000/api',
    },
  },
};

// Definir process.env globalmente para tests
interface GlobalThisWithProcess {
  process?: {
    env: Record<string, string | undefined>;
  };
}

if (!(globalThis as GlobalThisWithProcess).process) {
  (globalThis as GlobalThisWithProcess).process = {
    env: {
      VITE_API_BASE_URL: 'http://localhost:3000/api',
    },
  };
}
