import React, { useCallback } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import DocumentCard from '../components/DocumentCard';
import { useHttpRequest } from '../hooks/useHttpRequest';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import useOrganization from '../hooks/useOrganization';
import type { Document } from '../types/document.types';
import type { MembershipRole } from '../types/organization.types';


interface DocumentsApiResponse {
  success: boolean;
  count: number;
  documents: Document[];
};

const Dashboard: React.FC = () => {
    
  usePageTitle({
    title: 'Documentos Compartidos',
    subtitle: 'Documentos compartidos contigo por tu equipo',
    documentTitle: 'Documentos Compartidos',
    metaDescription: 'Gestiona y accede a los documentos que tus compañeros han compartido contigo',
  });

  

  // Usar el hook useHttpRequest para obtener documentos
  const { execute, data: documents, isLoading, isError, error } = useHttpRequest<DocumentsApiResponse>();
  

  // Obtener ID de la organización activa desde el contexto
  const { activeOrganization, membership } = useOrganization() as any;

  // Permission: delete only for owner/admin
  const orgRole: MembershipRole =
    membership?.role ||
    (activeOrganization as any)?.role ||
    'member';

  const normalizedRole = typeof orgRole === 'string' ? orgRole.toLowerCase() : orgRole;
  const canDeleteDocuments = normalizedRole === 'owner' || normalizedRole === 'admin';

  const fetchDocuments = useCallback(() => {
    execute({
      method: 'GET',
      url: `/documents/shared`,
    });
  }, [execute]);

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
       
       
        {/* Loading state */}
        {isLoading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading documents...</span>
            </Spinner>
            <p className="mt-3">Loading documents...</p>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <Alert variant="danger" className="my-3">
            <Alert.Heading>Error loading documents</Alert.Heading>
            <p>{error?.message || 'An unexpected error occurred'}</p>
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
                  Sin documentos compartidos contigo aún. Cuando tus compañeros compartan documentos contigo, aparecerán aquí.
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
