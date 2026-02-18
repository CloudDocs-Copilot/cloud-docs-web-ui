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
    // @ts-expect-error -- restore original console.error if previously saved
    return globalThis.__CONSOLE_ERROR_ORIG__
      ? globalThis.__CONSOLE_ERROR_ORIG__.call(console, msg, ...args)
      : undefined;
  });
});

afterAll(() => {
  // Restore original error if needed
  if (globalThis.__CONSOLE_ERROR_ORIG__) {
    // @ts-expect-error -- restore original console.error saved earlier
    console.error = globalThis.__CONSOLE_ERROR_ORIG__;
  }
});

// Save original error for restoration
if (!globalThis.__CONSOLE_ERROR_ORIG__) {
  // @ts-expect-error -- save original console.error for later restoration
  globalThis.__CONSOLE_ERROR_ORIG__ = console.error;
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
    // @ts-expect-error -- restore original console.warn if previously saved
    return globalThis.__CONSOLE_WARN_ORIG__
      ? globalThis.__CONSOLE_WARN_ORIG__.call(console, msg, ...args)
      : undefined;
  });
});

afterAll(() => {
  // Restore original warn if needed
  if (globalThis.__CONSOLE_WARN_ORIG__) {
    // @ts-expect-error -- restore original console.warn saved earlier
    console.warn = globalThis.__CONSOLE_WARN_ORIG__;
  }
});

// Save original warn for restoration
if (!globalThis.__CONSOLE_WARN_ORIG__) {
  // @ts-expect-error -- save original console.warn for later restoration
  globalThis.__CONSOLE_WARN_ORIG__ = console.warn;
}
