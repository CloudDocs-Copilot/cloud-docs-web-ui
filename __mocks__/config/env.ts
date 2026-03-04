// Test mock for src/config/env.ts — derive default values from process.env so
// tests that reassign `process.env` and call `jest.resetModules()` observe
// the override when re-importing the module.
export const API_BASE_URL: string = process.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
export const REQUEST_TIMEOUT_MS: number =
	typeof process.env.VITE_REQUEST_TIMEOUT_MS !== 'undefined'
		? Number(process.env.VITE_REQUEST_TIMEOUT_MS)
		: 30000;
export const APP_ENV: string = process.env.APP_ENV || 'test';
