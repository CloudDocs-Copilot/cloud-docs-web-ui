import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageInfoTitle';

const Forbidden: React.FC = () => {
  usePageTitle({
    title: '403',
    subtitle: 'Acceso denegado',
    documentTitle: 'Acceso denegado',
    metaDescription: 'No tienes permisos para acceder a esta sección',
  });

  const navigate = useNavigate();

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center vh-100 text-center">
      <Row>
        <Col>
          <h1 className="display-1 fw-bold">403</h1>
          <h2 className="mb-4">Acceso denegado</h2>
          <p className="lead mb-5">
            No tienes permisos para acceder a esta sección. Contacta a un administrador si crees que es un error.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/dashboard')}
          >
            Volver al Dashboard
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Forbidden;
