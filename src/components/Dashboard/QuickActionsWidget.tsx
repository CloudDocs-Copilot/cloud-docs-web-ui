import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

interface QuickActionsWidgetProps {
  canUpload: boolean;
  canInvite: boolean;
  onUpload?: () => void;
  onInvite?: () => void;
}

export const QuickActionsWidget: React.FC<QuickActionsWidgetProps> = ({
  canUpload,
  canInvite,
  onUpload,
  onInvite,
}) => {
  const navigate = useNavigate();

  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column gap-2">
        <Card.Title>Acciones Rápidas</Card.Title>
        {canUpload && (
          <Button variant="primary" size="sm" onClick={onUpload}>
            📤 Subir documento
          </Button>
        )}
        {canInvite && (
          <Button variant="outline-primary" size="sm" onClick={onInvite}>
            👤 Invitar miembro
          </Button>
        )}
        <Button variant="outline-secondary" size="sm" onClick={() => navigate('/settings')}>
          ⚙️ Configuración
        </Button>
      </Card.Body>
    </Card>
  );
};
