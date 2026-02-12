// Test helpers: relax typings for test-only imports and globals
declare module '*.module.css';
declare module '*.css';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';

// Allow importing JSON-like or mock modules without types in tests
declare module '__mocks__/*';

// Provide a permissive fetch/global for tests
declare namespace NodeJS {
  interface Global {
    fetch?: typeof fetch;
  }
}

// Jest globals are typed via @types/jest; provide fallback for any test helper
declare const __TEST__: boolean;
