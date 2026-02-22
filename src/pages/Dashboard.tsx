import React, { useCallback, useEffect, useState } from 'react';
import { Container} from 'react-bootstrap';
import MainLayout from '../components/MainLayout';
import { usePageTitle } from '../hooks/usePageInfoTitle';
import useOrganization from '../hooks/useOrganization';

import { useDashboardData } from '../hooks/useDashboardData';
import type { OrgStats } from '../types/dashboard.types';
import type { MembershipRole } from '../types/organization.types';
import { useHttpRequest } from '../hooks/useHttpRequest';
import type { Document } from '../types/document.types';
import { DashboardGrid } from '../components/Dashboard/DashboardGrid';


interface DocumentsApiResponse {
  success: boolean;
  count: number;
  documents: Document[];
}

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

  

  // Usar el hook useHttpRequest para obtener documentos
  const { execute} = useHttpRequest<DocumentsApiResponse>();

  
  const { role = 'member', orgStats, statsLoading, statsError } = useDashboardData() as DashboardDataReturn;
  const organizationId = activeOrganization?.id ?? '';

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
          stats={orgStats}
          members={null}
          statsLoading={statsLoading}
          membersLoading={false}
          statsError={statsError}
          membersError={null}
          docsRefreshKey={docsRefreshKey}
          onDocumentsUploaded={handleDocumentsUploaded}
          onDocumentDeleted={handleDocumentDeleted}
        />
      </Container>
    </MainLayout>
  );
};

export default Dashboard;
