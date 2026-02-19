import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Forbidden from '../../pages/Forbidden';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock('../../hooks/usePageInfoTitle', () => ({
  usePageTitle: jest.fn(),
}));

describe('Forbidden', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders 403 heading and access denied message', () => {
    render(<Forbidden />);
    expect(screen.getByText('403')).toBeInTheDocument();
    expect(screen.getByText('Acceso denegado')).toBeInTheDocument();
    expect(
      screen.getByText(/No tienes permisos para acceder a esta sección/),
    ).toBeInTheDocument();
  });

  it('navigates to /dashboard when button is clicked', () => {
    render(<Forbidden />);
    fireEvent.click(screen.getByRole('button', { name: /Volver al Dashboard/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
