export type NotificationType =
  | 'DOC_UPLOADED'
  | 'DOC_EDITED'
  | 'DOC_COMMENTED'
  | 'MEMBER_INVITED'
  | 'MEMBER_JOINED'
  | 'ROLE_CHANGED'
  | 'DOC_SHARED'
  | 'DOC_DELETED'
  | 'INVITATION_CREATED'
  | 'MEMBER_ROLE_UPDATED'
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
