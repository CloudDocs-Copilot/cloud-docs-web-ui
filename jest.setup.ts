// Provide typings for globals used in this test setup
declare global {
  interface GlobalThis {
    __CONSOLE_ERROR_ORIG__?: typeof console.error;
    __CONSOLE_WARN_ORIG__?: typeof console.warn;
    import?: { meta: { env: Record<string, string> } };
    process?: { env: Record<string, string | undefined> };
  }
}

// Silence React act(...) and resource loading errors in tests
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((msg, ...args) => {
    if (
      typeof msg === 'string' &&
      (
        msg.includes('An update to') && msg.includes('inside a test was not wrapped in act') ||
        msg.includes('Error loading image:') ||
        msg.includes('Error loading video:') ||
        msg.includes('Error loading text file:')
      )
    ) {
      return;
    }
    const origError = (globalThis as unknown as GlobalThis).__CONSOLE_ERROR_ORIG__;
    return origError ? origError.call(console, msg, ...args) : undefined;
  });
});

afterAll(() => {
  // Restore original error if needed
  const origError = (globalThis as unknown as GlobalThis).__CONSOLE_ERROR_ORIG__;
  if (origError) {
    console.error = origError;
  }
});

// Save original error for restoration
const globalThisTyped = globalThis as unknown as GlobalThis;
if (!globalThisTyped.__CONSOLE_ERROR_ORIG__) {
  globalThisTyped.__CONSOLE_ERROR_ORIG__ = console.error;
}
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

// Definir `process.env` globalmente para tests (restaurado tras merge)
interface GlobalThisWithProcess {
  process?: {
    env: Record<string, string | undefined>;
  };
}

if (!(globalThis as GlobalThisWithProcess).process) {
  (globalThis as GlobalThisWithProcess).process = {
    env: {
      VITE_API_BASE_URL: 'http://localhost:4000/api',
      VITE_PREVIEW_WORKER_URL: '/pdf.worker.min.mjs',
    },
  };
}
// Silence React Router v7 future flag warnings in tests
beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((msg, ...args) => {
    if (
      typeof msg === 'string' &&
      (msg.includes('React Router Future Flag Warning') ||
        msg.includes('Relative route resolution within Splat routes is changing in v7'))
    ) {
      return;
    }
    const origWarn = (globalThis as unknown as GlobalThis).__CONSOLE_WARN_ORIG__;
    return origWarn ? origWarn.call(console, msg, ...args) : undefined;
  });
});

afterAll(() => {
  // Restore original warn if needed
  const origWarn = (globalThis as unknown as GlobalThis).__CONSOLE_WARN_ORIG__;
  if (origWarn) {
    console.warn = origWarn;
  }
});

// Save original warn for restoration
const globalThisTypedWarn = globalThis as unknown as GlobalThis;
if (!globalThisTypedWarn.__CONSOLE_WARN_ORIG__) {
  globalThisTypedWarn.__CONSOLE_WARN_ORIG__ = console.warn;
}
