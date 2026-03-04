import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../../hooks/useFormValidation', () => ({
  useFormValidation: () => ({ validateEmail: () => true, setFieldError: jest.fn(), clearFieldError: jest.fn(), errors: {}, handleBlur: jest.fn() })
}));

jest.mock('../../hooks/usePageInfoTitle', () => ({ usePageTitle: jest.fn() }));

jest.mock('../../services/auth.service', () => ({ forgotPasswordRequest: jest.fn() }));

import ForgotPasswordPage from '../ForgotPasswordPage';
import { forgotPasswordRequest } from '../../services/auth.service';

describe('ForgotPasswordPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('submits email and shows success message', async () => {
    (forgotPasswordRequest as jest.Mock).mockResolvedValue({ message: 'ok' });

    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Restablecer contraseña/i }));

    await waitFor(() => expect(forgotPasswordRequest).toHaveBeenCalledWith('test@example.com'));
    await waitFor(() => expect(screen.getByText(/ok|Si el correo existe/i)).toBeInTheDocument());
  });

  it('renders the form with all required fields', () => {
    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);

    expect(screen.getByLabelText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Restablecer contraseña/i })).toBeInTheDocument();
    expect(screen.getByText(/Volver a iniciar sesión/i)).toBeInTheDocument();
  });

  it('shows server error when request fails', async () => {
    (forgotPasswordRequest as jest.Mock).mockRejectedValue(new Error('Error del servidor'));

    render(<BrowserRouter><ForgotPasswordPage /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /Restablecer contraseña/i }));

    await waitFor(() => expect(screen.getByText(/Error del servidor/i)).toBeInTheDocument(), { timeout: 3000 });
  });
});
