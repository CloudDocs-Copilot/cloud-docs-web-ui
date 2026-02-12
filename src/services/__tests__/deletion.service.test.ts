import { deletionService } from '../deletion.service';
import { apiClient } from '../../api';
import type { AxiosResponse } from 'axios';

jest.mock('../../api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('deletionService', () => {
  const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('moveToTrash', () => {
    it('moves document to trash successfully', async () => {
      const mockDeletedDoc = {
        id: 'doc-1',
        filename: 'test.pdf',
        deletedAt: '2024-01-01',
        deletedBy: 'user-1',
        scheduledDeletionDate: '2024-01-31',
        uploadedBy: 'user-1',
        organization: 'org-1',
        folder: 'folder-1',
        path: '/test.pdf',
        size: 1024,
        mimeType: 'application/pdf',
        uploadedAt: '2024-01-01',
        sharedWith: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Document moved to trash',
          data: mockDeletedDoc,
        },
      } as AxiosResponse);

      const result = await deletionService.moveToTrash('doc-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/deletion/doc-1/trash', undefined);
      expect(result).toEqual(mockDeletedDoc);
    });

    it('moves document to trash with reason', async () => {
      const mockDeletedDoc = {
        id: 'doc-2',
        filename: 'old.docx',
        deletedAt: '2024-01-01',
        deletedBy: 'user-1',
        scheduledDeletionDate: '2024-01-31',
        deletionReason: 'No longer needed',
        uploadedBy: 'user-1',
        organization: 'org-1',
        folder: 'folder-1',
        path: '/old.docx',
        size: 2048,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedAt: '2024-01-01',
        sharedWith: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Document moved to trash',
          data: mockDeletedDoc,
        },
      } as AxiosResponse);

      const result = await deletionService.moveToTrash('doc-2', { reason: 'No longer needed' });

      expect(mockApiClient.post).toHaveBeenCalledWith('/deletion/doc-2/trash', { reason: 'No longer needed' });
      expect(result.deletionReason).toBe('No longer needed');
    });
  });

  describe('restoreFromTrash', () => {
    it('restores document from trash successfully', async () => {
      const mockRestoredDoc = {
        id: 'doc-1',
        filename: 'restored.pdf',
        uploadedBy: 'user-1',
        organization: 'org-1',
        folder: 'folder-1',
        path: '/restored.pdf',
        size: 1024,
        mimeType: 'application/pdf',
        uploadedAt: '2024-01-01',
        sharedWith: [],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Document restored',
          data: mockRestoredDoc,
        },
      } as AxiosResponse);

      const result = await deletionService.restoreFromTrash('doc-1');

      expect(mockApiClient.post).toHaveBeenCalledWith('/deletion/doc-1/restore');
      expect(result).toEqual(mockRestoredDoc);
    });
  });

  describe('getTrash', () => {
    it('retrieves all deleted documents from trash', async () => {
      const mockTrashDocs = [
        {
          id: 'doc-1',
          filename: 'deleted1.pdf',
          deletedAt: '2024-01-01',
          deletedBy: 'user-1',
          scheduledDeletionDate: '2024-01-31',
          uploadedBy: 'user-1',
          organization: 'org-1',
          folder: 'folder-1',
          path: '/deleted1.pdf',
          size: 1024,
          mimeType: 'application/pdf',
          uploadedAt: '2024-01-01',
          sharedWith: [],
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
        {
          id: 'doc-2',
          filename: 'deleted2.docx',
          deletedAt: '2024-01-02',
          deletedBy: 'user-2',
          scheduledDeletionDate: '2024-02-01',
          uploadedBy: 'user-2',
          organization: 'org-1',
          folder: 'folder-2',
          path: '/deleted2.docx',
          size: 2048,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          uploadedAt: '2024-01-02',
          sharedWith: [],
          createdAt: '2024-01-02',
          updatedAt: '2024-01-02',
        },
      ];

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          count: 2,
          data: mockTrashDocs,
        },
      } as AxiosResponse);

      const result = await deletionService.getTrash();

      expect(mockApiClient.get).toHaveBeenCalledWith('/deletion/trash');
      expect(result).toEqual(mockTrashDocs);
      expect(result).toHaveLength(2);
    });

    it('returns empty array when trash is empty', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          count: 0,
          data: [],
        },
      } as AxiosResponse);

      const result = await deletionService.getTrash();

      expect(result).toEqual([]);
    });
  });

  describe('emptyTrash', () => {
    it('empties trash and returns deleted count', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Trash emptied',
          deletedCount: 5,
        },
      } as AxiosResponse);

      const result = await deletionService.emptyTrash();

      expect(mockApiClient.delete).toHaveBeenCalledWith('/deletion/trash');
      expect(result).toBe(5);
    });

    it('returns zero when trash was empty', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Trash was already empty',
          deletedCount: 0,
        },
      } as AxiosResponse);

      const result = await deletionService.emptyTrash();

      expect(result).toBe(0);
    });
  });

  describe('permanentDelete', () => {
    it('deletes document permanently', async () => {
      mockApiClient.delete.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Document permanently deleted',
        },
      } as AxiosResponse);

      await deletionService.permanentDelete('doc-1');

      expect(mockApiClient.delete).toHaveBeenCalledWith('/deletion/doc-1/permanent');
    });

    it('handles errors during permanent deletion', async () => {
      mockApiClient.delete.mockRejectedValueOnce(new Error('Not found'));

      await expect(deletionService.permanentDelete('nonexistent')).rejects.toThrow('Not found');
    });
  });
});
