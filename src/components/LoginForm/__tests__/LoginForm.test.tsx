import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../LoginForm';
import { useAuth } from '../../../hooks/useAuth';
import { usePageTitle } from '../../../hooks/usePageInfoTitle';
import { useFormValidation } from '../../../hooks/useFormValidation';
import axios from 'axios';

// Mocks
jest.mock('../../../hooks/useAuth');
jest.mock('../../../hooks/usePageInfoTitle');
jest.mock('../../../hooks/useFormValidation');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

// Mock axios
jest.mock('axios', () => ({
  isAxiosError: jest.fn(),
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUsePageTitle = usePageTitle as jest.MockedFunction<typeof usePageTitle>;
const mockUseFormValidation = useFormValidation as jest.MockedFunction<typeof useFormValidation>;
const mockAxiosIsAxiosError = axios.isAxiosError as jest.MockedFunction<typeof axios.isAxiosError>;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }: any) => <a href={to} {...props}>{children}</a>
}));

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('LoginForm', () => {
  const mockLogin = jest.fn();
  const mockValidateEmail = jest.fn();
  const mockSetFieldError = jest.fn();
  const mockClearFieldError = jest.fn();
  const mockHandleBlur = jest.fn();

  const defaultFormValidation = {
    validateEmail: mockValidateEmail,
    setFieldError: mockSetFieldError,
    clearFieldError: mockClearFieldError,
    errors: {},
    handleBlur: mockHandleBlur,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
    });

    mockUsePageTitle.mockReturnValue(undefined);
    
    mockUseFormValidation.mockReturnValue(defaultFormValidation);
    
    mockAxiosIsAxiosError.mockReturnValue(false);
  });

  describe('Component Rendering', () => {
    it('should render the login form with all elements', () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      // Header elements
      expect(screen.getByText('CloudDocs Copilot')).toBeInTheDocument();
      expect(screen.getByText('Gestión documental inteligente con IA')).toBeInTheDocument();

      // Form elements - use more specific selectors to avoid multiple matches
      expect(screen.getByText('CloudDocs Copilot')).toBeInTheDocument();
      expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
      expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();

      // Links
      expect(screen.getByText('¿Olvidaste tu contraseña?')).toBeInTheDocument();
      expect(screen.getByText('Regístrate aquí')).toBeInTheDocument();

      // Footer
      expect(screen.getByText('© 2026 CloudDocs Copilot')).toBeInTheDocument();
    });

    it('should call usePageTitle with correct parameters', () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      expect(mockUsePageTitle).toHaveBeenCalledWith({
        title: 'Login',
        subtitle: 'Login',
        documentTitle: 'Inicio de sesión',
        metaDescription: 'Página de inicio de sesión para CloudDocs Copilot'
      });
    });

    it('should render form inputs with correct attributes', () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Correo electrónico');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'tu@email.com');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');

      const passwordInput = screen.getByLabelText('Contraseña');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('placeholder', '••••••••');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });
  });

  describe('Form Input Handling', () => {
    it('should update email state when typing', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Correo electrónico');
      
      await user.type(emailInput, 'test@example.com');
      
      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should update password state when typing', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText('Contraseña');
      
      await user.type(passwordInput, 'testpassword');
      
      expect(passwordInput).toHaveValue('testpassword');
    });

    it('should call handleBlur when email input loses focus', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Correo electrónico');
      
      await user.type(emailInput, 'test@example.com');
      await user.tab(); // Move focus away from input
      
      expect(mockHandleBlur).toHaveBeenCalledWith('email', 'test@example.com');
    });

    it('should call handleBlur when password input loses focus', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText('Contraseña');
      
      await user.type(passwordInput, 'testpass');
      await user.tab(); // Move focus away from input
      
      expect(mockHandleBlur).toHaveBeenCalledWith('password', 'testpass');
    });
  });

  describe('Form Validation', () => {
    it('should display email error when validation fails', () => {
      mockUseFormValidation.mockReturnValue({
        ...defaultFormValidation,
        errors: { email: 'Ingresa un correo válido.' }
      });

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      expect(screen.getByText('Ingresa un correo válido.')).toBeInTheDocument();
    });

    it('should display password error when validation fails', () => {
      mockUseFormValidation.mockReturnValue({
        ...defaultFormValidation,
        errors: { password: 'Ingresa tu contraseña.' }
      });

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      expect(screen.getByText('Ingresa tu contraseña.')).toBeInTheDocument();
    });

    it('should validate email on form submission', async () => {
      const user = userEvent.setup();
      mockValidateEmail.mockReturnValue(false);

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Correo electrónico');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'Invalid-Email@Example.com');
      
      await act(async () => {
        await user.click(submitButton);
      });

      expect(mockValidateEmail).toHaveBeenCalledWith('invalid-email@example.com');
      expect(mockSetFieldError).toHaveBeenCalledWith('email', 'Ingresa un correo válido.');
    });

    it('should validate password on form submission', async () => {
      const user = userEvent.setup();
      mockValidateEmail.mockReturnValue(true);

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Correo electrónico');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      // Don't type password (leave empty)
      await user.click(submitButton);

      expect(mockSetFieldError).toHaveBeenCalledWith('password', 'Ingresa tu contraseña.');
    });

    it('should clear field errors when validation passes', async () => {
      const user = userEvent.setup();
      mockValidateEmail.mockReturnValue(true);

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(mockClearFieldError).toHaveBeenCalledWith('email');
      expect(mockClearFieldError).toHaveBeenCalledWith('password');
    });
  });

  describe('Form Submission', () => {
    it('should prevent submission with invalid email', async () => {
      const user = userEvent.setup();
      mockValidateEmail.mockReturnValue(false);

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should prevent submission with empty password', async () => {
      const user = userEvent.setup();
      mockValidateEmail.mockReturnValue(true);

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Correo electrónico');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      // Don't fill password
      await user.click(submitButton);

      expect(mockLogin).not.toHaveBeenCalled();
    });

    it('should submit form with valid credentials', async () => {
      const user = userEvent.setup();
      mockValidateEmail.mockReturnValue(true);
      mockLogin.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'Test@Example.com');
      await user.type(passwordInput, 'password123');
      
      await act(async () => {
        await user.click(submitButton);
      });

      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should navigate to dashboard on successful login', async () => {
      const user = userEvent.setup();
      mockValidateEmail.mockReturnValue(true);
      mockLogin.mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockValidateEmail.mockReturnValue(true);
      
      // Make login take some time
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      
      await user.click(submitButton);

      // Check loading state
      expect(screen.getByRole('button', { name: /ingresando/i })).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display server error on login failure', async () => {
      const user = userEvent.setup();
      mockValidateEmail.mockReturnValue(true);
      mockLogin.mockRejectedValue(new Error('Login failed'));

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      
      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Ocurrió un error inesperado. Intenta de nuevo.')).toBeInTheDocument();
      });
    });

    it('should clear server error on new submission', async () => {
      const user = userEvent.setup();
      mockValidateEmail.mockReturnValue(true);
      mockLogin.mockRejectedValue(new Error('Login failed'));

      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText('Correo electrónico');
      const passwordInput = screen.getByLabelText('Contraseña');
      const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

      // First failed attempt
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Ocurrió un error inesperado. Intenta de nuevo.')).toBeInTheDocument();
      });

      // Second attempt - error should be cleared
      mockLogin.mockResolvedValue(undefined);
      await user.clear(passwordInput);
      await user.type(passwordInput, 'correctpassword');
      
      await act(async () => {
        await user.click(submitButton);
      });

      // Error should be gone
      expect(screen.queryByText('Ocurrió un error inesperado. Intenta de nuevo.')).not.toBeInTheDocument();
    });
  });

  describe('Links and Navigation', () => {
    it('should render forgot password link correctly', () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const forgotLink = screen.getByText('¿Olvidaste tu contraseña?');
      expect(forgotLink).toHaveAttribute('href', '/auth/forgot-password');
    });

    it('should render register link correctly', () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const registerLink = screen.getByText('Regístrate aquí');
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  describe('Checkbox Functionality', () => {
    it('should render remember me checkbox', () => {
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Recordarme')).toBeInTheDocument();
      expect(screen.getByRole('checkbox')).toBeInTheDocument();
    });

    it('should handle checkbox interaction', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <LoginForm />
        </TestWrapper>
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });
});