import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { DashboardGrid } from '../DashboardGrid';
import type { MembershipRole } from '../../../types/organization.types';

// Mock all widgets to avoid deep dependency chains
jest.mock('../widgets/OrgContextBanner', () => ({
  OrgContextBanner: () => <div data-testid="widget-org-context-banner">OrgContextBanner</div>,
}));
jest.mock('../widgets/RecentDocumentsWidget', () => ({
  RecentDocumentsWidget: () => <div data-testid="widget-recent-documents">RecentDocumentsWidget</div>,
}));
jest.mock('../widgets/QuickActionsWidget', () => ({
  QuickActionsWidget: () => <div data-testid="widget-quick-actions">QuickActionsWidget</div>,
}));
jest.mock('../widgets/StorageWidget', () => ({
  StorageWidget: () => <div data-testid="widget-storage">StorageWidget</div>,
}));
jest.mock('../widgets/MembersOverviewWidget', () => ({
  MembersOverviewWidget: () => <div data-testid="widget-members-overview">MembersOverviewWidget</div>,
}));
jest.mock('../widgets/NotificationsWidget', () => ({
  NotificationsWidget: () => <div data-testid="widget-notifications">NotificationsWidget</div>,
}));
jest.mock('../widgets/PlanInfoWidget', () => ({
  PlanInfoWidget: () => <div data-testid="widget-plan-info">PlanInfoWidget</div>,
}));

const defaultProps = {
  stats: null,
  members: null,
  statsLoading: false,
  membersLoading: false,
  statsError: null,
  membersError: null,
};

const renderGrid = (role: MembershipRole) =>
  render(
    <BrowserRouter>
      <DashboardGrid role={role} {...defaultProps} />
    </BrowserRouter>,
  );

describe('DashboardGrid', () => {
  it('renders OrgContextBanner for all roles', () => {
    const roles: MembershipRole[] = ['owner', 'admin', 'member', 'viewer'];
    roles.forEach((role) => {
      const { unmount } = renderGrid(role);
      expect(screen.getByTestId('widget-org-context-banner')).toBeInTheDocument();
      unmount();
    });
  });

  it('renders owner widgets: storage, members-overview, plan-info, quick-actions, notifications, recent-documents', () => {
    renderGrid('owner');

    expect(screen.getByTestId('widget-storage')).toBeInTheDocument();
    expect(screen.getByTestId('widget-members-overview')).toBeInTheDocument();
    expect(screen.getByTestId('widget-plan-info')).toBeInTheDocument();
    expect(screen.getByTestId('widget-quick-actions')).toBeInTheDocument();
    expect(screen.getByTestId('widget-notifications')).toBeInTheDocument();
    expect(screen.getByTestId('widget-recent-documents')).toBeInTheDocument();
  });

  it('renders admin widgets: storage, members-overview, quick-actions, notifications, recent-documents (no plan-info)', () => {
    renderGrid('admin');

    expect(screen.getByTestId('widget-storage')).toBeInTheDocument();
    expect(screen.getByTestId('widget-members-overview')).toBeInTheDocument();
    expect(screen.getByTestId('widget-quick-actions')).toBeInTheDocument();
    expect(screen.getByTestId('widget-notifications')).toBeInTheDocument();
    expect(screen.getByTestId('widget-recent-documents')).toBeInTheDocument();
    expect(screen.queryByTestId('widget-plan-info')).not.toBeInTheDocument();
  });

  it('renders member widgets: quick-actions, notifications, recent-documents (no storage/members/plan)', () => {
    renderGrid('member');

    expect(screen.getByTestId('widget-quick-actions')).toBeInTheDocument();
    expect(screen.getByTestId('widget-notifications')).toBeInTheDocument();
    expect(screen.getByTestId('widget-recent-documents')).toBeInTheDocument();
    expect(screen.queryByTestId('widget-storage')).not.toBeInTheDocument();
    expect(screen.queryByTestId('widget-members-overview')).not.toBeInTheDocument();
    expect(screen.queryByTestId('widget-plan-info')).not.toBeInTheDocument();
  });

  it('renders viewer widgets: only recent-documents (no quick-actions, notifications, storage)', () => {
    renderGrid('viewer');

    expect(screen.getByTestId('widget-recent-documents')).toBeInTheDocument();
    expect(screen.queryByTestId('widget-quick-actions')).not.toBeInTheDocument();
    expect(screen.queryByTestId('widget-notifications')).not.toBeInTheDocument();
    expect(screen.queryByTestId('widget-storage')).not.toBeInTheDocument();
  });
});
