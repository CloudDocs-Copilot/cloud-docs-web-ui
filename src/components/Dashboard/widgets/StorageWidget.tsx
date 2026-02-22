import React from 'react';
import { ProgressBar, Alert } from 'react-bootstrap';
import { DashboardWidget } from '../DashboardWidget';
import { formatStorageUsed } from '../../../types/user.types';
import type { OrgStats } from '../../../types/dashboard.types';

interface StorageWidgetProps {
  stats: OrgStats | null;
  loading: boolean;
  error: string | null;
}

export const StorageWidget: React.FC<StorageWidgetProps> = ({ stats, loading, error }) => {
  const icon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );

  const usedPercent =
    stats && stats.storage.total > 0
      ? Math.min(100, Math.round((stats.storage.used / stats.storage.total) * 100))
      : 0;

  const progressVariant =
    usedPercent >= 95 ? 'danger' : usedPercent >= 80 ? 'warning' : 'success';

  return (
    <DashboardWidget title="Almacenamiento" icon={icon} loading={loading}>
      {error && (
        <Alert variant="warning" className="mb-0 py-2">
          <small>{error}</small>
        </Alert>
      )}
      {!error && stats && (
        <div>
          <div className="d-flex justify-content-between mb-1">
            <small className="text-muted">Usado</small>
            <small className="fw-semibold">{usedPercent}%</small>
          </div>
          <ProgressBar
            now={usedPercent}
            variant={progressVariant}
            className="mb-2"
            style={{ height: '8px' }}
            label={`${usedPercent}%`}
            visuallyHidden
          />
          <div className="d-flex justify-content-between">
            <small className="text-muted">{formatStorageUsed(stats.storage.used)}</small>
            <small className="text-muted">{formatStorageUsed(stats.storage.total)}</small>
          </div>
          {usedPercent >= 95 && (
            <Alert variant="danger" className="mt-2 mb-0 py-1">
              <small>⚠️ Almacenamiento casi lleno</small>
            </Alert>
          )}
          {usedPercent >= 80 && usedPercent < 95 && (
            <Alert variant="warning" className="mt-2 mb-0 py-1">
              <small>⚠️ Más del 80% del almacenamiento utilizado</small>
            </Alert>
          )}
        </div>
      )}
      {!error && !stats && !loading && (
        <p className="text-muted small mb-0">No hay datos disponibles.</p>
      )}
    </DashboardWidget>
  );
};

export default StorageWidget;
