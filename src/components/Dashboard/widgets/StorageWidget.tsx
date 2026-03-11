import React, { useState } from 'react';
import { ProgressBar, Alert } from 'react-bootstrap';
import { DashboardWidget } from '../DashboardWidget';
import type { OrgStats } from '../../../services/dashboard.service';

interface StorageWidgetProps {
  stats: OrgStats | null;
  loading: boolean;
  error: string | null;
}

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

export const StorageWidget: React.FC<StorageWidgetProps> = ({ stats, loading, error }) => {
  const [showPerUser, setShowPerUser] = useState(false);

  const icon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );

  const usedPercent =
    stats && stats.totalStorageLimit > 0
      ? Math.min(100, Math.round((stats.usedStorage / stats.totalStorageLimit) * 100))
      : 0;

  const progressVariant =
    usedPercent >= 95 ? 'danger' : usedPercent >= 80 ? 'warning' : 'primary';

  const metricStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    padding: '10px 8px',
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
  };

  const metricValueStyle: React.CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#0d6efd',
    lineHeight: 1.2,
  };

  const metricLabelStyle: React.CSSProperties = {
    fontSize: '0.7rem',
    color: '#6c757d',
    marginTop: 2,
    textAlign: 'center',
  };

  return (
    <DashboardWidget title="Almacenamiento" icon={icon} loading={loading}>
      {error && (
        <Alert variant="warning" className="mb-0 py-2">
          <small>{error}</small>
        </Alert>
      )}
      {!error && stats && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Metrics row */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={metricStyle}>
              <span style={metricValueStyle}>{stats.totalDocuments}</span>
              <span style={metricLabelStyle}>Documentos</span>
            </div>
            <div style={metricStyle}>
              <span style={metricValueStyle}>{stats.totalFolders}</span>
              <span style={metricLabelStyle}>Carpetas</span>
            </div>
            <div style={metricStyle}>
              <span style={metricValueStyle}>{stats.totalUsers}</span>
              <span style={metricLabelStyle}>Usuarios</span>
            </div>
          </div>

          {/* Storage usage bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <small style={{ color: '#6c757d' }}>Almacenamiento usado</small>
              <small style={{ fontWeight: 600 }}>{usedPercent}%</small>
            </div>
            <ProgressBar
              now={usedPercent}
              variant={progressVariant}
              style={{ height: 8, borderRadius: 6 }}
              label={`${usedPercent}%`}
              visuallyHidden
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <small style={{ color: '#6c757d' }}>{formatBytes(stats.usedStorage)}</small>
              <small style={{ color: '#6c757d' }}>de {formatBytes(stats.totalStorageLimit)}</small>
            </div>
            <div style={{ marginTop: 2 }}>
              <small style={{ color: '#198754' }}>
                {formatBytes(stats.availableStorage)} disponibles
              </small>
            </div>
          </div>

          {usedPercent >= 95 && (
            <Alert variant="danger" className="mb-0 py-1">
              <small>⚠️ Almacenamiento casi lleno</small>
            </Alert>
          )}
          {usedPercent >= 80 && usedPercent < 95 && (
            <Alert variant="warning" className="mb-0 py-1">
              <small>⚠️ Más del 80% del almacenamiento utilizado</small>
            </Alert>
          )}

          {/* Per-user breakdown */}
          {stats.storagePerUser && stats.storagePerUser.length > 0 && (
            <div>
              <button
                onClick={() => setShowPerUser((v) => !v)}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  fontSize: '0.78rem', color: '#0d6efd', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                <span>{showPerUser ? '▾' : '▸'}</span>
                Uso por usuario
              </button>

              {showPerUser && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {stats.storagePerUser.map((u) => (
                    <div key={u.userId}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <small style={{ fontWeight: 500 }}>{u.userName}</small>
                        <small style={{ color: '#6c757d' }}>
                          {formatBytes(u.storageUsed)} · {u.percentage.toFixed(1)}%
                        </small>
                      </div>
                      <ProgressBar
                        now={u.percentage}
                        variant="primary"
                        style={{ height: 5, borderRadius: 4 }}
                        label={`${u.percentage}%`}
                        visuallyHidden
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
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
