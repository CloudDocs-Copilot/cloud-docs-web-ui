
/// <reference types="jest" />
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from '../App';
import { AuthProvider } from '../context/AuthProvider';
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

jest.mock('../pages/SharedDocs', () => ({
  __esModule: true,
  default: () => <div>SharedDocs Page</div>,
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

describe('Componente App', () => {
  it('renderiza el componente Home en la ruta por defecto', () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('renderiza el componente Dashboard en la ruta /dashboard', async () => {
    // simulate authenticated user in AuthProvider
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/dashboard']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('Dashboard Page')).toBeInTheDocument());
  });

  it('renderiza el componente UserProfile en la ruta /profile', async () => {
    // simulate authenticated user in AuthProvider
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/profile']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('UserProfile Component')).toBeInTheDocument());
  });

  it('renderiza la página de error para una ruta desconocida', () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/una-ruta-que-no-existe-xyz']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument();
  });

  it('renderiza la página de Notificaciones en la ruta /notifications', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/notifications']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('Notifications Page')).toBeInTheDocument());
  });

  it('renderiza la página de Login', () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/login']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renderiza la página de Registro', () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/register']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    expect(screen.getByText('Register Page')).toBeInTheDocument();
  });

  it('renderiza la página de MyDrive', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/my-drive']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('MyDrive Page')).toBeInTheDocument());
  });

  it('renderiza la página de Trash', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/trash']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('Trash Page')).toBeInTheDocument());
  });

  it('renderiza la página de Search', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/search']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('Search Page')).toBeInTheDocument());
  });

  it('renderiza la página de Crear Organización', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/create-organization']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('CreateOrganization Page')).toBeInTheDocument());
  });

  it('renderiza la página de Sin Organización', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/no-organization']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('NoOrganization Page')).toBeInTheDocument());
  });

  it('renderiza la página de Configuración de Organización', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/organization/settings']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('OrganizationSettings Page')).toBeInTheDocument());
  });

  it('renderiza la página de Invitaciones Pendientes', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/invitations']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('PendingInvitations Page')).toBeInTheDocument());
  });

  it('renderiza la página de Documentos Compartidos', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/shared']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('SharedDocs Page')).toBeInTheDocument());
  });

  it('renderiza la página de Olvide Contraseña', () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/auth/forgot-password']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    expect(screen.getByText('ForgotPassword Page')).toBeInTheDocument();
  });

  it('renderiza la página de Resetear Contraseña', () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/auth/reset-password']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    expect(screen.getByText('ResetPassword Page')).toBeInTheDocument();
  });

  it('renderiza la página de Legal', () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/legal']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    expect(screen.getByText('Legal Page')).toBeInTheDocument();
  });

  it('renderiza la página de Confirmar Cuenta', () => {
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/auth/confirmed']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    expect(screen.getByText('ConfirmAccount Page')).toBeInTheDocument();
  });

  it('renderiza la página de Colecciones AI', async () => {
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'User', email: 'user@example.com' }));
    render(
      <AuthProvider>
        <ToastProvider>
          <TestOrganizationProvider>
            <PageProvider>
              <MemoryRouter initialEntries={['/collections']}>
                <App />
              </MemoryRouter>
            </PageProvider>
          </TestOrganizationProvider>
        </ToastProvider>
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByText('AICollectionsPage Page')).toBeInTheDocument());
  });
});

