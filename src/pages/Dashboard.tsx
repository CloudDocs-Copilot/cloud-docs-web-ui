import React, { useCallback, useState } from 'react';
import { Container } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
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
  const { activeOrganization } = useOrganization();
  const orgName = activeOrganization?.name ?? 'Mi Organización';

  usePageTitle({
    title: `Dashboard - ${orgName}`,
    subtitle: 'Vista general de tu organización',
    documentTitle: `Dashboard - ${orgName}`,
    metaDescription: 'Dashboard contextual con información relevante según tu rol y organización',
  });

  

  // Usar el hook useHttpRequest para obtener documentos
  const { execute, data: documents, isLoading, isError, error } = useHttpRequest<DocumentsApiResponse>();
  

  // Obtener ID de la organización activa desde el contexto
  const { activeOrganization, membership, isAdmin, isOwner } = useOrganization();
  const { can } = usePermissions();
  const { orgStats, statsLoading, statsError, notifications, notificationsLoading } = useDashboardData();
  const organizationId = activeOrganization?.id ?? '';

  // Incrementing this key causes RecentDocumentsWidget to re-fetch
  const [docsRefreshKey, setDocsRefreshKey] = useState(0);

  const handleDocumentsUploaded = useCallback(() => {
    setDocsRefreshKey((k) => k + 1);
  }, []);

  const handleDocumentDeleted = useCallback(() => {
    setDocsRefreshKey((k) => k + 1);
  }, []);

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
