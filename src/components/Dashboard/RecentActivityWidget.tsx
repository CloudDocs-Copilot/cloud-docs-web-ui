import React from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import type { NotificationDTO, NotificationType } from '../../types/notification.types';

interface RecentActivityWidgetProps {
  notifications: NotificationDTO[];
  loading: boolean;
  error: string | null;
}

const TYPE_ICONS: Record<NotificationType, string> = {
  DOC_UPLOADED: '📄',
  DOC_EDITED: '✏️',
  DOC_COMMENTED: '💬',
  MEMBER_INVITED: '📨',
  MEMBER_JOINED: '👤',
  ROLE_CHANGED: '🔑',
  DOC_SHARED: '🔗',
  DOC_DELETED: '🗑️',
  INVITATION_CREATED: '📩',
  MEMBER_ROLE_UPDATED: '🔄',
  AI_PROCESSED: '🤖',
};

function formatRelativeTime(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'ahora mismo';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  notifications,
  loading,
  error,
}) => {
  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title>Actividad Reciente</Card.Title>
        {loading && (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        )}
        {error && !loading && (
          <Alert variant="danger" className="mb-0 py-2">
            {error}
          </Alert>
        )}
        {!loading && !error && notifications.length === 0 && (
          <p className="text-muted mb-0">No hay actividad reciente.</p>
        )}
        {!loading && !error && notifications.length > 0 && (
          <ul className="list-unstyled mb-0">
            {notifications.map((notification, index) => (
              <li
                key={notification.id ?? index}
                className="d-flex align-items-start gap-2 py-2 border-bottom"
              >
                <span role="img" aria-label={notification.type}>
                  {TYPE_ICONS[notification.type] ?? '🔔'}
                </span>
                <div className="flex-grow-1 overflow-hidden">
                  <p className="mb-0 text-truncate small">
                    {notification.message ?? notification.type}
                  </p>
                  <small className="text-muted">
                    {formatRelativeTime(notification.createdAt)}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card.Body>
    </Card>
  );
};
