import React, { useCallback } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import DocumentCard from '../components/DocumentCard';
import { useHttpRequest } from '../hooks/useHttpRequest';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import useOrganization from '../hooks/useOrganization';
import { usePermissions } from '../hooks/usePermissions';
import { useDashboardData } from '../hooks/useDashboardData';
import {
  StorageWidget,
  DocumentStatsWidget,
  MemberStatsWidget,
  RecentActivityWidget,
  QuickActionsWidget,
} from '../components/Dashboard';
import type { Document } from '../types/document.types';


interface DocumentsApiResponse {
  success: boolean;
  count: number;
  documents: Document[];
};

const Dashboard: React.FC = () => {
    
  usePageTitle({
    title: 'Mis Documentos',
    subtitle: 'Organizado automáticamente con IA',
    documentTitle: 'Mis Documentos',
    metaDescription: 'Gestiona y organiza tus documentos con inteligencia artificial',
  });

  

  // Usar el hook useHttpRequest para obtener documentos
  const { execute, data: documents, isLoading, isError, error } = useHttpRequest<DocumentsApiResponse>();
  

  // Obtener ID de la organización activa desde el contexto
  const { activeOrganization, membership, isAdmin, isOwner } = useOrganization();
  const { can } = usePermissions();
  const { orgStats, statsLoading, statsError, notifications, notificationsLoading } = useDashboardData();
  const organizationId = activeOrganization?.id ?? '';

  // Permission: delete only for owner/admin roles (membership wins over activeOrganization)
  const rawRole = membership?.role ?? activeOrganization?.role ?? 'member';
  const orgRole = typeof rawRole === 'string' ? rawRole.toLowerCase() : rawRole;
  const canDeleteDocuments = orgRole === 'owner' || orgRole === 'admin';

  const fetchDocuments = useCallback(() => {
    if (!organizationId) return;
    execute({
      method: 'GET',
      url: `/documents/recent/${organizationId}`,
    });
  }, [execute, organizationId]);

  /**
   * Callback cuando se suben documentos exitosamente
   */
  const handleDocumentsUploaded = useCallback(() => {
    // Refrescar la lista de documentos
    fetchDocuments();
  }, [fetchDocuments]);

  /**
   * Callback cuando se elimina un documento
   */
  const handleDocumentDeleted = useCallback(() => {
    // Refrescar la lista de documentos
    fetchDocuments();
  }, [fetchDocuments]);



  React.useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

 
  return (
    <MainLayout onDocumentsUploaded={handleDocumentsUploaded}>
      <Container fluid>

        {/* Stats Row - KPI Cards */}
        <Row className="g-3 mb-4">
          <Col xs={12} md={6} lg={3}>
            <DocumentStatsWidget
              totalDocuments={documents?.documents?.length ?? 0}
              loading={statsLoading}
              error={statsError}
            />
          </Col>
          <Col xs={12} md={6} lg={3}>
            <StorageWidget
              storageStats={orgStats?.storage ?? null}
              loading={statsLoading}
              error={statsError}
            />
          </Col>
          {(isAdmin || isOwner) && (
            <Col xs={12} md={6} lg={3}>
              <MemberStatsWidget
                memberStats={orgStats?.members ?? null}
                loading={statsLoading}
                error={statsError}
              />
            </Col>
          )}
          <Col xs={12} md={6} lg={3}>
            <QuickActionsWidget
              canUpload={can('documents:create')}
              canInvite={can('members:invite')}
            />
          </Col>
        </Row>

        {/* Activity Row */}
        <Row className="g-3 mb-4">
          <Col xs={12} lg={8}>
            <RecentActivityWidget
              notifications={notifications.slice(0, 5)}
              loading={notificationsLoading}
              error={null}
            />
          </Col>
        </Row>

        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando documentos...</span>
            </Spinner>
            <p className="mt-3">Cargando documentos...</p>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <Alert variant="danger" className="my-3">
            <Alert.Heading>Error al cargar documentos</Alert.Heading>
            <p>{error?.message || 'Ocurrió un error inesperado'}</p>
          </Alert>
        )}

        {/* Success state */}
        {!isLoading && !isError && documents && (
          <Row className="g-4">
            {documents.documents.length > 0 ? (
              documents.documents.map((doc, index) => (
                <Col key={index} xs={12} sm={6} md={4} lg={3}>
                  <DocumentCard
                    document={doc}
                    onDeleted={handleDocumentDeleted}
                    canDelete={canDeleteDocuments}
                  />
                </Col>
              ))
            ) : (
              <Col xs={12}>
                <Alert variant="info">
                  No se encontraron documentos. ¡Sube tu primer documento para comenzar!
                </Alert>
              </Col>
            )}
          </Row>
        )}
      </Container>
    </MainLayout>
  );
};

export default Dashboard;
