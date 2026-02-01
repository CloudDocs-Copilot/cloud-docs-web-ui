import React, { useState } from 'react';
import { useId } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { apiClient } from '../api';
import useOrganization from '../hooks/useOrganization';
import { useToast } from '../hooks/useToast';

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
}

const InviteMemberModal: React.FC<Props> = ({ show, onHide, onSuccess }) => {
  const { activeOrganization, isAdmin, isOwner } = useOrganization();
  const canInvite = isAdmin() || isOwner();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleInvite = async () => {
    if (!activeOrganization) {
      showToast({ message: 'No hay organización activa', variant: 'danger', title: 'Invitación' });
      return;
    }
    setLoading(true);
    try {
      await apiClient.post(`/organizations/${activeOrganization.id}/invite`, { email, role });
      showToast({ message: 'Invitación enviada', variant: 'success', title: 'Invitación' });
      if (onSuccess) onSuccess();
      setEmail('');
    } catch (err: unknown) {
      try {
        const e = err as Error;
        const msg = e.message || 'Error al invitar';
        showToast({ message: msg, variant: 'danger', title: 'Invitación' });
      } catch {
        showToast({ message: 'Error al invitar', variant: 'danger', title: 'Invitación' });
      }
    } finally {
      setLoading(false);
    }
  };

  const titleId = useId();

  return (
    <>
      <Modal show={show} onHide={onHide} centered aria-modal={true} aria-labelledby={titleId}>
      <Modal.Header closeButton>
        <Modal.Title id={titleId}>Invitar miembro</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {!canInvite && (
          <div style={{ marginBottom: 8 }} className="text-warning">Necesitas permisos de administrador para invitar miembros.</div>
        )}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={!canInvite} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rol</Form.Label>
            <Form.Select value={role} onChange={(e) => setRole(e.target.value)} disabled={!canInvite}>
              <option value="member">Miembro</option>
              <option value="admin">Administrador</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleInvite} disabled={!canInvite || loading || !email}>
          {loading ? 'Enviando...' : 'Invitar'}
        </Button>
      </Modal.Footer>
      </Modal>
    </>
  );
};

export default InviteMemberModal;
