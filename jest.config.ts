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
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  // allow transforming certain ESM packages in node_modules (eg. uuid)
  transformIgnorePatterns: [
    '/node_modules/(?!uuid)'
  ],
  // Define globals to replace import.meta.env
  globals: {
    'import.meta': {
      env: {
        VITE_API_BASE_URL: 'http://localhost:4000/api',
      },
    },
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
  ],
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],
};

export default config;
