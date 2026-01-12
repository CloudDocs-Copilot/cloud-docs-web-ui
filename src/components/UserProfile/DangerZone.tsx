import { Button, Card } from 'react-bootstrap';
import styles from './DangerZone.module.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

interface DangerZoneProps {
  onDeleteAccount?: () => void;
}

export function DangerZone({ onDeleteAccount }: DangerZoneProps) {
  return (
    <Card className={styles.container}>
      <Card.Body className={styles.body}>
        <div className={styles.content}>
          <div>
            <h3 className={styles.title}>
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              Zona de Peligro
            </h3>
            <p className={styles.text}>
              Las acciones son permanentes y no se pueden deshacer.
            </p>
          </div>
          <Button 
            variant="outline-danger" 
            size="sm" 
            className={styles.deleteButton}
            onClick={onDeleteAccount}
          >

            <i className="bi bi-trash me-1"></i>
            Eliminar cuenta
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
