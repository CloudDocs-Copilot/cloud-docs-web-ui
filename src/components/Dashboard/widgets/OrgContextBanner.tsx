import React from 'react';
import { Badge, Row, Col } from 'react-bootstrap';
import useOrganization from '../../../hooks/useOrganization';

const PLAN_VARIANT: Record<string, string> = {
  FREE: 'secondary',
  BASIC: 'info',
  PREMIUM: 'primary',
  ENTERPRISE: 'warning',
};

const ROLE_LABEL: Record<string, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  member: 'Miembro',
  viewer: 'Visitante',
};

export const OrgContextBanner: React.FC = () => {
  const { activeOrganization, membership } = useOrganization();

  if (!activeOrganization) return null;

  const plan = (activeOrganization.plan ?? 'FREE').toUpperCase();
  const rawRole = membership?.role ?? activeOrganization.role ?? 'viewer';
  const role = typeof rawRole === 'string' ? rawRole.toLowerCase() : rawRole;
  const roleLabel = ROLE_LABEL[role] ?? role;
  const planVariant = PLAN_VARIANT[plan] ?? 'secondary';

  return (
    <div
      className="w-100 px-4 py-3 mb-4 rounded-3 border"
      style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}
      data-testid="org-context-banner"
    >
      <Row className="align-items-center gy-2">
        <Col xs={12} md="auto">
          <span className="fw-semibold fs-5">{activeOrganization.name}</span>
        </Col>
        <Col xs="auto">
          <Badge bg={planVariant} data-testid="plan-badge">
            {plan}
          </Badge>
        </Col>
        <Col xs="auto">
          <Badge bg="dark" data-testid="role-badge">
            {roleLabel}
          </Badge>
        </Col>
        {activeOrganization.memberCount !== undefined && (
          <Col xs="auto">
            <small className="text-muted">
              <span data-testid="member-count">{activeOrganization.memberCount}</span> miembros
            </small>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default OrgContextBanner;
