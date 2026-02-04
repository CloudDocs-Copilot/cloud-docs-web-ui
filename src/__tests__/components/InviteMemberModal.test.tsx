import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InviteMemberModal from '../../components/Organization/InviteMemberModal';
import { inviteMember } from '../../services/membership.services';
import { searchUserByEmail } from '../../services/user.services';

// Mock httpClient to avoid import.meta.env issues in Jest
jest.mock('../../api/httpClient.config', () => ({
  default: {
    request: jest.fn().mockResolvedValue({ data: {} }),
  },
  sanitizeData: jest.fn((data) => data),
}));

// Mocks
jest.mock('../../services/membership.services');
jest.mock('../../services/user.services');

const mockShowToast = jest.fn();
jest.mock('../../hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const mockActiveOrganization = { id: 'org-123', name: 'Test Organization' };
const mockIsAdmin = jest.fn();
const mockIsOwner = jest.fn();

jest.mock('../../hooks/useOrganization', () => ({
  __esModule: true,
  default: () => ({
    activeOrganization: mockActiveOrganization,
    isAdmin: mockIsAdmin,
    isOwner: mockIsOwner,
  }),
}));

describe('InviteMemberModal', () => {
  const mockOnHide = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAdmin.mockReturnValue(true);
    mockIsOwner.mockReturnValue(false);
  });

  describe('Renderizado básico', () => {
    it('renderiza el modal cuando show es true', () => {
      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      expect(screen.getByText('Invitar miembro')).toBeInTheDocument();
      expect(screen.getByLabelText('Email del usuario')).toBeInTheDocument();
      expect(screen.getByLabelText('Rol')).toBeInTheDocument();
    });

    it('no renderiza contenido cuando show es false', () => {
      render(
        <InviteMemberModal show={false} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      expect(screen.queryByText('Invitar miembro')).not.toBeInTheDocument();
    });

    it('muestra advertencia si el usuario no tiene permisos de admin/owner', () => {
      mockIsAdmin.mockReturnValue(false);
      mockIsOwner.mockReturnValue(false);

      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      expect(
        screen.getByText('Necesitas permisos de administrador para invitar miembros.')
      ).toBeInTheDocument();
    });
  });

  describe('Búsqueda de usuarios', () => {
    it('busca usuario cuando se escribe un email válido', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      (searchUserByEmail as jest.Mock).mockResolvedValue(mockUser);

      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      const emailInput = screen.getByLabelText('Email del usuario');
      await userEvent.type(emailInput, 'test@example.com');

      await waitFor(
        () => {
          expect(searchUserByEmail).toHaveBeenCalledWith('test@example.com');
        },
        { timeout: 1000 }
      );

      await waitFor(() => {
        expect(screen.getByText(/Usuario encontrado: Test User/i)).toBeInTheDocument();
      });
    });

    it('muestra mensaje de error cuando el usuario no existe', async () => {
      (searchUserByEmail as jest.Mock).mockResolvedValue(null);

      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      const emailInput = screen.getByLabelText('Email del usuario');
      await userEvent.type(emailInput, 'noexiste@example.com');

      await waitFor(
        () => {
          expect(screen.getByText('Usuario no encontrado. Verifica el email.')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );
    });

    it('no busca si el email no contiene @', async () => {
      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      const emailInput = screen.getByLabelText('Email del usuario');
      await userEvent.type(emailInput, 'invalidemail');

      await waitFor(() => {
        expect(searchUserByEmail).not.toHaveBeenCalled();
      });
    });

    it('muestra spinner mientras busca usuario', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      (searchUserByEmail as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockUser), 200))
      );

      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      const emailInput = screen.getByLabelText('Email del usuario');
      await userEvent.type(emailInput, 'test@example.com');

      // Verifica que se llamó al servicio de búsqueda
      await waitFor(() => {
        expect(searchUserByEmail).toHaveBeenCalledWith('test@example.com');
      });

      // Verifica que eventualmente se muestra el resultado
      await waitFor(() => {
        expect(screen.getByText(/Usuario encontrado: Test User/i)).toBeInTheDocument();
      });
    });
  });

  describe('Selección de rol', () => {
    it('permite seleccionar diferentes roles', async () => {
      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      const roleSelect = screen.getByLabelText('Rol');
      
      expect(screen.getByText('Puede crear y editar documentos')).toBeInTheDocument();

      await userEvent.selectOptions(roleSelect, 'admin');
      expect(screen.getByText('Puede gestionar miembros y configuración')).toBeInTheDocument();

      await userEvent.selectOptions(roleSelect, 'viewer');
      expect(screen.getByText('Solo puede ver documentos')).toBeInTheDocument();
    });
  });

  describe('Envío de invitación', () => {
    it('envía invitación exitosamente cuando el usuario existe', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      (searchUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (inviteMember as jest.Mock).mockResolvedValue({
        success: true,
        message: 'Invitación enviada',
      });

      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      const emailInput = screen.getByLabelText('Email del usuario');
      await userEvent.type(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(screen.getByText(/Usuario encontrado/i)).toBeInTheDocument();
      });

      const inviteButton = screen.getByRole('button', { name: /Enviar Invitación/i });
      await userEvent.click(inviteButton);

      await waitFor(() => {
        expect(inviteMember).toHaveBeenCalledWith('org-123', {
          userId: 'user-123',
          role: 'member',
        });
      });

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          message: expect.stringContaining('Invitación enviada a test@example.com'),
          variant: 'success',
          title: 'Invitación Enviada',
        });
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('muestra error si no hay usuario encontrado al enviar', async () => {
      (searchUserByEmail as jest.Mock).mockResolvedValue(null);

      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      const emailInput = screen.getByLabelText('Email del usuario');
      await userEvent.type(emailInput, 'noexiste@example.com');

      await waitFor(() => {
        expect(screen.getByText('Usuario no encontrado. Verifica el email.')).toBeInTheDocument();
      });

      const inviteButton = screen.getByRole('button', { name: /Enviar Invitación/i });
      expect(inviteButton).toBeDisabled();
    });

    it('deshabilita el botón mientras se procesa la invitación', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      (searchUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (inviteMember as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 200))
      );

      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      const emailInput = screen.getByLabelText('Email del usuario');
      await userEvent.type(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(screen.getByText(/Usuario encontrado/i)).toBeInTheDocument();
      });

      const inviteButton = screen.getByRole('button', { name: /Enviar Invitación/i });
      await userEvent.click(inviteButton);

      await waitFor(() => {
        expect(screen.getByText(/Enviando invitación/i)).toBeInTheDocument();
      });

      const buttonWhileProcessing = screen.getByRole('button', { name: /Enviando invitación/i });
      expect(buttonWhileProcessing).toBeDisabled();
    });

    it('maneja errores del servidor al enviar invitación', async () => {
      const mockUser = { id: 'user-123', email: 'fail@example.com', name: 'Fail User' };
      (searchUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (inviteMember as jest.Mock).mockRejectedValue({
        response: { data: { error: 'El usuario ya es miembro' } },
      });

      render(
        <InviteMemberModal show={true} onHide={jest.fn()} onSuccess={jest.fn()} />
      );

      const emailInput = screen.getByLabelText('Email del usuario');
      await userEvent.type(emailInput, 'fail@example.com');

      await waitFor(() => {
        expect(screen.getByText(/Usuario encontrado/i)).toBeInTheDocument();
      });

      const inviteButton = screen.getByRole('button', { name: /Enviar Invitación/i });
      await userEvent.click(inviteButton);

      await waitFor(() => {
        expect(mockShowToast).toHaveBeenCalledWith({
          message: 'El usuario ya es miembro',
          variant: 'danger',
          title: 'Invitación',
        });
      });
    });
  });

  describe('Permisos', () => {
    it('deshabilita campos si el usuario no tiene permisos', () => {
      mockIsAdmin.mockReturnValue(false);
      mockIsOwner.mockReturnValue(false);

      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      const emailInput = screen.getByLabelText('Email del usuario');
      const roleSelect = screen.getByLabelText('Rol');
      const inviteButton = screen.getByRole('button', { name: /Enviar Invitación/i });

      expect(emailInput).toBeDisabled();
      expect(roleSelect).toBeDisabled();
      expect(inviteButton).toBeDisabled();
    });

    it('permite owner enviar invitaciones', async () => {
      mockIsAdmin.mockReturnValue(false);
      mockIsOwner.mockReturnValue(true);

      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      const emailInput = screen.getByLabelText('Email del usuario');
      expect(emailInput).not.toBeDisabled();
    });
  });

  describe('Botones de acción', () => {
    it('cierra el modal al hacer clic en Cancelar', async () => {
      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      await userEvent.click(cancelButton);

      expect(mockOnHide).toHaveBeenCalled();
    });

    it('limpia el formulario después de enviar exitosamente', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      (searchUserByEmail as jest.Mock).mockResolvedValue(mockUser);
      (inviteMember as jest.Mock).mockResolvedValue({ success: true });

      render(
        <InviteMemberModal show={true} onHide={mockOnHide} onSuccess={mockOnSuccess} />
      );

      const emailInput = screen.getByLabelText('Email del usuario') as HTMLInputElement;
      await userEvent.type(emailInput, 'test@example.com');

      await waitFor(() => {
        expect(screen.getByText(/Usuario encontrado/i)).toBeInTheDocument();
      });

      const inviteButton = screen.getByRole('button', { name: /Enviar Invitación/i });
      await userEvent.click(inviteButton);

      await waitFor(() => {
        expect(emailInput.value).toBe('');
      });
    });
  });
});
