import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
