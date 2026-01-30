
import { Link, useNavigate } from 'react-router-dom';
import styles from './NoOrganization.module.css';

export default function NoOrganization() {
  const navigate = useNavigate();
  // No automatic redirect timer: user decides to navigate manually.

  return (
    <div className={styles.outer}>
      <div className={`${styles.inner} p-4 text-center`}>
        <h2>No tienes una organización activa</h2>
        <p className="text-muted">Para continuar, crea una organización o pídele a un administrador que te agregue.</p>
        <div className="d-flex justify-content-center gap-2 mt-3">
          <Link to="/create-organization" className="btn btn-primary">Crear organización</Link>
          <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>Ir a Inicio</button>
        </div>
        <div className="mt-3 text-muted small">Puedes volver al inicio en cualquier momento con el botón "Ir a Inicio".</div>
      </div>
    </div>
  );
}
