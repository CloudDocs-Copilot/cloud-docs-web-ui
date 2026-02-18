import { deletionService } from '../../services/deletion.service';
import { apiClient } from '../../api';
import type { Document } from '../../types/document.types';

// Mock the API client
jest.mock('../../api');
const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

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

describe('deletionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('moveToTrash', () => {
    it('should move document to trash successfully', async () => {
      const mockDeletedDoc = {
        ...mockDocument,
        deletedAt: '2024-01-01T10:00:00.000Z',
        deletedBy: 'user-123',
        scheduledDeletionDate: '2024-02-01T10:00:00.000Z',
        deletionReason: 'Test reason'
      };

      mockApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Document moved to trash',
          data: mockDeletedDoc
        }
      });

      const result = await deletionService.moveToTrash('123', { reason: 'Test reason' });

      expect(mockApiClient.post).toHaveBeenCalledWith('/deletion/123/trash', { reason: 'Test reason' });
      expect(result).toEqual(mockDeletedDoc);
    });

    it('should move document to trash without reason', async () => {
      const mockDeletedDoc = {
        ...mockDocument,
        deletedAt: '2024-01-01T10:00:00.000Z',
        deletedBy: 'user-123',
        scheduledDeletionDate: '2024-02-01T10:00:00.000Z'
      };

      mockApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Document moved to trash',
          data: mockDeletedDoc
        }
      });

      const result = await deletionService.moveToTrash('123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/deletion/123/trash', undefined);
      expect(result).toEqual(mockDeletedDoc);
    });
  });

  describe('restoreFromTrash', () => {
    it('should restore document from trash successfully', async () => {
      mockApiClient.post.mockResolvedValue({
        data: {
          success: true,
          message: 'Document restored',
          data: mockDocument
        }
      });

      const result = await deletionService.restoreFromTrash('123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/deletion/123/restore');
      expect(result).toEqual(mockDocument);
    });
  });

  describe('getTrash', () => {
    it('should get trash documents successfully', async () => {
      const mockTrashDocs = [
        {
          ...mockDocument,
          deletedAt: '2024-01-01T10:00:00.000Z',
          deletedBy: 'user-123',
          scheduledDeletionDate: '2024-02-01T10:00:00.000Z'
        }
      ];

      mockApiClient.get.mockResolvedValue({
        data: {
          success: true,
          count: 1,
          data: mockTrashDocs
        }
      });

      const result = await deletionService.getTrash();

      expect(mockApiClient.get).toHaveBeenCalledWith('/deletion/trash');
      expect(result).toEqual(mockTrashDocs);
    });
  });

  describe('emptyTrash', () => {
    it('should empty trash successfully', async () => {
      mockApiClient.delete.mockResolvedValue({
        data: {
          success: true,
          message: 'Trash emptied',
          deletedCount: 5
        }
      });

      const result = await deletionService.emptyTrash();

      expect(mockApiClient.delete).toHaveBeenCalledWith('/deletion/trash');
      expect(result).toBe(5);
    });
  });

  describe('permanentDelete', () => {
    it('should permanently delete document successfully', async () => {
      mockApiClient.delete.mockResolvedValue({
        data: {
          success: true,
          message: 'Document permanently deleted'
        }
      });

      await deletionService.permanentDelete('123');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/deletion/123/permanent');
    });
  });
});