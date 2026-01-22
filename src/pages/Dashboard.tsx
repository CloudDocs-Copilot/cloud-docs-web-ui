import React from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import DocumentCard from '../components/DocumentCard';
import { useHttpRequest } from '../hooks/useHttpRequest';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import { apiClient } from '../api/httpClient.config';
import type { Document } from '../types/document.types';

const Dashboard: React.FC = () => {
  usePageTitle({
    title: 'Mis Documentos',
    subtitle: 'Organizado automáticamente con IA',
    documentTitle: 'Mis Documentos',
    metaDescription: 'Gestiona y organiza tus documentos con inteligencia artificial'
  });

  // Estados simples para el login temporal
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  // Usar el hook useHttpRequest para obtener documentos
  const { execute, data: documents, isLoading, isError, error } = useHttpRequest<Document[]>();

  // ⚠️ TEMPORAL: Auto-login con credenciales hardcodeadas
  // TODO: ELIMINAR EN PRODUCCIÓN - Implementar sistema de autenticación real
  React.useEffect(() => {
    let isMounted = true;

    const performLogin = async () => {
      setIsLoggingIn(true);
      setLoginError(null);

      try {
        await apiClient.post('/auth/login', {
          email: 'admin@admin.com',
          password: '123'
        });

        if (isMounted) {
          setIsAuthenticated(true);
          setIsLoggingIn(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Login failed';
          setLoginError(errorMessage);
          setIsLoggingIn(false);
        }
      }
    };

    performLogin();

    return () => {
      isMounted = false;
    };
  }, []);

  React.useEffect(() => {
    // Solo cargar documentos después de autenticarse
    if (!isAuthenticated) return;

    // Obtener documentos al montar el componente
    const userId = localStorage.getItem('userId') || 'default-user';
    const organizationId = localStorage.getItem('organizationId') || '697008fa7bdfacca3aa23687';
    
    execute({
      method: 'GET',
      url: `/documents/recent/${organizationId}`,
      config: {
        params: { userId }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  return (
    <MainLayout>
      <Container fluid>
        {/* ⚠️ TEMPORAL: Mostrar estado de login */}
        {isLoggingIn && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Authenticating...</span>
            </Spinner>
            <p className="mt-3">Authenticating...</p>
          </div>
        )}

        {/* Error de login */}
        {loginError && (
          <Alert variant="danger" className="my-3">
            <Alert.Heading>Authentication Error</Alert.Heading>
            <p>{loginError}</p>
          </Alert>
        )}

        {/* Loading state */}
        {!isLoggingIn && isLoading && (
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading documents...</span>
            </Spinner>
            <p className="mt-3">Loading documents...</p>
          </div>
        )}

        {/* Error state */}
        {!isLoggingIn && isError && (
          <Alert variant="danger" className="my-3">
            <Alert.Heading>Error loading documents</Alert.Heading>
            <p>{error?.message || 'An unexpected error occurred'}</p>
          </Alert>
        )}

        {/* Success state */}
        {!isLoggingIn && !isLoading && !isError && documents && isAuthenticated && (
          <Row className="g-4">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <Col key={doc.id} xs={12} sm={6} md={4} lg={3}>
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
