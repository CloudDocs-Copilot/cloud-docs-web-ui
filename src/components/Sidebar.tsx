import React from 'react';
import { Nav, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { SIDEBAR_MENU_ITEMS } from '../constants/menuItems';
import styles from './Sidebar.module.css';
import { useNavigate } from 'react-router-dom';
import useOrganization from '../hooks/useOrganization';

interface SidebarProps {
  activeItem: string;
  
}

const Sidebar: React.FC<SidebarProps> = ({ activeItem}) => {

  const navigate = useNavigate();

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h5 className="text-white mb-0">CloudDocs Copilot</h5>
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Mostrar nombre de organización activo (no interactivo) para evitar duplicación del selector en Header */}
          <OrganizationName />
          {/* Gear icon to open Organization Settings */}
          <OverlayTrigger placement="right" overlay={<Tooltip id="org-settings-tooltip">Ajustes de organización</Tooltip>}>
            <Button variant="link" className={styles.orgSettingsBtn} onClick={() => navigate('/organization/settings')}>
              <i className="bi bi-gear-fill" style={{ color: 'white', fontSize: 16 }} />
            </Button>
          </OverlayTrigger>
        </div>
      </div>

      <Nav className={`flex-column ${styles.sidebarNav}`}>
        {SIDEBAR_MENU_ITEMS.map((item) => (
          <Nav.Link
            key={item.id}
            className={`${styles.sidebarItem} ${activeItem === item.id ? styles.active : ''}`}
            onClick={() => {
             
              if (item.path) {
                navigate(item.path);
              }
            }}
          >
            <span className={styles.sidebarIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </Nav.Link>
        ))}
      </Nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userInfo}>
          <div className={styles.userAvatar}>U</div>
          <div className={styles.userDetails}>
            <div className={styles.userName}>Usuario</div>
            <div className={styles.userEmail}>usuario@empresa.com</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

const OrganizationName: React.FC = () => {
  const { activeOrganization } = useOrganization();
  return (
    <div style={{ color: 'white', fontSize: 14 }}>
      {activeOrganization ? activeOrganization.name : 'Sin organización'}
    </div>
  );
};
