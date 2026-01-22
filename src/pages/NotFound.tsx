import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageInfoTitle'; 

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
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="mb-4">Página no encontrada</h2>
          <p className="lead mb-5">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => navigate('/')}
          >
            Volver al inicio
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;