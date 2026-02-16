import { apiClient } from '../../api';
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notification.service';

jest.mock('../../api', () => ({
  apiClient: {
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
  },
}));

describe('notification.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listNotifications', () => {
    it('calls GET /notifications with defaults (limit=20, skip=0) and unread=false when unreadOnly is falsy', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { success: true, count: 0, notifications: [] },
      });

      const res = await listNotifications({
        organizationId: 'org-1',
        unreadOnly: false,
      });

      expect(apiClient.get).toHaveBeenCalledWith('/notifications', {
        params: {
          organizationId: 'org-1',
          unread: 'false',
          limit: 20,
          skip: 0,
        },
      });

      expect(res).toEqual({ success: true, count: 0, notifications: [] });
    });

    it('sets unread=true when unreadOnly is true and forwards limit/skip', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { success: true, count: 1, notifications: [{ id: 'n1' }] },
      });

      const res = await listNotifications({
        organizationId: 'org-2',
        unreadOnly: true,
        limit: 5,
        skip: 10,
      });

      expect(apiClient.get).toHaveBeenCalledWith('/notifications', {
        params: {
          organizationId: 'org-2',
          unread: 'true',
          limit: 5,
          skip: 10,
        },
      });

      expect(res).toEqual({ success: true, count: 1, notifications: [{ id: 'n1' }] });
    });

    it('passes organizationId as undefined when not provided (but still includes unread/limit/skip)', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        data: { success: true, count: 0, notifications: [] },
      });

      await listNotifications({ unreadOnly: true });

      expect(apiClient.get).toHaveBeenCalledWith('/notifications', {
        params: {
          organizationId: undefined,
          unread: 'true',
          limit: 20,
          skip: 0,
        },
      });
    });
  });

  describe('markNotificationRead', () => {
    it('calls PATCH /notifications/:id/read and returns resp.data', async () => {
      (apiClient.patch as jest.Mock).mockResolvedValueOnce({
        data: { success: true, message: 'ok' },
      });

      const res = await markNotificationRead('abc123');

      expect(apiClient.patch).toHaveBeenCalledWith('/notifications/abc123/read');
      expect(res).toEqual({ success: true, message: 'ok' });
    });
  });

  describe('markAllNotificationsRead', () => {
    it('calls POST /notifications/read-all with {} when payload is undefined', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true },
      });

      const res = await markAllNotificationsRead();

      expect(apiClient.post).toHaveBeenCalledWith('/notifications/read-all', {});
      expect(res).toEqual({ success: true });
    });

    it('calls POST /notifications/read-all with provided payload and returns resp.data', async () => {
      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        data: { success: true, message: 'done' },
      });

      const res = await markAllNotificationsRead({ organizationId: 'org-9' });

      expect(apiClient.post).toHaveBeenCalledWith('/notifications/read-all', { organizationId: 'org-9' });
      expect(res).toEqual({ success: true, message: 'done' });
    });
  });
});
