import React from 'react';
import { Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DashboardWidget } from '../DashboardWidget';
import type { OrgMember } from '../../../services/dashboard.service';

interface MembersOverviewWidgetProps {
  members: OrgMember[] | null;
  loading: boolean;
  error: string | null;
}

const ROLE_COLOR: Record<string, string> = {
  owner: '#dc3545',
  admin: '#fd7e14',
  member: '#0d6efd',
  viewer: '#6c757d',
};

const ROLE_LABEL: Record<string, string> = {
  owner: 'Propietario',
  admin: 'Admin',
  member: 'Miembro',
  viewer: 'Visitante',
};

const STATUS_COLOR: Record<string, string> = {
  active: '#198754',
  pending: '#fd7e14',
  suspended: '#dc3545',
};

const AVATAR_BG = '#0d6efd';

function getMemberName(m: OrgMember): string {
  if (m.user?.name) return m.user.name;
  if (m.user?.email) return m.user.email;
  return 'Usuario';
}

function getMemberEmail(m: OrgMember): string {
  return m.user?.email ?? '';
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

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

  const actions = (
    <button
      className="btn btn-link btn-sm p-0 text-decoration-none"
      onClick={() => navigate('/organization/settings')}
    >
      Ver todos →
    </button>
  );

  const preview = members?.slice(0, 5) ?? [];

  return (
    <DashboardWidget title="Miembros" icon={icon} loading={loading} actions={actions}>
      {error && (
        <Alert variant="warning" className="mb-0 py-2">
          <small>{error}</small>
        </Alert>
      )}
      {!error && members && members.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {preview.map((m, idx) => {
            const name = getMemberName(m);
            const email = getMemberEmail(m);
            const role = (typeof m.role === 'string' ? m.role.toLowerCase() : 'member');
            const status = (typeof m.status === 'string' ? m.status.toLowerCase() : 'active');
            return (
              <div key={m.id ?? idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Avatar */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  backgroundColor: AVATAR_BG,
                  color: '#fff', fontWeight: 700, fontSize: '0.875rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {getInitial(name)}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {name}
                  </div>
                  {email && (
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {email}
                    </div>
                  )}
                </div>
                {/* Role */}
                <span style={{
                  fontSize: '0.72rem', fontWeight: 600, padding: '2px 8px',
                  borderRadius: 12, backgroundColor: ROLE_COLOR[role] ?? '#6b7280',
                  color: '#fff', whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {ROLE_LABEL[role] ?? role}
                </span>
                {/* Status dot */}
                <span
                  title={status}
                  style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    backgroundColor: STATUS_COLOR[status] ?? '#6b7280',
                  }}
                />
              </div>
            );
          })}
          {members.length > 5 && (
            <small className="text-muted">+{members.length - 5} más</small>
          )}
        </div>
      )}
      {!error && members && members.length === 0 && !loading && (
        <p className="text-muted small mb-0">No hay miembros en esta organización.</p>
      )}
      {!error && !members && !loading && (
        <p className="text-muted small mb-0">No hay datos disponibles.</p>
      )}
    </DashboardWidget>
  );
};

export default MembersOverviewWidget;
