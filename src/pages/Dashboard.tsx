import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import DocumentCard from '../components/DocumentCard';
import { getMockDocuments } from '../services/mockDocumentList';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import type { Document } from '../types/document.types';

const Dashboard: React.FC = () => {
  usePageTitle({
    title: 'Mis Documentos',
    subtitle: 'Organizado automáticamente con IA',
    documentTitle: 'Mis Documentos',
    metaDescription: 'Gestiona y organiza tus documentos con inteligencia artificial'
  });
// Datos de ejemplo
const [documents, setDocuments] = React.useState<Document[]>([]);

 React.useEffect(() => {
   getMockDocuments().then((docs) => setDocuments(docs));
 }, []);

  return (
    <MainLayout>
      <Container fluid>
        <Row className="g-4">
          {documents.map((doc) => (
            <Col key={doc.id} xs={12} sm={6} md={4} lg={3}>
              <DocumentCard document={doc} />
            </Col>
          ))}
        </Row>
      </Container>
    </MainLayout>
  );
};

export default Dashboard;
