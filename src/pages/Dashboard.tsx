import React, { useCallback } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import DocumentCard from '../components/DocumentCard';
import { useHttpRequest } from '../hooks/useHttpRequest';
import { usePageTitle } from '../hooks/usePageInfoTitle';
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
    metaDescription: 'Gestiona y organiza tus documentos con inteligencia artificial'
  });

  

  // Usar el hook useHttpRequest para obtener documentos
  const { execute, data: documents, isLoading, isError, error } = useHttpRequest<DocumentsApiResponse>();

  // ID de organización (TODO: obtener del contexto de organización activa)
  // Usando 'Acme Corporation' para desarrollo
  const organizationId = '697bb5827ee298154fba397b';

  /**
   * Obtiene los documentos recientes
   */
  const fetchDocuments = useCallback(() => {
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
                  <DocumentCard document={doc} />
                </Col>
              ))
            ) : (
              <Col xs={12}>
                <Alert variant="info">
                  No documents found. Upload your first document to get started!
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
