import React from 'react';
import { usePageContext } from '../hooks/usePageContext';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './MainLayout.module.css';
import { useLocation } from 'react-router-dom';
import type { Document } from '../types/document.types';

interface MainLayoutProps {
  children: React.ReactNode;
  /** Callback cuando se suben documentos desde el Header */
  onDocumentsUploaded?: (documents: Document[]) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onDocumentsUploaded }) => {
  const location = useLocation();
  const activeMenuItem = location.pathname.split('/')[1] || 'colecciones';
  const { pageInfo } = usePageContext();

  return (
    <div className={styles.layoutWrapper}>
      <Sidebar activeItem={activeMenuItem}  />
      
      <div className={styles.mainContent}>
        <Header onDocumentsUploaded={onDocumentsUploaded} />
        
        <div className={styles.contentArea}>
          {pageInfo.title && (
            <div className={styles.contentHeader}>
              {pageInfo.breadcrumbs && (
                <nav className={styles.breadcrumbs}>
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
        </div>

        {/* Help Button */}
        <button className={styles.helpButton}>
          <span>?</span>
        </button>
      </div>
    </div>
  );
};

export default MainLayout;
