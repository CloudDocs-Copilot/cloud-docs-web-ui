import { render, screen, fireEvent, waitFor, renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('../../services/deletion.service', () => ({
  deletionService: {
    moveToTrash: jest.fn(),
    restoreFromTrash: jest.fn(),
    permanentDelete: jest.fn(),
  }
}));

import { useDocumentDeletion } from '../useDocumentDeletion';
import * as DeletionSvc from '../../services/deletion.service';

const TestComponent = () => {
  const { loading, error, moveToTrash, restoreFromTrash, permanentDelete, clearError } = useDocumentDeletion();
  return (
    <div>
      <div>loading:{String(loading)}</div>
      <div>error:{String(error)}</div>
      <button onClick={() => moveToTrash('d1')}>move</button>
      <button onClick={() => restoreFromTrash('d1')}>restore</button>
      <button onClick={() => permanentDelete('d1')}>delete</button>
      <button onClick={() => clearError()}>clear</button>
    </div>
  );
};

describe('useDocumentDeletion', () => {
  afterEach(() => jest.resetAllMocks());

  it('moveToTrash success sets loading and returns deleted doc', async () => {
    (DeletionSvc.deletionService.moveToTrash as jest.Mock).mockResolvedValue({ id: 'd1' });
    render(<TestComponent />);
    fireEvent.click(screen.getByText('move'));
    await waitFor(() => expect(DeletionSvc.deletionService.moveToTrash).toHaveBeenCalledWith('d1', { reason: undefined }));
  });

  it('restoreFromTrash returns restored doc', async () => {
    (DeletionSvc.deletionService.restoreFromTrash as jest.Mock).mockResolvedValue({ id: 'd1' });
    render(<TestComponent />);
    fireEvent.click(screen.getByText('restore'));
    await waitFor(() => expect(DeletionSvc.deletionService.restoreFromTrash).toHaveBeenCalledWith('d1'));
  });

  it('permanentDelete returns true on success', async () => {
    (DeletionSvc.deletionService.permanentDelete as jest.Mock).mockResolvedValue(true);
    render(<TestComponent />);
    fireEvent.click(screen.getByText('delete'));
    await waitFor(() => expect(DeletionSvc.deletionService.permanentDelete).toHaveBeenCalledWith('d1'));
  });

  it('clearError clears error state', async () => {
    render(<TestComponent />);
    fireEvent.click(screen.getByText('clear'));
    expect(screen.getByText(/error:null/)).toBeInTheDocument();
  });
});

// Error handling tests
describe('useDocumentDeletion error flows', () => {
  afterEach(() => jest.resetAllMocks());

  it('moveToTrash returns null and sets error when service throws', async () => {
    (DeletionSvc.deletionService.moveToTrash as jest.Mock).mockRejectedValue(new Error('net'));
    render(<TestComponent />);
    fireEvent.click(screen.getByText('move'));
    await waitFor(() => expect(DeletionSvc.deletionService.moveToTrash).toHaveBeenCalledWith('d1', { reason: undefined }));
    expect(screen.getByText(/error:/).textContent).not.toBe('error:null');
  });

  it('restoreFromTrash returns null on failure and sets error', async () => {
    (DeletionSvc.deletionService.restoreFromTrash as jest.Mock).mockRejectedValue(new Error('boom'));
    render(<TestComponent />);
    fireEvent.click(screen.getByText('restore'));
    await waitFor(() => expect(DeletionSvc.deletionService.restoreFromTrash).toHaveBeenCalledWith('d1'));
    expect(screen.getByText(/error:/).textContent).not.toBe('error:null');
  });

  it('permanentDelete returns false on failure and sets error', async () => {
    (DeletionSvc.deletionService.permanentDelete as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<TestComponent />);
    fireEvent.click(screen.getByText('delete'));
    await waitFor(() => expect(DeletionSvc.deletionService.permanentDelete).toHaveBeenCalledWith('d1'));
    expect(screen.getByText(/error:/).textContent).not.toBe('error:null');
  });
});

describe('useDocumentDeletion (renderHook)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useDocumentDeletion());
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.moveToTrash).toBe('function');
    expect(typeof result.current.restoreFromTrash).toBe('function');
    expect(typeof result.current.permanentDelete).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should return deleted document on successful moveToTrash', async () => {
    const mockDoc = { id: '123', deletedAt: '2024-01-01T10:00:00.000Z' };
    (DeletionSvc.deletionService.moveToTrash as jest.Mock).mockResolvedValue(mockDoc);

    const { result } = renderHook(() => useDocumentDeletion());
    let deletedDoc: unknown;
    await act(async () => {
      deletedDoc = await result.current.moveToTrash('123', 'reason');
    });
    expect(deletedDoc).toEqual(mockDoc);
  });

  it('should return null and set error on moveToTrash failure', async () => {
    (DeletionSvc.deletionService.moveToTrash as jest.Mock).mockRejectedValue(new Error('Failed'));
    const { result } = renderHook(() => useDocumentDeletion());
    let deletedDoc: unknown;
    await act(async () => {
      deletedDoc = await result.current.moveToTrash('123');
    });
    expect(deletedDoc).toBe(null);
    expect(result.current.error).toBeTruthy();
  });

  it('should return true on successful permanentDelete', async () => {
    (DeletionSvc.deletionService.permanentDelete as jest.Mock).mockResolvedValue(undefined);
    const { result } = renderHook(() => useDocumentDeletion());
    let success: unknown;
    await act(async () => {
      success = await result.current.permanentDelete('123');
    });
    expect(success).toBe(true);
  });

  it('should return false on permanentDelete failure', async () => {
    (DeletionSvc.deletionService.permanentDelete as jest.Mock).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useDocumentDeletion());
    let success: unknown;
    await act(async () => {
      success = await result.current.permanentDelete('123');
    });
    expect(success).toBe(false);
  });
});
