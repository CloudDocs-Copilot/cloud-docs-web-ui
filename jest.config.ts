import type { Config } from 'jest';


const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^uuid$': '<rootDir>/__mocks__/uuid.js',
    '^react-pdf$': '<rootDir>/__mocks__/react-pdf.js',
    '^react-syntax-highlighter$': '<rootDir>/__mocks__/react-syntax-highlighter.js',
    '^react-syntax-highlighter/dist/esm/styles/prism$': '<rootDir>/__mocks__/react-syntax-highlighter-styles.js',
    '^../utils/env$': '<rootDir>/__mocks__/utils/env.ts',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      }
    ],
  },
  transformIgnorePatterns: [
    '/node_modules/(?!uuid)'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    // exclude simple re-export index files which skew function coverage
    '!src/**/index.{ts,tsx}',
    '!src/**/index.ts',
    '!src/**/index.tsx',
  ],
  coverageReporters: ['text', 'lcov', 'json-summary'],
  testTimeout: 30000,
  coverageThreshold: {
    global: {
      branches: 59,
      functions: 69,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};

export default config;
