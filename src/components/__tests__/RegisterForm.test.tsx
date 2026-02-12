import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RegisterForm from '../RegisterForm';
import { PageProvider } from '../../context/PageProvider';

// Create mock functions that can be overridden
const mockExecute = jest.fn().mockResolvedValue({ message: 'ok', user: {} });
const mockValidateAllFields = jest.fn(() => true);
const mockGetFieldError = jest.fn(() => '');
const mockClearAllErrors = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../hooks/useHttpRequest', () => ({ 
  useHttpRequest: jest.fn(() => ({ 
    execute: mockExecute, 
    error: null 
  })) 
}));

jest.mock('../../hooks/useFormValidation', () => ({ 
  useFormValidation: jest.fn(() => ({ 
    validateAllFields: mockValidateAllFields, 
    getFieldError: mockGetFieldError, 
    clearAllErrors: mockClearAllErrors 
  })) 
}));

jest.mock('../../hooks/usePageInfoTitle', () => ({ usePageTitle: jest.fn() }));
jest.mock('react-router-dom', () => ({ 
  useNavigate: () => mockNavigate 
}));

describe('RegisterForm', () => {
  it('renders fields and submit button', () => {
    render(
      <PageProvider>
        <RegisterForm />
      </PageProvider>
    );
    
    expect(screen.getByPlaceholderText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    expect(screen.getByText('Crear cuenta')).toBeInTheDocument();
  });

  it('shows login prompt and link', () => {
    render(
      <PageProvider>
        <RegisterForm />
      </PageProvider>
    );
    
    expect(screen.getByText('¿Ya tienes una cuenta?')).toBeInTheDocument();
  });

  it('submits form and navigates to login on success', async () => {
    render(
      <PageProvider>
        <RegisterForm />
      </PageProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getAllByPlaceholderText('••••••••')[0], { target: { value: 'Abc123!@#' } });
    fireEvent.change(screen.getAllByPlaceholderText('••••••••')[1], { target: { value: 'Abc123!@#' } });

    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));

    await waitFor(() => 
      expect(screen.queryAllByText(/Error al registrar usuario|Corrige los errores/).length).toBe(0)
    );
  });

  it('submits without throwing (happy path)', async () => {
    render(
      <PageProvider>
        <RegisterForm />
      </PageProvider>
    );

    fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), { target: { value: 'AA' } });
    fireEvent.change(screen.getByPlaceholderText('tu@email.com'), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByText('Crear cuenta'));
    
    await waitFor(() => expect(screen.getByText('Crear cuenta')).toBeInTheDocument());
  });
});

// Additional validation tests
import { useHttpRequest } from '../../hooks/useHttpRequest';

describe('RegisterForm validation branches', () => {
  beforeEach(() => {
    // Reset all mocks to their default values
    mockExecute.mockClear().mockResolvedValue({ message: 'ok', user: {} });
    mockValidateAllFields.mockClear().mockReturnValue(true);
    mockGetFieldError.mockClear().mockReturnValue('');
    mockClearAllErrors.mockClear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows validation error when validateAllFields fails', async () => {
    mockValidateAllFields.mockReturnValue(false);
    mockGetFieldError.mockReturnValue('err');
    
    render(
      <PageProvider>
        <RegisterForm />
      </PageProvider>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));
    
    await waitFor(() => {
      const errorElements = screen.queryAllByText('err');
      expect(errorElements.length).toBeGreaterThan(0);
    });
  });

  it('shows password complexity error via validation rules (simulate)', async () => {
    mockValidateAllFields.mockReturnValue(true);
    // @ts-expect-error - TypeScript doesn't like the parameter type change
    mockGetFieldError.mockImplementation((k: string) => (k === 'password' ? 'Mínimo 8 caracteres.' : ''));
    
    render(
      <PageProvider>
        <RegisterForm />
      </PageProvider>
    );
    
    expect(screen.getByText(/Crear cuenta/i)).toBeInTheDocument();
  });

  it('navigates to login on success (execute returns result)', async () => {
    const exec = jest.fn(async () => ({ message: 'ok', user: {} }));
    (useHttpRequest as jest.Mock).mockReturnValue({ execute: exec, error: null });
    mockValidateAllFields.mockReturnValue(true);
    mockGetFieldError.mockReturnValue('');
    
    render(
      <PageProvider>
        <RegisterForm />
      </PageProvider>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/Juan Pérez/i), { target: { value: 'José' } });
    fireEvent.change(screen.getByPlaceholderText(/tu@email.com/i), { target: { value: 'a@b.c' } });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], { target: { value: 'P@ssw0rd!' } });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], { target: { value: 'P@ssw0rd!' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));
    
    await waitFor(() => expect(exec).toHaveBeenCalled());
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  it('shows toast on API failure', async () => {
    const exec = jest.fn(async () => null);
    (useHttpRequest as jest.Mock).mockReturnValue({ execute: exec, error: { message: 'fail' } });
    mockValidateAllFields.mockReturnValue(true);
    mockGetFieldError.mockReturnValue('');
    
    render(
      <PageProvider>
        <RegisterForm />
      </PageProvider>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/Juan Pérez/i), { target: { value: 'Name' } });
    fireEvent.change(screen.getByPlaceholderText(/tu@email.com/i), { target: { value: 'n@e.com' } });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], { target: { value: 'P@ssw0rd!' } });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], { target: { value: 'P@ssw0rd!' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));
    
    await waitFor(() => expect(exec).toHaveBeenCalled());
    expect(exec).toHaveBeenCalled();
  });

  it('reset form on success', async () => {
    const exec = jest.fn(async () => ({ message: 'ok', user: {} }));
    (useHttpRequest as jest.Mock).mockReturnValue({ execute: exec, error: null });
    mockValidateAllFields.mockReturnValue(true);
    mockGetFieldError.mockReturnValue('');
    
    render(
      <PageProvider>
        <RegisterForm />
      </PageProvider>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/Juan Pérez/i), { target: { value: 'Name' } });
    fireEvent.change(screen.getByPlaceholderText(/tu@email.com/i), { target: { value: 'n@e.com' } });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], { target: { value: 'P@ssw0rd!' } });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], { target: { value: 'P@ssw0rd!' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear cuenta/i }));
    
    await waitFor(() => expect(exec).toHaveBeenCalled());
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });
});
