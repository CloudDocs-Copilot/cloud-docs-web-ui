import type { NotificationType } from '../types/notification.types';

interface NotificationTypeInfo {
  label: string;
  icon: string;
  bgColor: string;
}

const NOTIFICATION_TYPE_MAP: Record<NotificationType, NotificationTypeInfo> = {
  DOC_UPLOADED: { label: 'Documento subido', icon: '📄', bgColor: 'rgba(25,135,84,0.12)' },
  DOC_EDITED: { label: 'Documento actualizado', icon: '✏️', bgColor: 'rgba(13,110,253,0.12)' },
  DOC_COMMENTED: { label: 'Nuevo comentario', icon: '💬', bgColor: 'rgba(255,193,7,0.12)' },
  MEMBER_INVITED: { label: 'Miembro invitado', icon: '📨', bgColor: 'rgba(111,66,193,0.12)' },
  MEMBER_JOINED: { label: 'Nuevo miembro', icon: '👤', bgColor: 'rgba(13,202,240,0.12)' },
  ROLE_CHANGED: { label: 'Rol actualizado', icon: '🔑', bgColor: 'rgba(253,126,20,0.12)' },
  AI_PROCESSED: { label: 'Análisis IA completado', icon: '🤖', bgColor: 'rgba(102,16,242,0.12)' },
};

const DEFAULT_TYPE_INFO: NotificationTypeInfo = {
  label: 'Notificación',
  icon: '🔔',
  bgColor: 'rgba(108,117,125,0.12)',
};

export function getNotificationTypeInfo(type: NotificationType): NotificationTypeInfo {
  return NOTIFICATION_TYPE_MAP[type] ?? DEFAULT_TYPE_INFO;
}

export function getNotificationTypeLabel(type: NotificationType): string {
  return getNotificationTypeInfo(type).label;
}
