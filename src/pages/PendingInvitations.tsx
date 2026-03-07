import React from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import InvitationCard from '../components/Invitations/InvitationCard';
import { useInvitations } from '../hooks/useInvitations';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import useOrganization from '../hooks/useOrganization';
import styles from './PendingInvitations.module.css';

const PendingInvitations: React.FC = () => {
  const navigate = useNavigate();
  const { invitations, loading, acceptInvitation, rejectInvitation } = useInvitations();
  const { fetchOrganizations, setActiveOrganization } = useOrganization();

  usePageTitle({
    title: 'Invitaciones Pendientes',
    subtitle: 'Gestiona las invitaciones a organizaciones',
    documentTitle: 'Invitaciones Pendientes',
    metaDescription: 'Ver y gestionar invitaciones pendientes a organizaciones',
  });

  const handleAccept = async (id: string) => {
    const result = await acceptInvitation(id);
    if (result?.membership?.organization) {
      // Recargar el contexto de organizaciones
      await fetchOrganizations();
      
      // Establecer la nueva organización como activa
      const newOrgId = typeof result.membership.organization === 'string' 
        ? result.membership.organization 
        : result.membership.organization.id;
      
      if (newOrgId) {
        await setActiveOrganization(newOrgId);
      }
      
      // Redirigir al dashboard
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
          {/* Left column: invitation cards */}
          <Col md={8} className={styles.cardsColumn}>
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

          {/* Right column: informational panel */}
          <Col md={4} className={styles.infoColumn}>
            <div className={styles.infoPanel}>
              <div className={styles.infoPanelSection}>
                <div className={styles.infoPanelIcon}>📬</div>
                <h5 className={styles.infoPanelTitle}>¿Qué son las invitaciones?</h5>
                <p className={styles.infoPanelText}>
                  Las invitaciones son solicitudes de acceso enviadas por administradores de organizaciones.
                  Al aceptar una invitación, pasarás a formar parte de esa organización y podrás
                  acceder a sus documentos y recursos compartidos.
                </p>
              </div>

              <hr className={styles.infoDivider} />

              <div className={styles.infoPanelSection}>
                <div className={styles.infoPanelIcon}>✅</div>
                <h5 className={styles.infoPanelTitle}>Al aceptar una invitación</h5>
                <ul className={styles.infoPanelList}>
                  <li>Obtendrás acceso inmediato a los documentos de la organización.</li>
                  <li>Tu rol determinará los permisos que tendrás dentro de la organización.</li>
                  <li>Podrás cambiar de organización activa en cualquier momento desde tu perfil.</li>
                </ul>
              </div>

              <hr className={styles.infoDivider} />

              <div className={styles.infoPanelSection}>
                <div className={styles.infoPanelIcon}>ℹ️</div>
                <h5 className={styles.infoPanelTitle}>Roles disponibles</h5>
                <div className={styles.rolesGrid}>
                  <div className={styles.roleItem}>
                    <span className={`${styles.roleBadge} ${styles.roleBadgeOwner}`}>OWNER</span>
                    <span className={styles.roleDesc}>Control total de la organización</span>
                  </div>
                  <div className={styles.roleItem}>
                    <span className={`${styles.roleBadge} ${styles.roleBadgeAdmin}`}>ADMIN</span>
                    <span className={styles.roleDesc}>Gestión de miembros y configuración</span>
                  </div>
                  <div className={styles.roleItem}>
                    <span className={`${styles.roleBadge} ${styles.roleBadgeMember}`}>MEMBER</span>
                    <span className={styles.roleDesc}>Acceso y colaboración en documentos</span>
                  </div>
                  <div className={styles.roleItem}>
                    <span className={`${styles.roleBadge} ${styles.roleBadgeViewer}`}>VIEWER</span>
                    <span className={styles.roleDesc}>Solo lectura de documentos</span>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </MainLayout>
  );
};

export default PendingInvitations;
