// Mock api module to avoid importing httpClient.config.ts (which uses import.meta)
jest.mock('../api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PageProvider } from '../context/PageProvider';
import { AuthProvider } from '../context/AuthProvider';
import { ToastProvider } from '../context/ToastProvider';
import { OrganizationContext } from '../context/OrganizationContext';
import { UserProfile } from '../pages/UserProfile';

// Mock Sidebar to avoid router usage issues in tests
jest.mock('../components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar-mock">Sidebar</div>;
  };
});

// Mock userService to control updateProfile behavior
jest.mock('../services/user.service', () => ({
  userService: {
    updateProfile: jest.fn().mockResolvedValue({ message: 'Perfil actualizado', user: { name: 'Test User', email: 'test@example.com' } }),
    uploadProfileImage: jest.fn().mockResolvedValue({ success: true, imageUrl: '' }),
    getProfile: jest.fn().mockResolvedValue({ user: { name: 'Test User', email: 'test@example.com' } }),
  },
}));

// Wrapper component with providers
const renderWithProviders = (ui: React.ReactElement) => {
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

  return render(
    <MemoryRouter>
      <AuthProvider>
        <ToastProvider>
          <OrganizationContext.Provider value={value}>
            <PageProvider>
              {ui}
            </PageProvider>
          </OrganizationContext.Provider>
        </ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );
};

describe('Componente UserProfile', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com'
  };
  const mockOnSave = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // simulate authenticated user
    localStorage.setItem('auth_user', JSON.stringify({ id: 'u1', name: 'Test User', email: 'test@example.com' }));
  });

  test('renderiza el perfil de usuario con los datos iniciales', () => {
    renderWithProviders(
      <PageProvider>
        <UserProfile 
          user={mockUser} 
          onSave={mockOnSave} 
          onBack={mockOnBack} 
        />
      </PageProvider>
    );

    expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue(mockUser.name);
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue(mockUser.email);
  });

  test('permite actualizar nombre y correo, y llama a onSave', async () => {
    renderWithProviders(
      <PageProvider>
        <UserProfile 
          user={mockUser} 
          onSave={mockOnSave} 
          onBack={mockOnBack} 
        />
      </PageProvider>
    );

    const nameInput = screen.getByLabelText(/nombre completo/i);
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });

    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

    expect(nameInput).toHaveValue('New Name');
    expect(emailInput).toHaveValue('new@example.com');

    fireEvent.click(saveButton);

    await waitFor(() => expect(mockOnSave).toHaveBeenCalledTimes(1));
    expect(mockOnSave).toHaveBeenCalledWith('New Name', 'new@example.com');
  });

  test('llama a onBack cuando se hace clic en el botón Cancelar', () => {
    renderWithProviders(
      <PageProvider>
        <UserProfile 
          user={mockUser} 
          onSave={mockOnSave} 
          onBack={mockOnBack} 
        />
      </PageProvider>
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
