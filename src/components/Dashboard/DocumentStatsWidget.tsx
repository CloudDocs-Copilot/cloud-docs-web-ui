import React from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';

interface DocumentStatsWidgetProps {
  totalDocuments: number;
  loading: boolean;
  error: string | null;
}

export const DocumentStatsWidget: React.FC<DocumentStatsWidgetProps> = ({
  totalDocuments,
  loading,
  error,
}) => {
  return (
    <Card className="h-100">
      <Card.Body className="d-flex flex-column">
        <Card.Title>Documentos</Card.Title>
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
        {!loading && !error && (
          <div className="mt-auto text-center">
            <span className="display-4 fw-bold">{totalDocuments}</span>
            <p className="text-muted mb-0">documentos totales</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
