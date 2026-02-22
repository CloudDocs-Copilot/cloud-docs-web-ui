import React, { useCallback, useEffect, useState } from 'react';
import { Container} from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import useOrganization from '../hooks/useOrganization';

import { useDashboardData } from '../hooks/useDashboardData';
import type { OrgStats } from '../types/dashboard.types';
import type { MembershipRole } from '../types/organization.types';
import { useHttpRequest } from '../hooks/useHttpRequest';
import { DashboardGrid } from '../components/Dashboard/DashboardGrid';
import { DashboardGrid } from '../components/Dashboard/DashboardGrid';
};

interface DashboardDataReturn {
  role?: MembershipRole;
  orgStats: OrgStats | null;
  statsLoading: boolean;
  statsError: string | null;
}

const Dashboard: React.FC = () => {
  
  const { activeOrganization } = useOrganization();
  const orgName = activeOrganization?.name ?? 'Mi Organización';

  usePageTitle({
    title: `Dashboard - ${orgName}`,
    subtitle: 'Vista general de tu organización',
    documentTitle: `Dashboard - ${orgName}`,
    metaDescription: 'Dashboard contextual con información relevante según tu rol y organización',
  });

  const {
    role,
  const { execute, data: documents, isLoading, isError, error } = useHttpRequest<DocumentsApiResponse>();

    stats,
    members,
  // Obtener ID de la organización activa desde el contexto
  const { activeOrganization, membership, isAdmin, isOwner } = useOrganization();
  const { can } = usePermissions();
  const { orgStats, statsLoading, statsError, notifications, notificationsLoading } = useDashboardData();
  } = useDashboardData();

  // Incrementing this key causes RecentDocumentsWidget to re-fetch
  const [docsRefreshKey, setDocsRefreshKey] = useState(0);

  const handleDocumentsUploaded = useCallback(() => {
    setDocsRefreshKey((k) => k + 1);
  }, []);

  const handleDocumentDeleted = useCallback(() => {
    setDocsRefreshKey((k) => k + 1);
  }, []);

  
  
  

  const fetchDocuments = useCallback(() => {
    if (!organizationId) return;
    execute({ method: 'GET', url: `/documents/recent/${organizationId}` });
  }, [execute, organizationId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <MainLayout onDocumentsUploaded={handleDocumentsUploaded}>
      <Container fluid>
        <DashboardGrid
          role={role}
              storageStats={orgStats?.storage ?? null}
          members={null}
              loading={statsLoading}
              error={statsError}
                memberStats={orgStats?.members ?? null}
                loading={statsLoading}
                error={statsError}
          membersLoading={membersLoading}
              error={null}

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
