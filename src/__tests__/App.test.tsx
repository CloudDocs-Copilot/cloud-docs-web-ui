
/// <reference types="jest" />
import { render, screen } from '@testing-library/react';
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
    isAdmin: () => false,
    isOwner: () => false,
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

// Mock child components to isolate App test from page complexity
jest.mock('../pages/Home', () => ({
  __esModule: true,
  default: () => <div>Home Page</div>
}));
jest.mock('../pages/Dashboard', () => ({
  __esModule: true,
  default: () => <div>Dashboard Page</div>
}));
jest.mock('../pages/UserProfile', () => ({
  UserProfile: () => <div>UserProfile Component</div>
}));

jest.mock('../pages/NotFound', () => ({
  __esModule: true,
  default: () => <div>Página no encontrada</div>
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

  it('renderiza el componente Dashboard en la ruta /dashboard', () => {
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
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
  });

   it('renderiza el componente UserProfile en la ruta /profile', () => {
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
    expect(screen.getByText('UserProfile Component')).toBeInTheDocument();
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



});

