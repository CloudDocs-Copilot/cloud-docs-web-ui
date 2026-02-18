import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import TrashPage from '../../pages/TrashPage';
import { useTrash } from '../../hooks/useTrash';
import { useDocumentDeletion } from '../../hooks/useDocumentDeletion';
import type { DeletedDocument } from '../../services/deletion.service';

// Mock de los hooks
jest.mock('../../hooks/useTrash');
jest.mock('../../hooks/useDocumentDeletion');
jest.mock('../../hooks/usePageInfoTitle');

// Wrapper component for router context
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <MemoryRouter>
    {children}
  </MemoryRouter>
);

const mockUseTrash = useTrash as jest.MockedFunction<typeof useTrash>;
const mockUseDocumentDeletion = useDocumentDeletion as jest.MockedFunction<typeof useDocumentDeletion>;

const mockDeletedDocument: DeletedDocument = {
  id: '1',
  filename: 'test.pdf',
  originalname: 'Test Document.pdf',
  mimeType: 'application/pdf',
  size: 1024,
  uploadedBy: 'user1',
  organization: 'org1',
  folder: 'folder1',
  path: '/uploads/test.pdf',
  uploadedAt: '2024-01-01T00:00:00.000Z',
  sharedWith: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  isDeleted: true,
  deletedAt: '2024-01-01T12:00:00.000Z',
  deletedBy: 'user1',
  scheduledDeletionDate: '2024-01-31T12:00:00.000Z',
  deletionReason: 'Test deletion'
};

