import React from 'react';
import { Badge, Button, ListGroup } from 'react-bootstrap';
import { DashboardWidget } from '../DashboardWidget';
import { formatStorageUsed } from '../../../types/user.types';
import useOrganization from '../../../hooks/useOrganization';

export const PlanInfoWidget: React.FC = () => {
  const { activeOrganization } = useOrganization();

  const icon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );

  if (!activeOrganization) return null;

  const plan = (activeOrganization.plan ?? 'FREE').toUpperCase();
  const settings = activeOrganization.settings;
  const isUpgradeable = plan === 'FREE' || plan === 'BASIC';

  const createdAt = activeOrganization.createdAt
    ? new Date(activeOrganization.createdAt).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <DashboardWidget title="Plan Actual" icon={icon}>
      <div className="mb-3">
        <Badge bg="primary" className="fs-6 px-3 py-2">
          {plan}
        </Badge>
      </div>
      <ListGroup variant="flush" className="mb-3">
        {settings?.maxUsers !== undefined && (
          <ListGroup.Item className="px-0 py-1 border-0">
            <small className="text-muted">Usuarios máx:</small>{' '}
            <span className="fw-semibold">{settings.maxUsers}</span>
          </ListGroup.Item>
        )}
        {settings?.maxStorageTotal !== undefined && (
          <ListGroup.Item className="px-0 py-1 border-0">
            <small className="text-muted">Almacenamiento:</small>{' '}
            <span className="fw-semibold">{formatStorageUsed(settings.maxStorageTotal)}</span>
          </ListGroup.Item>
        )}
        {settings?.maxFileSize !== undefined && (
          <ListGroup.Item className="px-0 py-1 border-0">
            <small className="text-muted">Tamaño máx. archivo:</small>{' '}
            <span className="fw-semibold">{formatStorageUsed(settings.maxFileSize)}</span>
          </ListGroup.Item>
        )}
        {createdAt && (
          <ListGroup.Item className="px-0 py-1 border-0">
            <small className="text-muted">Creada el:</small>{' '}
            <span className="fw-semibold">{createdAt}</span>
          </ListGroup.Item>
        )}
      </ListGroup>
      {isUpgradeable && (
        <Button variant="outline-primary" size="sm" disabled>
          Mejorar plan
        </Button>
      )}
    </DashboardWidget>
  );
};

export default PlanInfoWidget;
