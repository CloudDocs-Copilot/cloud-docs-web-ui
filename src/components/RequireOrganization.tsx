import React from 'react';
import { Spinner } from 'react-bootstrap';
import { useOrganization } from '../hooks/useOrganization';
import NoOrganization from '../pages/NoOrganization';

const RequireOrganization: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeOrganization, loading } = useOrganization();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Spinner animation="border" role="status" />
          <div style={{ marginTop: 8 }}>Cargando organización...</div>
        </div>
      </div>
    );
  }

  // No automatic redirect: user must choose to create or navigate manually.

  if (!activeOrganization) {
    return <NoOrganization />;
  }

  return <>{children}</>;
};

export default RequireOrganization;
