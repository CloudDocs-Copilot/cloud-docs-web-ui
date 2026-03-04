import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import LoginForm from '../LoginForm';
import * as AuthHook from '../../../hooks/useAuth';

jest.mock('../../../hooks/usePageInfoTitle', () => ({ 
  usePageTitle: jest.fn() 
}));

jest.mock('../../../hooks/useFormValidation', () => ({
  useFormValidation: () => ({
    validateEmail: (v: string) => v.includes('@'),
    setFieldError: jest.fn(),
    clearFieldError: jest.fn(),
    errors: {},
    handleBlur: jest.fn(),
  }),
}));

jest.mock('../../../hooks/useAuth', () => ({ 
  useAuth: jest.fn() 
}));

describe('LoginForm', () => {
  afterEach(() => jest.resetAllMocks());

  function fillAndSubmit(email: string, password: string) {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>
    );
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { 
      target: { value: email } 
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), { 
      target: { value: password } 
    });
    fireEvent.click(screen.getByRole('button', { name: /Iniciar sesión/i }));
  }

  // ==================== Form Validation ====================
  describe('Form validation', () => {
    it('shows validation errors and does not call login', async () => {
      const loginMock = jest.fn();
      (AuthHook.useAuth as jest.Mock).mockReturnValue({ login: loginMock });

      const mockValidation = jest.fn().mockReturnValue({
        validateEmail: () => false,
        setFieldError: jest.fn(),
        clearFieldError: jest.fn(),
        errors: { email: 'Invalid email' },
        handleBlur: jest.fn(),
      });
      
      jest.doMock('../../../hooks/useFormValidation', () => ({
        useFormValidation: mockValidation
      }));

      fillAndSubmit('bad-email', 'pass');

      await waitFor(() => {
        expect(loginMock).not.toHaveBeenCalled();
      });
      
      jest.dontMock('../../../hooks/useFormValidation');
    });
  });

  // ==================== HTTP Error Handling ====================
  describe('HTTP error handling', () => {
    it('shows friendly message for 400 missing required fields', async () => {
      interface MockAxiosError extends Error {
        isAxiosError: boolean;
        response?: { status: number; data?: { message?: string } };
        code?: string;
        config?: { url?: string; baseURL?: string };
      }

      const error = new Error('bad') as unknown as MockAxiosError;
      error.isAxiosError = true;
      error.response = { 
        status: 400, 
        data: { message: 'Missing required fields' } 
      };
      const loginMock = jest.fn(() => { throw error; });
      (AuthHook.useAuth as jest.Mock).mockReturnValue({ login: loginMock });

      fillAndSubmit('a@b.com', 'pass');
      
      await waitFor(() => {
        expect(screen.getByText(/Completa tu correo y contraseña/i)).toBeInTheDocument();
      });
    });

    it('shows server validation message on 400', async () => {
      interface MockAxiosError extends Error {
        isAxiosError: boolean;
        response?: { status: number; data?: { message?: string } };
      }
      const error = new Error('validation') as unknown as MockAxiosError;
      error.isAxiosError = true;
      error.response = { 
        status: 400, 
        data: { message: 'Invalid credentials format' } 
      };
      const loginMock = jest.fn(() => { throw error; });
      (AuthHook.useAuth as jest.Mock).mockReturnValue({ login: loginMock });

      fillAndSubmit('test@test.com', 'password');
      
      await waitFor(() => {
        expect(screen.getByText(/Revisa los datos ingresados/i)).toBeInTheDocument();
      });
    });

    it('shows server error message for axios 401', async () => {
      interface MockAxiosError extends Error {
        isAxiosError: boolean;
        response?: { status: number; data?: { message?: string } };
      }
      const error = new Error('unauthorized') as unknown as MockAxiosError;
      error.isAxiosError = true;
      error.response = { 
        status: 401, 
        data: { message: 'Invalid credentials' } 
      };
      const loginMock = jest.fn(() => { throw error; });
      (AuthHook.useAuth as jest.Mock).mockReturnValue({ login: loginMock });

      fillAndSubmit('user@example.com', 'wrongpwd');
      
      await waitFor(() => {
        expect(screen.getByText(/Correo o contraseña incorrectos/i)).toBeInTheDocument();
      });
    });

    it('maps 404 from auth/login to credentials error', async () => {
      interface MockAxiosError extends Error {
        isAxiosError: boolean;
        response?: { status: number };
        config?: { url?: string; baseURL?: string };
      }
      const error = new Error('not found') as unknown as MockAxiosError;
      error.isAxiosError = true;
      error.response = { status: 404 };
      error.config = { url: '/auth/login', baseURL: 'http://api' };
      const loginMock = jest.fn(() => { throw error; });
      (AuthHook.useAuth as jest.Mock).mockReturnValue({ login: loginMock });

      fillAndSubmit('x@y.com', 'pwd');
      
      await waitFor(() => {
        expect(screen.getByText(/Correo o contraseña incorrectos/i)).toBeInTheDocument();
      });
    });

    it('maps 500+ to server error message', async () => {
      interface MockAxiosError extends Error {
        isAxiosError: boolean;
        response?: { status: number };
      }
      const error = new Error('server') as unknown as MockAxiosError;
      error.isAxiosError = true;
      error.response = { status: 502 };
      const loginMock = jest.fn(() => { throw error; });
      (AuthHook.useAuth as jest.Mock).mockReturnValue({ login: loginMock });

      fillAndSubmit('u@v.com', 'pwd');
      
      await waitFor(() => {
        expect(screen.getByText(/El servidor tuvo un problema/i)).toBeInTheDocument();
      });
    });
  });

  // ==================== Network Errors ====================
  describe('Network errors', () => {
    it('shows network error message when network fails', async () => {
      interface MockAxiosError extends Error {
        isAxiosError: boolean;
        code?: string;
      }
      const error = new Error('Network Error') as unknown as MockAxiosError;
      error.isAxiosError = true;
      error.code = 'ERR_NETWORK';
      const loginMock = jest.fn(() => { throw error; });
      (AuthHook.useAuth as jest.Mock).mockReturnValue({ login: loginMock });

      fillAndSubmit('test@x.com', 'pwd');
      
      await waitFor(() => {
        expect(screen.getByText(/No se pudo conectar con el servidor/i)).toBeInTheDocument();
      });
    });

    it('handles generic network error', async () => {
      interface MockAxiosError extends Error {
        isAxiosError: boolean;
        code?: string;
      }
      const error = new Error('Connection refused') as unknown as MockAxiosError;
      error.isAxiosError = true;
      error.code = 'ECONNREFUSED';
      const loginMock = jest.fn(() => { throw error; });
      (AuthHook.useAuth as jest.Mock).mockReturnValue({ login: loginMock });

      fillAndSubmit('test@example.com', 'pwd123');
      
      await waitFor(() => {
        expect(screen.getByText(/No se pudo conectar con el servidor/i)).toBeInTheDocument();
      });
    });
  });

  // ==================== Unknown Errors ====================
  describe('Unknown errors', () => {
    it('shows fallback message for unknown non-axios error', async () => {
      const loginMock = jest.fn(() => { throw new Error('boom'); });
      (AuthHook.useAuth as jest.Mock).mockReturnValue({ login: loginMock });

      fillAndSubmit('a@b.c', 'p');
      
      await waitFor(() => {
        expect(screen.getByText(/Ocurrió un error inesperado/i)).toBeInTheDocument();
      });
    });
  });
});
