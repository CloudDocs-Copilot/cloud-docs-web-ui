import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockUseLocation(),
}));

jest.mock('../../hooks/usePageInfoTitle', () => ({ usePageTitle: jest.fn() }));

import ConfirmAccount from '../ConfirmAccount';

describe('ConfirmAccount page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: '/auth/confirmed', search: '' });
  });

  it('renders confirmed message and navigates when clicking login', async () => {
    // Override location for this test
    mockUseLocation.mockReturnValue({ pathname: '/auth/confirmed', search: '?status=confirmed' });
    render(<ConfirmAccount />);

    expect(screen.getByText(/¡Cuenta confirmada! Bienvenido/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ir a Iniciar Sesión/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('redirects automatically when status is already_active', async () => {
    // Re-mock useLocation to return already_active status
    mockUseLocation.mockReturnValue({
      pathname: '/auth/confirmed',
      search: '?status=already_active',
      hash: '',
      state: null,
      key: 'test',
    });

    render(<ConfirmAccount />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
    }, { timeout: 3000 });
  });
});
