import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import { Logo } from '../brand'; 

const NotFound: React.FC = () => {
    usePageTitle({
    title: '404', 
    subtitle: 'Página no encontrada',
    documentTitle: 'Error 404',
    metaDescription: 'La página que buscas no existe en CloudDocs Copilot'
  });
  const navigate = useNavigate();

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      <Row>
        <Col>
          <div 
            onClick={() => navigate('/dashboard')}
            style={{ 
              cursor: 'pointer', 
              display: 'inline-block',
              marginBottom: '2rem',
              transition: 'transform 0.2s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Logo size={80} variant="gradient" animated />
          </div>
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="mb-4">Carpeta vacía</h2>
          <p className="lead mb-3">
            Esta ubicación no contiene documentos.
          </p>
          <p className="text-muted mb-5">
            La página que buscas no existe en tu espacio de trabajo.<br />
            Ni siquiera con IA logramos encontrarla.
          </p>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => navigate('/')}
          >
            Regresar a mis archivos
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;