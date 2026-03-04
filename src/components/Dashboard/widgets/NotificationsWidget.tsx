import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DashboardWidget } from '../DashboardWidget';
import { useNotifications } from '../../../hooks/useNotifications';

const TYPE_LABELS: Record<string, string> = {
  DOC_UPLOADED: 'Doc subido',
  DOC_EDITED: 'Doc editado',
  DOC_COMMENTED: 'Comentario',
  MEMBER_INVITED: 'Invitación',
  MEMBER_JOINED: 'Nuevo miembro',
  ROLE_CHANGED: 'Rol cambiado',
  DOC_SHARED: 'Doc compartido',
  DOC_DELETED: 'Doc eliminado',
  INVITATION_CREATED: 'Invitación',
  MEMBER_ROLE_UPDATED: 'Rol actualizado',
  AI_PROCESSED: 'IA procesada',
};

export const NotificationsWidget: React.FC = () => {
  const { notifications, loading, unreadCount } = useNotifications();
  const navigate = useNavigate();

  const icon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  const recent = notifications.slice(0, 5);

  const actions = (
    <button
      className="btn btn-link btn-sm p-0 text-decoration-none"
      onClick={() => navigate('/notifications')}
    >
      Ver todas →
    </button>
  );

  const unreadBadge =
    unreadCount > 0 ? (
      <Badge bg="danger" pill className="ms-1">
        {unreadCount}
      </Badge>
    ) : null;

  return (
    <DashboardWidget
      title="Notificaciones"
      icon={icon}
      loading={loading && notifications.length === 0}
      actions={actions}
    >
      {recent.length === 0 && !loading && (
        <p className="text-muted small mb-0">No hay notificaciones recientes.</p>
      )}
      {unreadBadge && <div className="mb-2">{unreadBadge} sin leer</div>}
      <ListGroup variant="flush">
        {recent.map((n) => (
          <ListGroup.Item
            key={n.id}
            className={`px-0 py-2 ${!n.readAt ? 'fw-semibold' : 'text-muted'}`}
            data-testid={`notification-item-${n.id}`}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <small className="text-muted d-block">
                  {TYPE_LABELS[n.type] ?? n.type}
                </small>
                <span className="small">{n.message ?? '—'}</span>
              </div>
              {!n.readAt && (
                <span className="badge bg-primary rounded-pill ms-2" style={{ fontSize: '0.6rem' }}>
                  Nuevo
                </span>
              )}
            </div>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </DashboardWidget>
  );
};

export default NotificationsWidget;
