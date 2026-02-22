import React, { useCallback, useEffect } from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { DashboardWidget } from '../DashboardWidget';
import DocumentCard from '../../DocumentCard';
import { useHttpRequest } from '../../../hooks/useHttpRequest';
import useOrganization from '../../../hooks/useOrganization';
import { usePermissions } from '../../../hooks/usePermissions';
import type { Document } from '../../../types/document.types';

interface DocumentsApiResponse {
  success: boolean;
  count: number;
  documents: Document[];
}

interface RecentDocumentsWidgetProps {
  refreshKey?: number;
  onDocumentDeleted?: () => void;
}

export const RecentDocumentsWidget: React.FC<RecentDocumentsWidgetProps> = ({
  refreshKey,
  onDocumentDeleted,
}) => {
  const { activeOrganization } = useOrganization();
  const { can } = usePermissions();
  const orgId = activeOrganization?.id ?? '';
  const canDelete = can('documents:delete');

  const {
    execute,
    data,
    isLoading,
    isError,
    error,
  } = useHttpRequest<DocumentsApiResponse>();

  const fetchDocuments = useCallback(() => {
    if (!orgId) return;
    execute({ method: 'GET', url: `/documents/recent/${orgId}` });
  }, [execute, orgId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments, refreshKey]);

  const handleDeleted = useCallback(() => {
    fetchDocuments();
    onDocumentDeleted?.();
  }, [fetchDocuments, onDocumentDeleted]);

  const icon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );

  return (
    <DashboardWidget title="Documentos Recientes" icon={icon} loading={false}>
      {isLoading && (
        <div className="text-center py-4">
          <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
            <span className="visually-hidden">Cargando documentos...</span>
          </div>
          <span>Cargando documentos...</span>
        </div>
      )}

      {isError && (
        <Alert variant="danger" className="mb-0">
          <Alert.Heading>Error al cargar documentos</Alert.Heading>
          <p className="mb-0">{error?.message ?? 'Ocurrió un error inesperado'}</p>
        </Alert>
      )}

      {!isLoading && !isError && data && (
        <>
          {data.documents.length === 0 ? (
            <Alert variant="info" className="mb-0">
              No se encontraron documentos. ¡Sube tu primer documento para comenzar!
            </Alert>
          ) : (
            <Row className="g-3">
              {data.documents.map((doc, idx) => (
                <Col key={doc.id ?? doc._id ?? idx} xs={12} sm={6} lg={4} xl={3}>
                  <DocumentCard
                    document={doc}
                    onDeleted={handleDeleted}
                    canDelete={canDelete}
                  />
                </Col>
              ))}
            </Row>
          )}
        </>
      )}
    </DashboardWidget>
  );
};

export default RecentDocumentsWidget;
