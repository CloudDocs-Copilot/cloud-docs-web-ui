import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams('token=abc123')],
}));

jest.mock('../../hooks/useFormValidation', () => ({
  useFormValidation: () => ({ validatePassword: () => true, setFieldError: jest.fn(), clearFieldError: jest.fn(), errors: {}, handleBlur: jest.fn() })
}));

jest.mock('../../services/auth.service', () => ({ resetPasswordRequest: jest.fn() }));

import ResetPasswordPage from '../ResetPasswordPage';
import { resetPasswordRequest } from '../../services/auth.service';

describe('ResetPasswordPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('submits new password when token present and valid', async () => {
    (resetPasswordRequest as jest.Mock).mockResolvedValue({});

    render(<BrowserRouter><ResetPasswordPage /></BrowserRouter>);

    fireEvent.change(screen.getByLabelText(/Nueva contraseña/i), { target: { value: 'Abc123!@#' } });
    fireEvent.change(screen.getByLabelText(/Confirmar contraseña/i), { target: { value: 'Abc123!@#' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar nueva contraseña/i }));

    await waitFor(() => expect(resetPasswordRequest).toHaveBeenCalled());
  });
});
