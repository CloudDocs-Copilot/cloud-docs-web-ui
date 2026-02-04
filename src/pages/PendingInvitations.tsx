import React from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import InvitationCard from '../components/Invitations/InvitationCard';
import { useInvitations } from '../hooks/useInvitations';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import styles from './PendingInvitations.module.css';

const PendingInvitations: React.FC = () => {
  const navigate = useNavigate();
  const { invitations, loading, acceptInvitation, rejectInvitation } = useInvitations();

  usePageTitle({
    title: 'Invitaciones Pendientes',
    subtitle: 'Gestiona las invitaciones a organizaciones',
    documentTitle: 'Invitaciones Pendientes',
    metaDescription: 'Ver y gestionar invitaciones pendientes a organizaciones',
  });

  const handleAccept = async (id: string) => {
    const result = await acceptInvitation(id);
    if (result?.membership?.organization) {
      // Redirigir al dashboard o a la organización
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    }
  };

  const handleReject = async (id: string) => {
    await rejectInvitation(id);
  };

  if (loading && invitations.length === 0) {
    return (
      <MainLayout>
        <Container fluid className={styles.container}>
          <div className={styles.loadingContainer}>
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Cargando invitaciones...</p>
          </div>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container fluid className={styles.container}>
        <Row>
          <Col lg={8} className="mx-auto">
            <div className={styles.header}>
              <h2 className={styles.title}>
                Invitaciones Pendientes
                {invitations.length > 0 && (
                  <span className={styles.count}>({invitations.length})</span>
                )}
              </h2>
              <p className={styles.subtitle}>
                Revisa y gestiona las invitaciones que has recibido
              </p>
            </div>

            {invitations.length === 0 ? (
              <Alert variant="info" className={styles.emptyState}>
                <Alert.Heading>No tienes invitaciones pendientes</Alert.Heading>
                <p>
                  Cuando recibas invitaciones a organizaciones, aparecerán aquí.
                </p>
              </Alert>
            ) : (
              <div className={styles.invitationsList}>
                {invitations.map((invitation) => (
                  <InvitationCard
                    key={invitation.id}
                    invitation={invitation}
                    onAccept={handleAccept}
                    onReject={handleReject}
                  />
                ))}
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
};

export default PendingInvitations;
