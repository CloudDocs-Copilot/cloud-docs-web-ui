
/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from '../App';
import { AuthProvider } from '../context/AuthProvider';
import { CsrfProvider } from '../context/CsrfProvider';
import { PageProvider } from '../context/PageProvider';
import { ToastProvider } from '../context/ToastProvider';
import React from 'react';
import { OrganizationContext } from '../context/OrganizationContext';

const TestOrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value: React.ContextType<typeof OrganizationContext> = {
    organizations: [],
    activeOrganization: { id: 'org-1', name: 'Org One' },
    membership: null,
    loading: false,
    error: null,
    fetchOrganizations: async () => {},
    fetchActiveOrganization: async () => {},
    setActiveOrganization: async () => {},
    createOrganization: async () => ({ id: 'org-1', name: 'Org One' }),
    refreshOrganization: async () => {},
    clearOrganization: () => {},
    hasRole: () => false,
    isAdmin: false,
    isOwner: false,
  };

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

// Función helper para renderizar con todos los providers en el orden correcto
const renderApp = (app: React.ReactElement) => {
  return render(
    <CsrfProvider>
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              {app}
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    </CsrfProvider>
  );
};

// Mock httpClient to avoid import.meta.env issues in Jest
jest.mock('../api/httpClient.config', () => ({
  default: {
    request: jest.fn().mockResolvedValue({ data: {} }),
  },
  sanitizeData: jest.fn((data) => data),
}));

// Mock useAuth hook to simulate authenticated state
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: true,
    loading: false,
    user: { name: 'Test User', email: 'test@example.com' },
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock pages
jest.mock('../pages/Home', () => ({
  __esModule: true,
  default: () => <div>Home Page</div>,
}));

jest.mock('../pages/Dashboard', () => ({
  __esModule: true,
  default: () => <div>Dashboard Page</div>,
}));

jest.mock('../pages/LoginPage', () => ({
  __esModule: true,
  default: () => <div>Login Page</div>,
}));

jest.mock('../pages/Register', () => ({
  __esModule: true,
  default: () => <div>Register Page</div>,
}));

jest.mock('../pages/MyDrive', () => ({
  __esModule: true,
  default: () => <div>MyDrive Page</div>,
}));

jest.mock('../pages/TrashPage', () => ({
  __esModule: true,
  default: () => <div>Trash Page</div>,
}));

jest.mock('../pages/SearchPage', () => ({
  __esModule: true,
  default: () => <div>Search Page</div>,
}));

jest.mock('../pages/CreateOrganization', () => ({
  __esModule: true,
  default: () => <div>CreateOrganization Page</div>,
}));

jest.mock('../pages/NoOrganization', () => ({
  __esModule: true,
  default: () => <div>NoOrganization Page</div>,
}));

jest.mock('../pages/OrganizationSettings', () => ({
  __esModule: true,
  default: () => <div>OrganizationSettings Page</div>,
}));

jest.mock('../pages/PendingInvitations', () => ({
  __esModule: true,
  default: () => <div>PendingInvitations Page</div>,
}));

jest.mock('../pages/SharedDocs', () => ({
  __esModule: true,
  default: () => <div>SharedDocs Page</div>,
}));

jest.mock('../pages/ForgotPasswordPage', () => ({
  __esModule: true,
  default: () => <div>ForgotPassword Page</div>,
}));

jest.mock('../pages/ResetPasswordPage', () => ({
  __esModule: true,
  default: () => <div>ResetPassword Page</div>,
}));

jest.mock('../pages/Legal', () => ({
  __esModule: true,
  default: () => <div>Legal Page</div>,
}));

jest.mock('../pages/ConfirmAccount', () => ({
  __esModule: true,
  default: () => <div>ConfirmAccount Page</div>,
}));

jest.mock('../pages/AICollectionsPage', () => ({
  __esModule: true,
  default: () => <div>AICollectionsPage Page</div>,
}));

jest.mock('../pages/NotFound', () => ({
  __esModule: true,
  default: () => <div>Página no encontrada</div>,
}));

jest.mock('../pages/Notifications', () => ({
  __esModule: true,
  default: () => <div>Notifications Page</div>,
}));

jest.mock('../pages/UserProfile', () => ({
  __esModule: true,
  default: () => <div>UserProfile Component</div>,
}));
describe('Componente App', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renderiza el componente Home en la ruta por defecto', () => {
    renderApp(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renderiza la página de Login en /login', () => {
    renderApp(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renderiza el componente Dashboard en /dashboard', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    renderApp(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument());
  });

  it('renderiza MyDrive en /my-drive', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    renderApp(
      <MemoryRouter initialEntries={['/my-drive']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('MyDrive Page')).toBeInTheDocument());
  });

  it('renderiza Trash en /trash', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    renderApp(
      <MemoryRouter initialEntries={['/trash']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('Trash Page')).toBeInTheDocument());
  });

  it('renderiza Search en /search', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    renderApp(
      <MemoryRouter initialEntries={['/search']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('Search Page')).toBeInTheDocument());
  });

  it('renderiza CreateOrganization en /create-organization', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    renderApp(
      <MemoryRouter initialEntries={['/create-organization']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('CreateOrganization Page')).toBeInTheDocument());
  });

  it('renderiza PendingInvitations en /invitations', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    renderApp(
      <MemoryRouter initialEntries={['/invitations']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('PendingInvitations Page')).toBeInTheDocument());
  });

  it('renderiza SharedDocs en /shared', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    renderApp(
      <MemoryRouter initialEntries={['/shared']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('SharedDocs Page')).toBeInTheDocument());
  });

  it('renderiza Notifications en /notifications', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    renderApp(
      <MemoryRouter initialEntries={['/notifications']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('Notifications Page')).toBeInTheDocument());
  });

  it('renderiza Legal en /legal', () => {
    renderApp(
      <MemoryRouter initialEntries={['/legal']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Legal Page')).toBeInTheDocument();
  });

  it('renderiza ForgotPassword en /auth/forgot-password', async () => {
    renderApp(
      <MemoryRouter initialEntries={['/auth/forgot-password']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('ForgotPassword Page')).toBeInTheDocument());
  });

  it('renderiza ResetPassword en /auth/reset-password', async () => {
    renderApp(
      <MemoryRouter initialEntries={['/auth/reset-password']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('ResetPassword Page')).toBeInTheDocument());
  });

  it('renderiza ConfirmAccount en /auth/confirmed', () => {
    renderApp(
      <MemoryRouter initialEntries={['/auth/confirmed']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('ConfirmAccount Page')).toBeInTheDocument();
  });

  it('renderiza AICollectionsPage en /collections', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    renderApp(
      <MemoryRouter initialEntries={['/collections']}>
        <App />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('AICollectionsPage Page')).toBeInTheDocument());
  });

  it('renderiza NotFound para ruta inválida', () => {
    renderApp(
      <MemoryRouter initialEntries={['/ruta-no-existe-12345']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });

  it('renderiza App con estructura de Routes y Suspense', () => {
    const { container } = renderApp(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renderiza múltiples providers correctamente', () => {
    const { container } = renderApp(
      <MemoryRouter initialEntries={['/dashboard']}>
        <App />
      </MemoryRouter>
    );
    expect(container).toBeTruthy();
    expect(container.firstChild).toBeInTheDocument();
  });
});

