import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, InputGroup, Modal, OverlayTrigger, Popover, Spinner } from 'react-bootstrap';
import styles from './Header.module.css';
import { useAuth } from '../hooks/useAuth';
import { FileUploader } from './FileUploader';
import { RoleGuard } from './RoleGuard';
import type { Document } from '../types/document.types';
import OrganizationSelector from './Organization/OrganizationSelector';
import useOrganization from '../hooks/useOrganization';
import type { MembershipRole } from '../types/organization.types';
import { useNotifications } from '../hooks/useNotifications';
import { getNotificationTypeLabel } from '../constants/notificationTypes';
import type { NotificationDTO, NotificationType } from '../types/notification.types';

interface HeaderProps {
  /** Callback cuando se suben documentos exitosamente */
  onDocumentsUploaded?: (documents: Document[]) => void;
}

const INVITATION_TYPES: NotificationType[] = ['INVITATION_CREATED', 'MEMBER_INVITED'];

function isInvitationNotification(n: NotificationDTO): boolean {
  return INVITATION_TYPES.includes(n.type);
}

const Header: React.FC<HeaderProps> = ({ onDocumentsUploaded }) => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const location = useLocation();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { notifications, unreadCount, loading: notifLoading, refresh, markRead, markAllRead } = useNotifications();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  const avatarLetter = (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const displayName = user?.name || user?.email || 'Usuario';

  // Role-based permission: hide upload for viewers
  const { activeOrganization, membership } = useOrganization();
  
    // Permission: delete only for owner/admin
    const orgRole = (membership?.role ||
      activeOrganization?.role ||
      'member') as MembershipRole;
  
    const normalizedRole = typeof orgRole === 'string' ? orgRole.toLowerCase() : orgRole;
    const canUpload = normalizedRole !== 'viewer';

  /**
   * Abre el modal de subida de archivos
   */
  const handleOpenUploadModal = useCallback(() => {
    if (!canUpload) return;
    setShowUploadModal(true);
  }, [canUpload]);

  /**
   * Cierra el modal de subida de archivos
   */
  const handleCloseUploadModal = useCallback(() => {
    setShowUploadModal(false);
  }, []);

  /**
   * Maneja la subida exitosa de documentos
   */
  const handleUploadSuccess = useCallback((documents: Document[]) => {
    onDocumentsUploaded?.(documents);
    setShowUploadModal(false);
  }, [onDocumentsUploaded]);

  const notificationPopover = useMemo(() => {
    return (
      <Popover id="notifications-popover" style={{ minWidth: 360 }}>
        <Popover.Header as="div" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Notificaciones</span>
          <Button
            size="sm"
            variant="link"
            style={{ textDecoration: 'none' }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              markAllRead().catch(() => {});
            }}
          >
            Marcar todas como leídas
          </Button>
        </Popover.Header>

        <Popover.Body>
          {notifLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Spinner animation="border" size="sm" />
              <span>Cargando...</span>
            </div>
          )}

          {!notifLoading && notifications.length === 0 && (
            <div style={{ opacity: 0.75 }}>No tienes notificaciones.</div>
          )}

          {!notifLoading && notifications.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 360, overflowY: 'auto' }}>
              {notifications.map((n) => {
                const isUnread = !n.readAt;
                return (
                  <div
                    key={n.id ?? `${n.type}-${n.createdAt}-${n.actor}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (n.id) {
                        markRead(n.id).catch(() => {});
                      }

                      if (isInvitationNotification(n)) {
                        navigate('/invitations');
                        return;
                      }

                      // Optional: navigate to document
                      if (n.entity?.kind === 'document' && n.entity?.id) {
                        // navigate(`/documents/${n.entity.id}`);
                      }
                    }}
                    style={{
                      cursor: 'pointer',
                      padding: '10px 12px',
                      borderRadius: 10,
                      border: '1px solid rgba(0,0,0,0.08)',
                      background: isUnread ? 'rgba(0, 123, 255, 0.06)' : 'white',
                    }}
                    title="Click para marcar como leída"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>
                        {getNotificationTypeLabel(n.type)}
                      </div>
                      {isUnread && (
                        <span
                          style={{
                            fontSize: 12,
                            padding: '2px 8px',
                            borderRadius: 999,
                            background: 'rgba(220,53,69,0.12)',
                            color: '#dc3545',
                            fontWeight: 700,
                          }}
                        >
                          Nuevo
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 13, marginTop: 4, opacity: 0.85 }}>
                      {n.message || 'Tienes una notificación'}
                    </div>

                    {n.createdAt && (
                      <div style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Popover.Body>
      </Popover>
    );
  }, [markAllRead, markRead, navigate, notifLoading, notifications, refresh]);

  return (
    <>
      <header className={styles.header}>
        <div className={styles.searchBarWrapper}>
          <InputGroup>
            <InputGroup.Text className={styles.searchIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" strokeWidth="2" />
              </svg>
            </InputGroup.Text>

            <Form.Control
              type="text"
              placeholder="Pregunta a tus documentos..."
              className={styles.searchInput}
            />
          </InputGroup>
        </div>

        <div className={styles.headerActions}>
          {user && !location.pathname.startsWith('/dashboard') && (
            <Button variant="link" className={styles.iconBtn} onClick={() => navigate('/dashboard')} title="Dashboard" aria-label="Ir al Dashboard">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M3 13h8V3H3v10zM3 21h8v-6H3v6zM13 21h8V11h-8v10zM13 3v6h8V3h-8z" strokeWidth="1.5" />
              </svg>
            </Button>
          )}

          <OrganizationSelector />

          {/* Notifications button + popover */}
          <OverlayTrigger
            trigger="click"
            placement="bottom-end"
            rootClose
            overlay={notificationPopover}
            onToggle={(nextShow) => {
              if (nextShow) {
                // refresh notifications when opening panel
                refresh().catch(() => {});
              }
            }}
          >
            <Button variant="link" className={styles.iconBtn} title="Notificaciones" aria-label="Ver notificaciones" style={{ position: 'relative' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" />
              </svg>

              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    transform: 'translate(30%, -30%)',
                    background: '#dc3545',
                    color: 'white',
                    borderRadius: 999,
                    minWidth: 18,
                    height: 18,
                    fontSize: 12,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 6px',
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                  aria-label={`${unreadCount} notificaciones no leídas`}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
          </OverlayTrigger>

          <Button variant="link" className={styles.iconBtn} aria-label="Configuración">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <circle cx="12" cy="12" r="3" strokeWidth="2" />
              <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" strokeWidth="2" />
            </svg>
          </Button>

          <div
            className={styles.userBadge}
            onClick={() => navigate('/profile')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.userAvatarSmall}>{avatarLetter}</div>
            <span>{displayName}</span>
          </div>

          {canUpload && (
            <RoleGuard requiredPermission="documents:create">
              <Button
                variant="primary"
                className={styles.btnUpload}
                onClick={handleOpenUploadModal}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  style={{ marginRight: '6px' }}
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" />
                  <polyline points="17 8 12 3 7 8" strokeWidth="2" />
                  <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" />
                </svg>
                Subir
              </Button>
            </RoleGuard>
          )}

          <Button variant="danger" className={styles.btnLogout} onClick={handleLogout}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              style={{ marginRight: '6px' }}
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" />
              <polyline points="16 17 21 12 16 7" strokeWidth="2" />
              <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" />
            </svg>
            Salir
          </Button>
        </div>
      </header>

      {/* Modal de Subida de Documentos */}
      {canUpload && (
        <Modal
          show={showUploadModal}
          onHide={handleCloseUploadModal}
          size="lg"
          centered
          backdrop="static"
          keyboard={false}
        >
          <FileUploader
            onUploadSuccess={handleUploadSuccess}
            onClose={handleCloseUploadModal}
          />
        </Modal>
      )}
    </>
  );
};

export default Header;
