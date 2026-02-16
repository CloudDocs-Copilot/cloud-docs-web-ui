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
    // @ts-ignore
    return globalThis.__CONSOLE_ERROR_ORIG__
      ? globalThis.__CONSOLE_ERROR_ORIG__.call(console, msg, ...args)
      : undefined;
  });
});

afterAll(() => {
  // Restore original error if needed
  if (globalThis.__CONSOLE_ERROR_ORIG__) {
    // @ts-ignore
    console.error = globalThis.__CONSOLE_ERROR_ORIG__;
  }
});

// Save original error for restoration
if (!globalThis.__CONSOLE_ERROR_ORIG__) {
  // @ts-ignore
  globalThis.__CONSOLE_ERROR_ORIG__ = console.error;
}
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
    // @ts-ignore
    return globalThis.__CONSOLE_WARN_ORIG__
      ? globalThis.__CONSOLE_WARN_ORIG__.call(console, msg, ...args)
      : undefined;
  });
});

afterAll(() => {
  // Restore original warn if needed
  if (globalThis.__CONSOLE_WARN_ORIG__) {
    // @ts-ignore
    console.warn = globalThis.__CONSOLE_WARN_ORIG__;
  }
});

// Save original warn for restoration
if (!globalThis.__CONSOLE_WARN_ORIG__) {
  // @ts-ignore
  globalThis.__CONSOLE_WARN_ORIG__ = console.warn;
}
