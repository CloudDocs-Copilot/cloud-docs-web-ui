import React from 'react';
import { Card, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import type { StorageStats } from '../../types/dashboard.types';

interface StorageWidgetProps {
  storageStats: StorageStats | null;
  loading: boolean;
  error: string | null;
}

export const StorageWidget: React.FC<StorageWidgetProps> = ({ storageStats, loading, error }) => {
  const getVariant = (percentage: number): 'success' | 'warning' | 'danger' => {
    if (percentage < 70) return 'success';
    if (percentage < 90) return 'warning';
    return 'danger';
  };

  return (
    <Card className="h-100">
      <Card.Body>
        <Card.Title>Almacenamiento</Card.Title>
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
        {!loading && !error && storageStats && (
          <>
            <ProgressBar
              now={storageStats.percentage}
              variant={getVariant(storageStats.percentage)}
              label={`${storageStats.percentage}%`}
              className="mb-2"
            />
            <small className="text-muted">
              {storageStats.formattedUsed} de {storageStats.formattedTotal} utilizados
            </small>
          </>
        )}
        {!loading && !error && !storageStats && (
          <p className="text-muted mb-0">Sin datos de almacenamiento</p>
        )}
      </Card.Body>
    </Card>
  );
};
