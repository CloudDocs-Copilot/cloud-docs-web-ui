import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from '../components/UserProfile/UserProfile';

// Mock Sidebar to avoid router usage issues in tests
jest.mock('../components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar-mock">Sidebar</div>;
  };
});

describe('Componente UserProfile', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com'
  };
  const mockOnSave = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza el perfil de usuario con los datos iniciales', () => {
    render(
      <UserProfile 
        user={mockUser} 
        onSave={mockOnSave} 
        onBack={mockOnBack} 
      />
    );

    expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue(mockUser.name);
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue(mockUser.email);
  });

  test('permite actualizar nombre y correo, y llama a onSave', () => {
    render(
      <UserProfile 
        user={mockUser} 
        onSave={mockOnSave} 
        onBack={mockOnBack} 
      />
    );

    const nameInput = screen.getByLabelText(/nombre completo/i);
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const saveButton = screen.getByRole('button', { name: /guardar cambios/i });

    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

    expect(nameInput).toHaveValue('New Name');
    expect(emailInput).toHaveValue('new@example.com');

    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith('New Name', 'new@example.com');
  });

  test('llama a onBack cuando se hace clic en el botón Cancelar', () => {
    render(
      <UserProfile 
        user={mockUser} 
        onSave={mockOnSave} 
        onBack={mockOnBack} 
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    fireEvent.click(cancelButton);
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
