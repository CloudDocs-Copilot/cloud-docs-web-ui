import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from '../components/UserProfile/UserProfile';

// Mock Sidebar to avoid router usage issues in tests
jest.mock('../components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar-mock">Sidebar</div>;
  };
});

describe('UserProfile Component', () => {
  const mockUser = {
    name: 'Test User',
    email: 'test@example.com'
  };
  const mockOnSave = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders user profile with initial data', () => {
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
    expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
  });

  test('allows updating name and email, and calls onSave', () => {
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

  test('calls onBack when Cancelar button is clicked', () => {
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
