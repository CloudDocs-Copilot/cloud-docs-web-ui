import React from 'react';
import { Badge, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DashboardWidget } from '../DashboardWidget';
import type { OrgMember } from '../../../types/dashboard.types';

interface MembersOverviewWidgetProps {
  members: OrgMember[] | null;
  loading: boolean;
  error: string | null;
}

const ROLE_VARIANT: Record<string, string> = {
  owner: 'danger',
  admin: 'warning',
  member: 'primary',
  viewer: 'secondary',
};

const ROLE_LABEL: Record<string, string> = {
  owner: 'Propietario',
  admin: 'Admin',
  member: 'Miembro',
  viewer: 'Visitante',
};

export const MembersOverviewWidget: React.FC<MembersOverviewWidgetProps> = ({
  members,
  loading,
  error,
}) => {
  const navigate = useNavigate();

  const icon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );

  const roleCounts =
    members?.reduce<Record<string, number>>((acc, m) => {
      const role = typeof m.role === 'string' ? m.role.toLowerCase() : 'member';
      acc[role] = (acc[role] ?? 0) + 1;
      return acc;
    }, {}) ?? {};

  const pending = members?.filter((m) => m.status === 'pending').length ?? 0;

  const actions = (
    <button
      className="btn btn-link btn-sm p-0 text-decoration-none"
      onClick={() => navigate('/organization/settings')}
    >
      Ver todos →
    </button>
  );

  return (
    <DashboardWidget title="Miembros" icon={icon} loading={loading} actions={actions}>
      {error && (
        <Alert variant="warning" className="mb-0 py-2">
          <small>{error}</small>
        </Alert>
      )}
      {!error && members && (
        <div>
          <p className="mb-2 fw-semibold">{members.length} miembros en total</p>
          <div className="d-flex flex-wrap gap-1 mb-2">
            {Object.entries(roleCounts).map(([role, count]) => (
              <Badge key={role} bg={ROLE_VARIANT[role] ?? 'secondary'}>
                {ROLE_LABEL[role] ?? role}: {count}
              </Badge>
            ))}
          </div>
          {pending > 0 && (
            <small className="text-warning">
              {pending} invitación{pending !== 1 ? 'es' : ''} pendiente{pending !== 1 ? 's' : ''}
            </small>
          )}
        </div>
      )}
      {!error && !members && !loading && (
        <p className="text-muted small mb-0">No hay datos disponibles.</p>
      )}
    </DashboardWidget>
  );
};

export default MembersOverviewWidget;
