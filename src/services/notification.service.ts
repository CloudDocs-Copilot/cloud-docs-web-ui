import { apiClient } from '../api';
import type { ListNotificationsResponse } from '../types/notification.types';

export async function listNotifications(params: {
  organizationId?: string;
  unreadOnly?: boolean;
  limit?: number;
  skip?: number;
}): Promise<ListNotificationsResponse> {
  const { organizationId, unreadOnly, limit = 20, skip = 0 } = params;

  const resp = await apiClient.get<ListNotificationsResponse>('/notifications', {
    params: {
      organizationId,
      unread: unreadOnly ? 'true' : 'false',
      limit,
      skip,
    },
  });

  return resp.data;
}

export async function markNotificationRead(id: string): Promise<{ success: boolean; message?: string }> {
  const resp = await apiClient.patch<{ success: boolean; message?: string }>(`/notifications/${id}/read`);
  return resp.data;
}

export async function markAllNotificationsRead(payload?: {
  organizationId?: string;
}): Promise<{ success: boolean; message?: string }> {
  const resp = await apiClient.post<{ success: boolean; message?: string }>(
    '/notifications/read-all',
    payload ?? {}
  );
  return resp.data;
}
