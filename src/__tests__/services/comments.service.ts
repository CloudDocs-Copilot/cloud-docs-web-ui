import { apiClient } from '../../api';
import { commentsService } from '../../services/comments.service';

jest.mock('../../api', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
  },
}));

describe('commentsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listByDocument', () => {
    it('calls GET /comments/documents/:documentId and returns data', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { success: true, count: 1, comments: [{ id: 'c1', content: 'Hi' }] },
      });

      const res = await commentsService.listByDocument('doc-1');

      expect(apiClient.get).toHaveBeenCalledWith('/comments/documents/doc-1');
      expect(res).toEqual({
        success: true,
        count: 1,
        comments: [{ id: 'c1', content: 'Hi' }],
      });
    });
  });

  describe('create', () => {
    it('calls POST /comments/documents/:documentId with {content} and returns data', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true, comment: { id: 'c2', content: 'Hello' } },
      });

      const res = await commentsService.create('doc-2', 'Hello');

      expect(apiClient.post).toHaveBeenCalledWith('/comments/documents/doc-2', { content: 'Hello' });
      expect(res).toEqual({ success: true, comment: { id: 'c2', content: 'Hello' } });
    });
  });

  describe('update', () => {
    it('calls PATCH /comments/:commentId with {content} and returns data', async () => {
      (apiClient.patch as jest.Mock).mockResolvedValueOnce({
        data: { success: true, comment: { id: 'c3', content: 'Updated' } },
      });

      const res = await commentsService.update('c3', 'Updated');

      expect(apiClient.patch).toHaveBeenCalledWith('/comments/c3', { content: 'Updated' });
      expect(res).toEqual({ success: true, comment: { id: 'c3', content: 'Updated' } });
    });
  });
});
