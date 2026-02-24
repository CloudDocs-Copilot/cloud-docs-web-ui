import React, { useCallback } from 'react';
import { Button, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { DashboardWidget } from '../DashboardWidget';
import { usePermissions } from '../../../hooks/usePermissions';

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: string;
}

interface QuickActionsWidgetProps {
  onUploadClick?: () => void;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({ onUploadClick }) => {
  const { can, role } = usePermissions();
  const navigate = useNavigate();

  const handleUpload = useCallback(() => {
    onUploadClick?.();
  }, [onUploadClick]);

  const uploadIcon = (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  );

  const actions: QuickAction[] = [];

  if (can('documents:create')) {
    actions.push({
      label: 'Subir documento',
      icon: uploadIcon,
      onClick: handleUpload,
      variant: 'primary',
    });
  }

  if (can('members:invite')) {
    actions.push({
      label: 'Invitar miembro',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="8.5" cy="7" r="4" />
          <line x1="20" y1="8" x2="20" y2="14" />
          <line x1="23" y1="11" x2="17" y2="11" />
        </svg>
      ),
      onClick: () => navigate('/organization/settings'),
      variant: 'outline-primary',
    });
  }

  if (can('settings:view')) {
    actions.push({
      label: 'Configuración',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      onClick: () => navigate('/organization/settings'),
      variant: 'outline-secondary',
    });
  }

  if (can('trash:manage')) {
    actions.push({
      label: 'Papelera',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      ),
      onClick: () => navigate('/trash'),
      variant: 'outline-danger',
    });
  }

  if (role === 'viewer') {
    actions.push({
      label: 'Ver compartidos',
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      ),
      onClick: () => navigate('/shared'),
      variant: 'outline-primary',
    });
  }

  const widgetIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );

  return (
    <DashboardWidget title="Acciones Rápidas" icon={widgetIcon}>
      <Stack gap={2} className="overflow-auto" style={{ maxHeight: '200px' }}>
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant ?? 'outline-secondary'}
            size="sm"
            className="d-flex align-items-center gap-2 text-start"
            onClick={action.onClick}
            data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
        {actions.length === 0 && (
          <p className="text-muted small mb-0">No hay acciones disponibles.</p>
        )}
      </Stack>
    </DashboardWidget>
  );
};

export default QuickActionsWidget;
