import React from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import type { MemberStats } from '../../types/dashboard.types';

interface MemberStatsWidgetProps {
  memberStats: MemberStats | null;
  loading: boolean;
  error: string | null;
}

export const MemberStatsWidget: React.FC<MemberStatsWidgetProps> = ({
  memberStats,
  loading,
  error,
}) => {
  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title>Miembros</Card.Title>
        {loading && (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
          </div>
        )}
        {error && !loading && (
          <Alert variant="danger" className="mb-0 py-2">
            {error}
          </Alert>
        )}
        {!loading && !error && memberStats && (
          <>
            <div className="text-center mb-3">
              <span className="display-4 fw-bold">{memberStats.total}</span>
              <p className="text-muted mb-0">miembros totales</p>
            </div>
            <ul className="list-unstyled mb-0 small">
              <li className="d-flex justify-content-between">
                <span>Propietarios</span>
                <strong>{memberStats.byRole.owner}</strong>
              </li>
              <li className="d-flex justify-content-between">
                <span>Administradores</span>
                <strong>{memberStats.byRole.admin}</strong>
              </li>
              <li className="d-flex justify-content-between">
                <span>Miembros</span>
                <strong>{memberStats.byRole.member}</strong>
              </li>
              <li className="d-flex justify-content-between">
                <span>Visualizadores</span>
                <strong>{memberStats.byRole.viewer}</strong>
              </li>
            </ul>
          </>
        )}
        {!loading && !error && !memberStats && (
          <p className="text-muted mb-0">Sin datos de miembros</p>
        )}
      </Card.Body>
    </Card>
  );
};
