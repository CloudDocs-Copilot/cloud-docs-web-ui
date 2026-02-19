import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Nav, Badge } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import { useNotifications } from '../hooks/useNotifications';
import { getNotificationTypeInfo } from '../constants/notificationTypes';
import type { NotificationDTO, NotificationType } from '../types/notification.types';
import styles from './Notifications.module.css';

type FilterTab = 'all' | 'unread' | 'documents' | 'comments';

const DOCUMENT_TYPES: NotificationType[] = ['DOC_UPLOADED', 'DOC_EDITED'];
const COMMENT_TYPES: NotificationType[] = ['DOC_COMMENTED'];

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return '';
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return new Date(dateStr).toLocaleDateString();
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, hasMore, refresh, loadMore, markRead, markAllRead } = useNotifications();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  usePageTitle({
    title: 'Notificaciones',
    subtitle: 'Centro de notificaciones',
    documentTitle: 'Notificaciones',
    metaDescription: 'Gestiona tus notificaciones',
  });

  useEffect(() => {
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.readAt);
      case 'documents':
        return notifications.filter((n) => DOCUMENT_TYPES.includes(n.type));
      case 'comments':
        return notifications.filter((n) => COMMENT_TYPES.includes(n.type));
      default:
        return notifications;
    }
  }, [notifications, activeTab]);

  const handleNotificationClick = useCallback(
    async (notification: NotificationDTO) => {
      if (notification.id && !notification.readAt) {
        await markRead(notification.id).catch(() => {});
      }
      if (notification.entity?.kind === 'document' && notification.entity?.id) {
        navigate('/dashboard');
      }
    },
    [markRead, navigate]
  );

  const handleMarkAllRead = useCallback(() => {
    markAllRead().catch(() => {});
  }, [markAllRead]);

  const handleLoadMore = useCallback(() => {
    loadMore().catch(() => {});
  }, [loadMore]);

  return (
    <MainLayout>
      <Container fluid className="py-3">
        <div className={styles['page-header']}>
          <h2 className={styles['page-header-title']}>Notificaciones</h2>
          {unreadCount > 0 && (
            <Button variant="outline-primary" size="sm" onClick={handleMarkAllRead}>
              Marcar todas como leídas
            </Button>
          )}
        </div>

        <Card>
          <Card.Header>
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab((k as FilterTab) ?? 'all')}>
              <Nav.Item>
                <Nav.Link eventKey="all">Todas</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="unread">
                  No leídas
                  {unreadCount > 0 && (
                    <Badge bg="danger" pill className="ms-1">
                      {unreadCount}
                    </Badge>
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="documents">Documentos</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="comments">Comentarios</Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-0">
            {loading && notifications.length === 0 && (
              <div className="text-center py-5">
                <Spinner animation="border" role="status" size="sm" />
                <span className="ms-2">Cargando notificaciones...</span>
              </div>
            )}

            {!loading && filteredNotifications.length === 0 && (
              <div className={styles['empty-state']}>
                <div className={styles['empty-icon']}>🔔</div>
                <p>No tienes notificaciones</p>
              </div>
            )}

            {filteredNotifications.length > 0 && (
              <div className={styles['notification-list']}>
                {filteredNotifications.map((n) => {
                  const typeInfo = getNotificationTypeInfo(n.type);
                  const isUnread = !n.readAt;
                  return (
                    <div
                      key={n.id ?? `${n.type}-${n.createdAt}-${n.actor}`}
                      className={`${styles['notification-item']} ${isUnread ? styles['notification-item-unread'] : ''}`}
                      onClick={() => handleNotificationClick(n)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleNotificationClick(n);
                      }}
                    >
                      <div
                        className={styles['notification-icon']}
                        style={{ background: typeInfo.bgColor }}
                      >
                        {typeInfo.icon}
                      </div>
                      <div className={styles['notification-body']}>
                        <div className={styles['notification-header']}>
                          <span className={styles['notification-type']}>{typeInfo.label}</span>
                          <span className={styles['notification-time']}>
                            {formatRelativeTime(n.createdAt)}
                          </span>
                        </div>
                        <p className={styles['notification-message']}>
                          {n.message || 'Tienes una notificación'}
                        </p>
                      </div>
                      {isUnread && (
                        <Badge bg="danger" pill style={{ alignSelf: 'center' }}>
                          Nuevo
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {hasMore && (
              <div className={styles['load-more-container']}>
                <Button variant="outline-secondary" size="sm" onClick={handleLoadMore} disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-1" />
                      Cargando...
                    </>
                  ) : (
                    'Cargar más'
                  )}
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </Container>
    </MainLayout>
  );
};

export default Notifications;
