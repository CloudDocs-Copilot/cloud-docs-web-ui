import { renderHook, waitFor, act } from '@testing-library/react';
import { useDocumentDeletion } from '../../hooks/useDocumentDeletion';
import { deletionService } from '../../services/deletion.service';
import type { Document } from '../../types/document.types';

// Mock the deletion service
jest.mock('../../services/deletion.service');

const mockDeletionService = deletionService as jest.Mocked<typeof deletionService>;

const mockDocument: Document = {
  id: '123',
  filename: 'test.pdf',
  originalname: 'test.pdf',
  mimeType: 'application/pdf',
  size: 1024,
  uploadedBy: 'user-123',
  organization: 'org-123',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z'
};

describe('useDocumentDeletion', () => {
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

  it('should handle successful moveToTrash', async () => {
    const mockDeletedDoc = { ...mockDocument, deletedAt: '2024-01-01T10:00:00.000Z' };
    mockDeletionService.moveToTrash.mockResolvedValue(mockDeletedDoc as any);

    const { result } = renderHook(() => useDocumentDeletion());

    const deletedDoc = await result.current.moveToTrash('123', 'Test reason');

    expect(mockDeletionService.moveToTrash).toHaveBeenCalledWith('123', { reason: 'Test reason' });
    expect(deletedDoc).toEqual(mockDeletedDoc);
    expect(result.current.error).toBe(null);
  });

  it('should handle moveToTrash error', async () => {
    const errorMessage = 'Failed to move to trash';
    mockDeletionService.moveToTrash.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDocumentDeletion());

    await act(async () => {
      const deletedDoc = await result.current.moveToTrash('123', 'Test reason');
      expect(deletedDoc).toBe(null);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
  });

  it('should handle successful restoreFromTrash', async () => {
    mockDeletionService.restoreFromTrash.mockResolvedValue(mockDocument);

    const { result } = renderHook(() => useDocumentDeletion());

    const restoredDoc = await result.current.restoreFromTrash('123');

    expect(mockDeletionService.restoreFromTrash).toHaveBeenCalledWith('123');
    expect(restoredDoc).toEqual(mockDocument);
    expect(result.current.error).toBe(null);
  });

  it('should handle restoreFromTrash error', async () => {
    const errorMessage = 'Failed to restore document';
    mockDeletionService.restoreFromTrash.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDocumentDeletion());

    await act(async () => {
      const restoredDoc = await result.current.restoreFromTrash('123');
      expect(restoredDoc).toBe(null);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
  });

  it('should handle successful permanentDelete', async () => {
    mockDeletionService.permanentDelete.mockResolvedValue();

    const { result } = renderHook(() => useDocumentDeletion());

    const success = await result.current.permanentDelete('123');

    expect(mockDeletionService.permanentDelete).toHaveBeenCalledWith('123');
    expect(success).toBe(true);
    expect(result.current.error).toBe(null);
  });

  it('should handle permanentDelete error', async () => {
    const errorMessage = 'Failed to delete permanently';
    mockDeletionService.permanentDelete.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useDocumentDeletion());

    await act(async () => {
      const success = await result.current.permanentDelete('123');
      expect(success).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
  });

  it('should clear error', () => {
    const { result } = renderHook(() => useDocumentDeletion());

    // Trigger an error first
    result.current.clearError();

    expect(result.current.error).toBe(null);
  });
});