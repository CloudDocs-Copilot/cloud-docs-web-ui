import React, { useState } from 'react';
import { Card, Button, Spinner, Badge } from 'react-bootstrap';
import type { Invitation } from '../../types/invitation.types';
import styles from './InvitationCard.module.css';

interface InvitationCardProps {
  invitation: Invitation;
  onAccept: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  onAccept,
  onReject,
}) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    try {
      await onAccept(invitation.id);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('¿Estás seguro de rechazar esta invitación?')) {
      return;
    }
    setIsRejecting(true);
    try {
      await onReject(invitation.id);
    } finally {
      setIsRejecting(false);
    }
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner': return 'danger';
      case 'admin': return 'primary';
      case 'member': return 'info';
      case 'viewer': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'enterprise': return 'danger';
      case 'professional': return 'primary';
      case 'basic': return 'info';
      case 'free': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card className={styles.card}>
      <Card.Body>
        <div className={styles.header}>
          <div className={styles.orgInfo}>
            <div className={styles.orgAvatar}>
              {invitation.organization.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.orgDetails}>
              <h5 className={styles.orgName}>{invitation.organization.name}</h5>
              <Badge bg={getPlanBadgeVariant(invitation.organization.plan)} className={styles.planBadge}>
                {invitation.organization.plan.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        <div className={styles.info}>
          <p className={styles.infoItem}>
            <strong>Invitado por:</strong>{' '}
            {invitation.invitedBy.name || invitation.invitedBy.email}
          </p>
          <p className={styles.infoItem}>
            <strong>Rol:</strong>{' '}
            <Badge bg={getRoleBadgeVariant(invitation.role)}>
              {invitation.role.toUpperCase()}
            </Badge>
          </p>
          <p className={styles.timeAgo}>{timeAgo(invitation.createdAt)}</p>
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={handleAccept}
            disabled={isAccepting || isRejecting}
            className={styles.acceptButton}
          >
            {isAccepting ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Aceptando...
              </>
            ) : (
              'Aceptar'
            )}
          </Button>

          <Button
            variant="outline-secondary"
            onClick={handleReject}
            disabled={isAccepting || isRejecting}
            className={styles.rejectButton}
          >
            {isRejecting ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Rechazando...
              </>
            ) : (
              'Rechazar'
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default InvitationCard;
