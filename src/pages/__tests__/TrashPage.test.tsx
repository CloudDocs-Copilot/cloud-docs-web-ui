import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TrashPage from '../TrashPage';

const mockUseTrash = jest.fn();
const mockUseDocumentDeletion = jest.fn();

jest.mock('../../hooks/useTrash', () => ({
  useTrash: () => mockUseTrash(),
}));

jest.mock('../../hooks/useDocumentDeletion', () => ({
  useDocumentDeletion: () => mockUseDocumentDeletion(),
}));

jest.mock('../../components/MainLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../../hooks/usePageInfoTitle', () => ({ usePageTitle: jest.fn() }));
jest.mock('../../hooks/usePageContext', () => ({ usePageContext: () => ({}) }));

describe('TrashPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTrash.mockReturnValue({ trashDocuments: [], loading: false, error: null, refetch: jest.fn(), emptyTrash: jest.fn().mockResolvedValue(true) });
    mockUseDocumentDeletion.mockReturnValue({ restoreFromTrash: jest.fn().mockResolvedValue(true), permanentDelete: jest.fn().mockResolvedValue(true), loading: false });
  });
  it('shows empty state when no documents', () => {
    render(<TrashPage />);
    expect(screen.getByText(/La papelera está vacía/i)).toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    mockUseTrash.mockReturnValue({ trashDocuments: [], loading: true, error: null, refetch: jest.fn(), emptyTrash: jest.fn().mockResolvedValue(true) });
    render(<TrashPage />);
    expect(screen.getByText(/Cargando documentos/i)).toBeInTheDocument();
  });

  it('renders documents list and restore button', async () => {
    const restoreMock = jest.fn().mockResolvedValue(true);
    mockUseTrash.mockReturnValue({ trashDocuments: [{ id: 'd1', filename: 'a.pdf', deletedAt: new Date().toISOString(), scheduledDeletionDate: new Date().toISOString() }], loading: false, error: null, refetch: jest.fn(), emptyTrash: jest.fn().mockResolvedValue(true) });
    mockUseDocumentDeletion.mockReturnValue({ restoreFromTrash: restoreMock, permanentDelete: jest.fn().mockResolvedValue(true), loading: false });

    render(<TrashPage />);
    expect(screen.getByText(/a.pdf/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Restaurar/i));
    await waitFor(() => expect(restoreMock).toHaveBeenCalled());
  });

  it('opens empty trash modal and calls emptyTrash', async () => {
    const emptyMock = jest.fn().mockResolvedValue(true);
    mockUseTrash.mockReturnValue({ trashDocuments: [{ id: 'd1', filename: 'a.pdf', deletedAt: new Date().toISOString(), scheduledDeletionDate: new Date().toISOString() }], loading: false, error: null, refetch: jest.fn(), emptyTrash: emptyMock });
    render(<TrashPage />);
    // click the empty-trash control (first button with that label)
    fireEvent.click(screen.getByRole('button', { name: /Vaciar papelera/i }));
    // modal warning should appear
    expect(screen.getByText(/esta acción no se puede deshacer/i)).toBeInTheDocument();
    // confirm action in modal - click the last matching button labeled 'Vaciar papelera'
    const vaciarButtons = screen.getAllByRole('button', { name: /Vaciar papelera/i });
    fireEvent.click(vaciarButtons[vaciarButtons.length - 1]);
    await waitFor(() => expect(emptyMock).toHaveBeenCalled());
  });

  it('shows error alert when hook returns error', () => {
    mockUseTrash.mockReturnValue({ trashDocuments: [], loading: false, error: 'boom', refetch: jest.fn(), emptyTrash: jest.fn() });
    render(<TrashPage />);
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });
});
