export type NotificationType = 'DOC_UPLOADED' | 'DOC_EDITED' | 'DOC_COMMENTED';

export type NotificationEntity = {
  kind: 'document';
  id: string;
};

export type NotificationDTO = {
  id?: string;
  organization: string;
  recipient: string;
  actor: string;
  type: NotificationType;
  entity: NotificationEntity;
  message?: string;
  metadata?: Record<string, unknown>;
  readAt?: string | null;
  createdAt?: string;
};

export type ListNotificationsResponse = {
  success: boolean;
  count: number;
  total: number;
  notifications: NotificationDTO[];
};
