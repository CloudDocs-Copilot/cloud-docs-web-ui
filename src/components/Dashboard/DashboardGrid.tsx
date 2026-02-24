import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { DASHBOARD_WIDGETS_BY_ROLE } from '../../constants/dashboardWidgets';
import type { MembershipRole } from '../../types/organization.types';
import type { OrgStats, OrgMember } from '../../services/dashboard.service';
import { OrgContextBanner } from './widgets/OrgContextBanner';
import { RecentDocumentsWidget } from './widgets/RecentDocumentsWidget';
import { QuickActionsWidget } from './widgets/QuickActionsWidget';
import { StorageWidget } from './widgets/StorageWidget';
import { MembersOverviewWidget } from './widgets/MembersOverviewWidget';
import { NotificationsWidget } from './widgets/NotificationsWidget';
import { PlanInfoWidget } from './widgets/PlanInfoWidget';

interface DashboardGridProps {
  role: MembershipRole;
  stats: OrgStats | null;
  members: OrgMember[] | null;
  statsLoading: boolean;
  membersLoading: boolean;
  statsError: string | null;
  membersError: string | null;
  docsRefreshKey?: number;
  onDocumentsUploaded?: () => void;
  onDocumentDeleted?: () => void;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({
  role,
  stats,
  members,
  statsLoading,
  membersLoading,
  statsError,
  membersError,
  docsRefreshKey,
  onDocumentsUploaded,
  onDocumentDeleted,
}) => {
  const widgetConfigs = DASHBOARD_WIDGETS_BY_ROLE[role] ?? DASHBOARD_WIDGETS_BY_ROLE.viewer;
  const sorted = [...widgetConfigs].sort((a, b) => a.order - b.order);

  const renderWidget = (id: string) => {
    switch (id) {
      case 'org-context-banner':
        return <OrgContextBanner />;
      case 'recent-documents':
        return (
          <RecentDocumentsWidget
            refreshKey={docsRefreshKey}
            onDocumentDeleted={onDocumentDeleted}
          />
        );
      case 'quick-actions':
        return <QuickActionsWidget onUploadClick={onDocumentsUploaded} />;
      case 'storage':
        return (
          <StorageWidget stats={stats} loading={statsLoading} error={statsError} />
        );
      case 'members-overview':
        return (
          <MembersOverviewWidget
            members={members}
            loading={membersLoading}
            error={membersError}
          />
        );
      case 'notifications':
        return <NotificationsWidget />;
      case 'plan-info':
        return <PlanInfoWidget />;
      default:
        return null;
    }
  };

  return (
    <Row className="g-4">
      {sorted.map(({ id, lgCols = 4, mdCols = 6 }) => {
        const widgetContent = renderWidget(id);
        if (!widgetContent) return null;

        // Banner uses full width; others use responsive cols
        const isBanner = id === 'org-context-banner';

        if (isBanner) {
          return (
            <Col key={id} xs={12}>
              {widgetContent}
            </Col>
          );
        }

        return (
          <Col key={id} xs={12} md={mdCols} lg={lgCols}>
            {widgetContent}
          </Col>
        );
      })}
    </Row>
  );
};

export default DashboardGrid;
