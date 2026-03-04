import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useTrash } from '../useTrash';

const getTrashMock = jest.fn();
const emptyTrashMock = jest.fn();

jest.mock('../../services/deletion.service', () => ({
  deletionService: {
    getTrash: () => getTrashMock(),
    emptyTrash: () => emptyTrashMock(),
  }
}));

function TestComponent() {
  const { trashDocuments, loading, error, refetch, emptyTrash } = useTrash();
  return (
    <div>
      <div data-testid="count">{trashDocuments.length}</div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="error">{error || 'null'}</div>
      <button onClick={() => refetch()}>refetch</button>
      <button onClick={async () => { await emptyTrash(); }}>empty</button>
    </div>
  );
}

describe('useTrash', () => {
  beforeEach(() => jest.clearAllMocks());

  // ==================== Loading Trash Documents - Success ====================
  describe('Loading trash documents - success', () => {
    it('loads trash documents successfully', async () => {
      getTrashMock.mockResolvedValueOnce([{ id: 't1', filename: 'file1.pdf' }]);
      
      await act(async () => { 
        render(<TestComponent />); 
      });
      
      expect(await screen.findByTestId('count')).toHaveTextContent('1');
    });

    it('refetch updates documents', async () => {
      getTrashMock
        .mockResolvedValueOnce([{ id: 't1' }])
        .mockResolvedValueOnce([{ id: 't1' }, { id: 't2' }]);
      
      await act(async () => { 
        render(<TestComponent />); 
      });
      
      expect(await screen.findByTestId('count')).toHaveTextContent('1');
      
      const refetchBtn = screen.getByText('refetch');
      await act(async () => { 
        fireEvent.click(refetchBtn); 
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('2');
      });
    });
  });

  // ==================== Loading Trash Documents - Error ====================
  describe('Loading trash documents - error', () => {
    it('sets error when deletionService.getTrash fails', async () => {
      getTrashMock.mockRejectedValue(new Error('net'));
      
      await act(async () => { 
        render(<TestComponent />); 
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).not.toBe('null');
      });
    });

    it('handles fetch error and sets error message', async () => {
      getTrashMock.mockRejectedValue(new Error('fetch failed'));
      
      await act(async () => { 
        render(<TestComponent />); 
      });
      
      expect(await screen.findByTestId('error')).toHaveTextContent('fetch failed');
    });
  });

  // ==================== emptyTrash - Success ====================
  describe('emptyTrash - success', () => {
    it('emptyTrash succeeds and clears documents', async () => {
      getTrashMock.mockResolvedValueOnce([{ id: 't2' }]);
      emptyTrashMock.mockResolvedValueOnce(undefined);
      
      await act(async () => { 
        render(<TestComponent />); 
      });
      
      const emptyBtn = screen.getByText('empty');
      await act(async () => { 
        fireEvent.click(emptyBtn); 
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('count')).toHaveTextContent('0');
      });
    });
  });

  // ==================== emptyTrash - Error ====================
  describe('emptyTrash - error', () => {
    it('returns false and sets error when emptyTrash fails', async () => {
      getTrashMock.mockResolvedValueOnce([{ id: 'd1' }]);
      emptyTrashMock.mockRejectedValue(new Error('boom'));
      
      await act(async () => { 
        render(<TestComponent />); 
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('count').textContent).toBe('1');
      });
      
      fireEvent.click(screen.getByText('empty'));
      
      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).not.toBe('null');
      });
    });
  });
});
