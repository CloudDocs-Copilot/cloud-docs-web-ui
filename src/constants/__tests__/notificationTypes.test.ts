import { getNotificationTypeInfo, getNotificationTypeLabel } from '../notificationTypes';
import type { NotificationType } from '../../types/notification.types';

describe('notificationTypes', () => {
  const knownTypes: NotificationType[] = [
    'DOC_UPLOADED',
    'DOC_EDITED',
    'DOC_COMMENTED',
    'MEMBER_INVITED',
    'MEMBER_JOINED',
    'ROLE_CHANGED',
    'AI_PROCESSED',
  ];

  it('returns correct label for all known types', () => {
    const expected: Record<NotificationType, string> = {
      DOC_UPLOADED: 'Documento subido',
      DOC_EDITED: 'Documento actualizado',
      DOC_COMMENTED: 'Nuevo comentario',
      MEMBER_INVITED: 'Miembro invitado',
      MEMBER_JOINED: 'Nuevo miembro',
      ROLE_CHANGED: 'Rol actualizado',
      AI_PROCESSED: 'Análisis IA completado',
    };

    for (const type of knownTypes) {
      expect(getNotificationTypeLabel(type)).toBe(expected[type]);
    }
  });

  it('returns info with icon and bgColor for all known types', () => {
    for (const type of knownTypes) {
      const info = getNotificationTypeInfo(type);
      expect(info).toHaveProperty('label');
      expect(info).toHaveProperty('icon');
      expect(info).toHaveProperty('bgColor');
      expect(typeof info.label).toBe('string');
      expect(typeof info.icon).toBe('string');
      expect(typeof info.bgColor).toBe('string');
    }
  });

  it('returns default info for unknown type', () => {
    const info = getNotificationTypeInfo('UNKNOWN_TYPE' as NotificationType);
    expect(info.label).toBe('Notificación');
    expect(info.icon).toBe('🔔');
  });
});
