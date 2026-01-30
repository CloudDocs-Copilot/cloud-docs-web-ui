import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateOrganization.module.css';
import { useOrganization } from '../hooks/useOrganization';
import { NotificationToast } from '../components/NotificationToast';
import type { Organization } from '../types/organization.types';

export default function CreateOrganization() {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { createOrganization } = useOrganization();
  const navigate = useNavigate();

    const [toastShow, setToastShow] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success');
    const [toastTitle, setToastTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      const org: Organization = await createOrganization({ name: name.trim() });
      if (!org || !org.id) {
        console.error('Organization creation returned invalid object', org);
        setToastVariant('danger');
        setToastMessage('Respuesta inválida del servidor');
        setToastTitle('Error');
        setToastShow(true);
        return;
      }
      setToastVariant('success');
      setToastMessage('Organización creada correctamente');
      setToastTitle('Éxito');
      setToastShow(true);
    } catch (err) {
      console.error('Create organization failed', err);
      const msg = err instanceof Error ? err.message : String(err ?? 'Error desconocido');
      setToastVariant('danger');
      setToastMessage(msg);
      setToastTitle('Error');
      setToastShow(true);
    } finally {
      setSubmitting(false);
    }
  };
  // No automatic redirect timer: user can navigate manually via the button.

  return (
    <div className="d-flex align-items-center justify-content-center py-5" style={{ minHeight: '70vh' }}>
      <NotificationToast
        show={toastShow}
        onClose={() => setToastShow(false)}
        message={toastMessage}
        variant={toastVariant}
        title={toastTitle}
      />

      <div className={`card shadow-sm p-4 ${styles.card}`} style={{ maxWidth: 640, width: '100%' }}>
        <div className="d-flex align-items-center mb-3">
          <div className="me-3 display-6" aria-hidden>🏷️</div>
          <div>
            <h2 className="h4 mb-0">Crear organización</h2>
            <div className="text-muted small">Crea tu espacio de trabajo en CloudDocs Copilot</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mb-3">
          <div className="mb-3">
            <label className="form-label">Nombre de la organización</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la organización"
              required
              disabled={submitting}
            />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? 'Creando...' : 'Crear organización'}
            </button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/')}>Ir a Inicio</button>
          </div>
        </form>

        <div className="mt-3 text-muted small">
          Puedes volver al inicio en cualquier momento con el botón "Ir a Inicio".
        </div>
      </div>
    </div>
  );
}
