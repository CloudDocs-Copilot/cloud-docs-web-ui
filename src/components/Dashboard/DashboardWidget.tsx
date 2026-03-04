import React from 'react';
import { Card, Placeholder } from 'react-bootstrap';

interface DashboardWidgetProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  loading?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  icon,
  children,
  loading = false,
  actions,
  className,
}) => {
  return (
    <Card className={`h-100 shadow-sm ${className ?? ''}`}>
      <Card.Header className="d-flex align-items-center justify-content-between bg-white border-bottom py-3">
        <div className="d-flex align-items-center gap-2">
          {icon && <span className="text-primary">{icon}</span>}
          <h6 className="mb-0 fw-semibold">{title}</h6>
        </div>
        {actions && <div>{actions}</div>}
      </Card.Header>
      <Card.Body>
        {loading ? (
          <Placeholder as="div" animation="glow">
            <Placeholder xs={12} className="mb-2" style={{ height: '1rem' }} />
            <Placeholder xs={8} className="mb-2" style={{ height: '1rem' }} />
            <Placeholder xs={10} style={{ height: '1rem' }} />
          </Placeholder>
        ) : (
          children
        )}
      </Card.Body>
    </Card>
  );
};

export default DashboardWidget;
