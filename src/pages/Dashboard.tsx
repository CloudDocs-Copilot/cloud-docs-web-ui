import React, { useCallback, useState } from 'react';
import { Container } from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import useOrganization from '../hooks/useOrganization';
import { useDashboardData } from '../hooks/useDashboardData';
import { DashboardGrid } from '../components/Dashboard/DashboardGrid';

const Dashboard: React.FC = () => {
  const {
    role,
    stats,
    members,
    statsLoading,
    membersLoading,
    statsError,
    membersError,
  } = useDashboardData();

  const { activeOrganization } = useOrganization();
  const orgName = activeOrganization?.name ?? 'Mi Organización';

  usePageTitle({
    title: `Dashboard - ${orgName}`,
    subtitle: 'Vista general de tu organización',
    documentTitle: `Dashboard - ${orgName}`,
    metaDescription: 'Dashboard contextual con información relevante según tu rol y organización',
  });

  const [docsRefreshKey, setDocsRefreshKey] = useState(0);

  const handleDocumentsUploaded = useCallback(() => {
    setDocsRefreshKey((k) => k + 1);
  }, []);

  const handleDocumentDeleted = useCallback(() => {
    setDocsRefreshKey((k) => k + 1);
  }, []);

  return (
    <MainLayout onDocumentsUploaded={handleDocumentsUploaded}>
      <Container fluid>
        <DashboardGrid
          role={role}
          stats={stats}
          members={members}
          statsLoading={statsLoading}
          membersLoading={membersLoading}
          statsError={statsError}
          membersError={membersError}
          docsRefreshKey={docsRefreshKey}
          onDocumentsUploaded={handleDocumentsUploaded}
          onDocumentDeleted={handleDocumentDeleted}
        />
      </Container>
    </MainLayout>
  );
};

export default Dashboard;
