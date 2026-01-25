import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, InputGroup } from 'react-bootstrap';
import styles from './Header.module.css';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login');
    }
  };

  const avatarLetter = (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const displayName = user?.name || user?.email || 'Usuario';

  
  return (
    <header className={styles.header}>
      <div className={styles.searchBarWrapper}>
        <InputGroup>
          <InputGroup.Text className={styles.searchIcon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" />
            </svg>
          </InputGroup.Text>

          <Form.Control
            type="text"
            placeholder="Pregunta a tus documentos..."
            className={styles.searchInput}
          />
        </InputGroup>
      </div>

      <div className={styles.headerActions}>
        
        <Button variant="link" className={styles.iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeWidth="2" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeWidth="2" />
          </svg>
        </Button>

        <Button variant="link" className={styles.iconBtn}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="3" strokeWidth="2" />
            <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" strokeWidth="2" />
          </svg>
        </Button>

        <div
          className={styles.userBadge}
          onClick={() => navigate('/profile')}
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.userAvatarSmall}>{avatarLetter}</div>
          <span>{displayName}</span>
        </div>

        <Button variant="primary" className={styles.btnUpload}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            style={{ marginRight: '6px' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeWidth="2" />
            <polyline points="17 8 12 3 7 8" strokeWidth="2" />
            <line x1="12" y1="3" x2="12" y2="15" strokeWidth="2" />
          </svg>
          Subir
        </Button>

        <Button variant="danger" className={styles.btnLogout} onClick={handleLogout}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            style={{ marginRight: '6px' }}
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" />
            <polyline points="16 17 21 12 16 7" strokeWidth="2" />
            <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" />
          </svg>
          Salir
        </Button>
      </div>
    </header>
  );
};

export default Header;
