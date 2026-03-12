import React, { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
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
            <span className={styles.helpTooltipTitle}>
              <Sparkles size={14} strokeWidth={2} className={styles.tooltipSparkleIcon} />
              Colecciones Inteligentes
            </span>
            <span className={styles.helpTooltipDesc}>Extrae conocimiento de tus documentos con IA</span>
          </span>
          <Sparkles className={styles.helpButtonIcon} size={28} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default MainLayout;
