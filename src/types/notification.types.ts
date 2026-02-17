export type NotificationType =
  | 'DOC_UPLOADED'
  | 'DOC_EDITED'
  | 'DOC_COMMENTED'
  | 'MEMBER_INVITED'
  | 'MEMBER_JOINED'
  | 'ROLE_CHANGED'
  | 'AI_PROCESSED';

export type NotificationEntity = {
  kind: 'document' | 'member' | 'organization';
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
