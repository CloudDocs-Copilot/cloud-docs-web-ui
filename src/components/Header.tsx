
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.logoArea}>
        <span className={styles.brandIcon}>📄</span>
        <span className={styles.brandText}>CloudDocs Copilot</span>
      </div>
      <nav className={styles.navMenu}>
        <ul className={styles.navLinks}>
          <li><a href="#">Características</a></li>
          <li><a href="#">Precios</a></li>
          <li><a href="#">Contacto</a></li>
        </ul>
      </nav>
      <div className={styles.headerButtons}>
        <Link to="/login" className={styles.btnLogin}>Iniciar Sesión</Link>
        <Link to="/register" className={styles.btnRegister}>Crear Cuenta</Link>
      </div>
    </header>
  );
};

export default Header;
