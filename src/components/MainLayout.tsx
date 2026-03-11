import React, { useEffect, useRef } from 'react';
import { usePageContext } from '../hooks/usePageContext';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './MainLayout.module.css';
import { useLocation, useNavigate } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeMenuItem = location.pathname.split('/')[1] || 'colecciones';
  const { pageInfo } = usePageContext();
  const mainRef = useRef<HTMLElement>(null);

  // Move focus to main content on route change for accessibility
  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  return (
    <div className={styles.layoutWrapper}>
      {/* Skip to main content link for keyboard users */}
      <a href="#main-content" className="visually-hidden-focusable">
        Ir al contenido principal
      </a>
      <Sidebar activeItem={activeMenuItem}  />
      
      <div className={styles.mainContent}>
        <Header />
        
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          className={styles.contentArea}
          style={{ outline: 'none' }}
        >
          {pageInfo.title && (
            <div className={styles.contentHeader}>
              {pageInfo.breadcrumbs && (
                <nav className={styles.breadcrumbs} aria-label="Ruta de navegación">
                  {pageInfo.breadcrumbs.map((crumb, i) => (
                    <span key={i}>{crumb.label}</span>
                  ))}
                </nav>
              )}
              <div className={styles.titleRow}>
                <div>
                  <h2 className={styles.pageTitle}>{pageInfo.title}</h2>
                  {pageInfo.subtitle && (
                    <p className={styles.pageSubtitle}>{pageInfo.subtitle}</p>
                  )}
                </div>
                {pageInfo.actions && (
                  <div className={styles.pageActions}>{pageInfo.actions}</div>
                )}
              </div>
            </div>
          )}
          {children}
        </main>

        {/* AI Collections Button */}
        <button
          className={styles.helpButton}
          aria-label="Colecciones Inteligentes"
          onClick={() => navigate('/collections')}
        >
          <span className={styles.helpTooltip}>
            <span className={styles.helpTooltipTitle}>✨ Colecciones Inteligentes</span>
            <span className={styles.helpTooltipDesc}>Extrae conocimiento de tus documentos con IA</span>
          </span>
          <svg className={styles.helpButtonIcon} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2 L13.5 8.5 L20 10 L13.5 11.5 L12 18 L10.5 11.5 L4 10 L10.5 8.5 Z" />
            <path d="M19 2 L19.8 4.2 L22 5 L19.8 5.8 L19 8 L18.2 5.8 L16 5 L18.2 4.2 Z" />
            <path d="M5 16 L5.7 17.8 L7.5 18.5 L5.7 19.2 L5 21 L4.3 19.2 L2.5 18.5 L4.3 17.8 Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MainLayout;
