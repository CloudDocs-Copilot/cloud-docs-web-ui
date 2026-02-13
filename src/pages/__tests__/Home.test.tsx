import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Home from '../Home';
import * as useAuthHook from '../../hooks/useAuth';
import * as useOrganizationHook from '../../hooks/useOrganization';
import * as useInvitationsHook from '../../hooks/useInvitations';

// Mock hooks
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useOrganization');
jest.mock('../../hooks/useInvitations');
jest.mock('../../hooks/usePageInfoTitle', () => ({
  usePageTitle: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Home', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthHook.useAuth as jest.Mock).mockReturnValue({
      user: null,
      isAuthenticated: false,
      logout: jest.fn(),
    });
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: null,
      organizations: [],
    });
    (useInvitationsHook.useInvitations as jest.Mock).mockReturnValue({
      pendingCount: 0,
    });
  });

  it('renders login and register buttons when not authenticated', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const loginButtons = screen.getAllByText('Iniciar Sesión');
    expect(loginButtons.length).toBeGreaterThan(0);
    const registerButton = screen.getByText('Crear Cuenta');
    expect(registerButton).toBeInTheDocument();
  });

  it('navigates to login page when clicking login button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const loginButtons = screen.getAllByText('Iniciar Sesión');
    const navbarLoginBtn = loginButtons[0]; // Use the first one from navbar
    fireEvent.click(navbarLoginBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('navigates to register page when clicking register button', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const registerBtn = screen.getByText('Crear Cuenta');
    fireEvent.click(registerBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('renders user info when authenticated', () => {
    (useAuthHook.useAuth as jest.Mock).mockReturnValue({
      user: { name: 'John Doe', email: 'john@example.com' },
      isAuthenticated: true,
      logout: jest.fn(),
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    expect(screen.getByText('J')).toBeInTheDocument(); // Avatar letter
  });

  it('handles logout correctly', async () => {
    const mockLogout = jest.fn().mockResolvedValue(undefined);
    (useAuthHook.useAuth as jest.Mock).mockReturnValue({
      user: { name: 'John Doe', email: 'john@example.com' },
      isAuthenticated: true,
      logout: mockLogout,
    });

    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );

    const logoutBtn = screen.getByText('Salir');
    fireEvent.click(logoutBtn);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('renders hero for unauthenticated users', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Gestiona tus Documentos/i)).toBeInTheDocument();
    expect(screen.getByText(/Comenzar Gratis/i)).toBeInTheDocument();
  });

  it('has call-to-action button present', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    const btn = screen.getByText(/Comenzar Gratis/i);
    expect(btn).toBeInTheDocument();
  });

  it('shows pricing and features sections for unauthenticated', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Características Principales/i)).toBeInTheDocument();
  });

  it('renders quick access cards only for authenticated users', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    // For unauthenticated users quick-access cards should not be visible
    const matches = screen.queryAllByText(/Dashboard|Subir Documentos|Invitaciones|Configuración/);
    expect(matches.length).toBe(0);
  });
});
