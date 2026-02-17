import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Modal } from 'react-bootstrap';
import { Trash, ArrowClockwise, TrashFill } from 'react-bootstrap-icons';
import MainLayout from '../components/MainLayout';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import { useTrash } from '../hooks/useTrash';
import { useDocumentDeletion } from '../hooks/useDocumentDeletion';
import { getDocumentDisplayName } from '../utils/documentHelper';
import styles from './TrashPage.module.css';

const TrashPage: React.FC = () => {
  usePageTitle({
    title: 'Papelera',
    subtitle: 'Documentos eliminados - Retención de 30 días',
    documentTitle: 'Papelera',
    metaDescription: 'Gestiona documentos eliminados'
  });

  const { trashDocuments, loading, error, refetch, emptyTrash } = useTrash();
  const { restoreFromTrash, permanentDelete, loading: actionLoading } = useDocumentDeletion();
  
  const [showEmptyModal, setShowEmptyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  /**
   * Maneja la restauración de un documento
   */
  const handleRestore = async (documentId: string) => {
    const restored = await restoreFromTrash(documentId);
    if (restored) {
      refetch(); // Recargar la papelera
    }
  };

  /**
   * Maneja la eliminación permanente de un documento
   */
  const handlePermanentDelete = async () => {
    if (!selectedDocId) return;
    
    const deleted = await permanentDelete(selectedDocId);
    if (deleted) {
      setShowDeleteModal(false);
      setSelectedDocId(null);
      refetch();
    }
  };

  /**
   * Maneja vaciar toda la papelera
   */
  const handleEmptyTrash = async () => {
    const success = await emptyTrash();
    if (success) {
      setShowEmptyModal(false);
    }
  };

  /**
   * Formatea la fecha de eliminación programada
   */
  const formatDeletionDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const daysLeft = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return `${daysLeft} día${daysLeft !== 1 ? 's' : ''} restantes`;
  };

  return (
    <MainLayout>
      <Container className={styles.trashContainer}>
        {/* Header */}
        <Row className={styles.headerSection}>
          <Col>
            <div className={styles.headerContent}>
              <div>
                <h2 className={styles.headerTitle}>
                  <Trash />
                  Papelera
                </h2>
                <p className={styles.headerSubtitle}>
                  Los documentos se eliminarán automáticamente después de 30 días
                </p>
              </div>
              {trashDocuments.length > 0 && (
                <button 
                  className={styles.emptyTrashBtn}
                  onClick={() => setShowEmptyModal(true)}
                  disabled={actionLoading}
                >
                  <TrashFill />
                  Vaciar papelera
                </button>
              )}
            </div>
          </Col>
        </Row>

        {/* Error Alert */}
        {error && (
          <Alert variant="danger" dismissible>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className={styles.loadingContainer}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </Spinner>
            <p className={styles.loadingText}>Cargando documentos...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && trashDocuments.length === 0 && (
          <div className={styles.emptyState}>
            <Trash size={64} className={styles.emptyIcon} />
            <h4 className={styles.emptyTitle}>La papelera está vacía</h4>
            <p className={styles.emptyMessage}>
              Los documentos eliminados aparecerán aquí
            </p>
          </div>
        )}

        {/* Documents List */}
        {!loading && trashDocuments.length > 0 && (
          <Row>
            {trashDocuments.map((doc) => (
              <Col md={6} lg={4} key={doc.id} className="mb-3">
                <Card className={styles.documentCard}>
                  <Card.Body className={styles.cardBody}>
                    <div className={styles.cardHeader}>
                      <h5 className={styles.fileName}>
                        {getDocumentDisplayName(doc)}
                      </h5>
                      <span className={styles.deletedBadge}>Eliminado</span>
                    </div>
                    
                    <div className={styles.cardInfo}>
                      <div className={styles.infoRow}>
                        Eliminado: {new Date(doc.deletedAt).toLocaleDateString()}
                      </div>
                      <div className={`${styles.infoRow} ${styles.warningText}`}>
                        Eliminación permanente: {formatDeletionDate(doc.scheduledDeletionDate)}
                      </div>
                      {doc.deletionReason && (
                        <div className={styles.infoRow}>Motivo: {doc.deletionReason}</div>
                      )}
                    </div>

                    <div className={styles.cardActions}>
                      <button
                        className={styles.restoreBtn}
                        onClick={() => handleRestore(doc.id)}
                        disabled={actionLoading}
                      >
                        <ArrowClockwise />
                        Restaurar
                      </button>
                      <button
                        className={styles.permanentDeleteBtn}
                        onClick={() => {
                          setSelectedDocId(doc.id);
                          setShowDeleteModal(true);
                        }}
                        disabled={actionLoading}
                      >
                        <TrashFill />
                        Eliminar permanentemente
                      </button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Modal: Confirmar vaciar papelera */}
        <Modal show={showEmptyModal} onHide={() => setShowEmptyModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Vaciar papelera</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              ¿Estás seguro de que deseas vaciar la papelera? Esta acción eliminará permanentemente{' '}
              <strong>{trashDocuments.length} documento{trashDocuments.length !== 1 ? 's' : ''}</strong>.
            </p>
            <div className={styles.modalWarning}>
              <strong>⚠️ Esta acción no se puede deshacer</strong>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEmptyModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handleEmptyTrash}
              disabled={actionLoading}
            >
              {actionLoading ? 'Eliminando...' : 'Vaciar papelera'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal: Confirmar eliminación permanente */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Eliminar permanentemente</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              ¿Estás seguro de que deseas eliminar permanentemente este documento?
            </p>
            {selectedDocId && (
              <div className={styles.modalDocument}>
                <strong>{getDocumentDisplayName(trashDocuments.find(doc => doc.id === selectedDocId)!)}</strong>
              </div>
            )}
            <div className={styles.modalWarning}>
              <strong>⚠️ Esta acción no se puede deshacer</strong>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={handlePermanentDelete}
              disabled={actionLoading}
            >
              {actionLoading ? 'Eliminando...' : 'Eliminar permanentemente'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </MainLayout>
  );
};

export default TrashPage;
