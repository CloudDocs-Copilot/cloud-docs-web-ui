import { createContext } from 'react';
import type { NotificationDTO } from '../types/notification.types';

export type NotificationsContextValue = {
  notifications: NotificationDTO[];
  total: number;
  unreadCount: number;
  loading: boolean;
  error: Error | null;

  refresh: (opts?: { unreadOnly?: boolean }) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

export const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);
