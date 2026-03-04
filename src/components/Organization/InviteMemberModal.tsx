import React, { useState, useEffect } from 'react';
import { useId } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { inviteMember } from '../../services/membership.service';
import { searchUserByEmail } from '../../services/user.service';
import useOrganization from '../../hooks/useOrganization';
import { useToast } from '../../hooks/useToast';
import type { User } from '../../types/user.types';

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess?: () => void;
}

const InviteMemberModal: React.FC<Props> = ({ show, onHide, onSuccess }) => {
  const { activeOrganization, isAdmin, isOwner } = useOrganization();
  const canInvite = isAdmin || isOwner;
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUser, setFoundUser] = useState<User | null>(null);
  const { showToast } = useToast();

  // Buscar usuario cuando cambia el email
  useEffect(() => {
    const searchUser = async () => {
      if (!email || !email.includes('@')) {
        setFoundUser(null);
        return;
      }

      setSearchingUser(true);
      try {
        const user = await searchUserByEmail(email.trim().toLowerCase());
        setFoundUser(user);
      } finally {
        setSearchingUser(false);
      }
    };

    const timeoutId = setTimeout(searchUser, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [email]);

  const handleInvite = async () => {
    if (!activeOrganization) {
      showToast({ message: 'No hay organización activa', variant: 'danger', title: 'Invitación' });
      return;
    }

    if (!foundUser) {
      showToast({ message: 'Usuario no encontrado', variant: 'warning', title: 'Invitación' });
      return;
    }

    setLoading(true);
    try {
      const result = await inviteMember(activeOrganization.id, { userId: foundUser.id, role });
      if (result?.success) {
        showToast({ 
          message: `Invitación enviada a ${email}. Se ha enviado un email con el link de aceptación.`, 
          variant: 'success', 
          title: 'Invitación Enviada' 
        });
        if (onSuccess) onSuccess();
        setEmail('');
        setFoundUser(null);
      } else {
        showToast({ message: result?.message ?? 'Error al invitar', variant: 'danger', title: 'Invitación' });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      const msg = error.response?.data?.error || error.message || 'Error al invitar';
      showToast({ message: msg, variant: 'danger', title: 'Invitación' });
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
            <Form.Label htmlFor="invite-email-input">Email del usuario</Form.Label>
            <div className="position-relative">
              <Form.Control 
                id="invite-email-input"
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                disabled={!canInvite}
                placeholder="usuario@ejemplo.com"
              />
              {searchingUser && (
                <Spinner 
                  animation="border" 
                  size="sm" 
                  className="position-absolute top-50 end-0 translate-middle-y me-2"
                />
              )}
            </div>
            {foundUser && (
              <Form.Text className="text-success">
                ✓ Usuario encontrado: {foundUser.name || foundUser.email}
              </Form.Text>
            )}
            {email && !searchingUser && !foundUser && email.includes('@') && (
              <Form.Text className="text-danger">
                Usuario no encontrado. Verifica el email.
              </Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label htmlFor="invite-role-select">Rol</Form.Label>
            <Form.Select id="invite-role-select" value={role} onChange={(e) => setRole(e.target.value)} disabled={!canInvite}>
              <option value="viewer">Viewer</option>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Form.Select>
            <Form.Text className="text-muted">
              {role === 'admin' && 'Puede gestionar miembros y configuración'}
              {role === 'member' && 'Puede crear y editar documentos'}
              {role === 'viewer' && 'Solo puede ver documentos'}
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={loading}>
          Cancelar
        </Button>
        <Button 
          variant="primary" 
          onClick={handleInvite} 
          disabled={!canInvite || loading || !foundUser || searchingUser}
        >
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Enviando invitación...
            </>
          ) : (
            'Enviar Invitación'
          )}
        </Button>
      </Modal.Footer>
      </Modal>
    </>
  );
};

export default InviteMemberModal;