describe('TrashPage', () => {
  const mockRefetch = jest.fn();
  const mockEmptyTrash = jest.fn();
  const mockRestoreFromTrash = jest.fn();
  const mockPermanentDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseTrash.mockReturnValue({
      trashDocuments: [mockDeletedDocument],
      loading: false,
      error: null,
      refetch: mockRefetch,
      emptyTrash: mockEmptyTrash
    });

    mockUseDocumentDeletion.mockReturnValue({
      loading: false,
      error: null,
      moveToTrash: jest.fn(),
      restoreFromTrash: mockRestoreFromTrash,
      permanentDelete: mockPermanentDelete,
      clearError: jest.fn()
    });
  });

  it('renders trash page correctly', () => {
    render(<TrashPage />, { wrapper: RouterWrapper });

    expect(screen.getByText('Papelera')).toBeInTheDocument();
    expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
    expect(screen.getByText('Eliminado')).toBeInTheDocument();
  });

  it('shows empty state when no documents in trash', () => {
    mockUseTrash.mockReturnValue({
      trashDocuments: [],
      loading: false,
      error: null,
      refetch: mockRefetch,
      emptyTrash: mockEmptyTrash
    });

    render(<TrashPage />, { wrapper: RouterWrapper });

    expect(screen.getByText('La papelera está vacía')).toBeInTheDocument();
    expect(screen.getByText('Los documentos eliminados aparecerán aquí')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseTrash.mockReturnValue({
      trashDocuments: [],
      loading: true,
      error: null,
      refetch: mockRefetch,
      emptyTrash: mockEmptyTrash
    });

    render(<TrashPage />, { wrapper: RouterWrapper });

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Cargando documentos...')).toBeInTheDocument();
  });

  it('shows error message', () => {
    mockUseTrash.mockReturnValue({
      trashDocuments: [],
      loading: false,
      error: 'Error loading trash',
      refetch: mockRefetch,
      emptyTrash: mockEmptyTrash
    });

    render(<TrashPage />, { wrapper: RouterWrapper });

    expect(screen.getByText('Error loading trash')).toBeInTheDocument();
  });

  it('handles restore document correctly', async () => {
    const user = userEvent.setup();
    mockRestoreFromTrash.mockResolvedValue(mockDeletedDocument);

    render(<TrashPage />, { wrapper: RouterWrapper });

    const restoreButton = screen.getByRole('button', { name: /restaurar/i });
    await user.click(restoreButton);

    expect(mockRestoreFromTrash).toHaveBeenCalledWith('1');
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('handles permanent delete with confirmation modal', async () => {
    const user = userEvent.setup();
    mockPermanentDelete.mockResolvedValue(true);

    render(<TrashPage />, { wrapper: RouterWrapper });

    // Click eliminar permanentemente
    const deleteButton = screen.getByRole('button', { name: /eliminar permanentemente/i });
    await user.click(deleteButton);

    // Modal should appear
    expect(screen.getByText('Eliminar permanentemente')).toBeInTheDocument();
    expect(screen.getByText('¿Estás seguro de que deseas eliminar permanentemente este documento?')).toBeInTheDocument();

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: 'Eliminar permanentemente' });
    await user.click(confirmButton);

    expect(mockPermanentDelete).toHaveBeenCalledWith('1');
    
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled();
    });
  });

  it('handles empty trash with confirmation modal', async () => {
    const user = userEvent.setup();
    mockEmptyTrash.mockResolvedValue(true);

    render(<TrashPage />, { wrapper: RouterWrapper });

    // Click vaciar papelera
    const emptyButton = screen.getByRole('button', { name: /vaciar papelera/i });
    await user.click(emptyButton);

    // Modal should appear
    expect(screen.getByText('Vaciar papelera')).toBeInTheDocument();
    expect(screen.getByText(/¿Estás seguro de que deseas vaciar la papelera?/)).toBeInTheDocument();

    // Confirm empty trash
    const confirmButton = screen.getByRole('button', { name: 'Vaciar papelera' });
    await user.click(confirmButton);

    expect(mockEmptyTrash).toHaveBeenCalled();
  });

  it('shows document information correctly', () => {
    render(<TrashPage />, { wrapper: RouterWrapper });

    // Check document name uses originalname priority
    expect(screen.getByText('Test Document.pdf')).toBeInTheDocument();
    
    // Check deletion information
    expect(screen.getByText(/Eliminado:/)).toBeInTheDocument();
    expect(screen.getByText(/Eliminación permanente:/)).toBeInTheDocument();
    expect(screen.getByText('Motivo: Test deletion')).toBeInTheDocument();
  });

  it('disables buttons during operations', () => {
    mockUseDocumentDeletion.mockReturnValue({
      loading: true,
      error: null,
      moveToTrash: jest.fn(),
      restoreFromTrash: mockRestoreFromTrash,
      permanentDelete: mockPermanentDelete,
      clearError: jest.fn()
    });

    render(<TrashPage />, { wrapper: RouterWrapper });

    const restoreButton = screen.getByRole('button', { name: /restaurar/i });
    const deleteButton = screen.getByRole('button', { name: /eliminar permanentemente/i });

    expect(restoreButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('handles modal cancellation', async () => {
    const user = userEvent.setup();
    
    render(<TrashPage />, { wrapper: RouterWrapper });

    // Open permanent delete modal
    const deleteButton = screen.getByRole('button', { name: /eliminar permanentemente/i });
    await user.click(deleteButton);

    // Cancel modal
    const cancelButton = screen.getByRole('button', { name: /cancelar/i });
    await user.click(cancelButton);

    expect(mockPermanentDelete).not.toHaveBeenCalled();
  });

  it('formats deletion date correctly', () => {
    render(<TrashPage />, { wrapper: RouterWrapper });

    // The component should format the scheduledDeletionDate
    expect(screen.getByText(/Eliminación permanente:/)).toBeInTheDocument();
  });

  it('handles failed restore operation', async () => {
    const user = userEvent.setup();
    mockRestoreFromTrash.mockResolvedValue(null);

    render(<TrashPage />, { wrapper: RouterWrapper });

    const restoreButton = screen.getByRole('button', { name: /restaurar/i });
    await user.click(restoreButton);

    expect(mockRestoreFromTrash).toHaveBeenCalledWith('1');
    // Should not call refetch if restore failed
    expect(mockRefetch).not.toHaveBeenCalled();
  });

  it('handles failed permanent delete operation', async () => {
    const user = userEvent.setup();
    mockPermanentDelete.mockResolvedValue(false);

    render(<TrashPage />, { wrapper: RouterWrapper });

    const deleteButton = screen.getByRole('button', { name: /eliminar permanentemente/i });
    await user.click(deleteButton);

    const confirmButton = screen.getByRole('button', { name: 'Eliminar permanentemente' });
    await user.click(confirmButton);

    expect(mockPermanentDelete).toHaveBeenCalledWith('1');
    // Modal should not close and refetch should not be called on failure
    expect(mockRefetch).not.toHaveBeenCalled();
  });
});