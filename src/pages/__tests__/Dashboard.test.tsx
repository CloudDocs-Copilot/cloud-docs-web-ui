import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import * as useOrganizationHook from '../../hooks/useOrganization';
import * as useDashboardDataHook from '../../hooks/useDashboardData';

// Mock hooks
jest.mock('../../hooks/useOrganization');
jest.mock('../../hooks/useDashboardData');
jest.mock('../../hooks/usePageInfoTitle', () => ({
  usePageTitle: jest.fn(),
}));

// Mock DashboardGrid to avoid cascading widget mocks
jest.mock('../../components/Dashboard/DashboardGrid', () => ({
  DashboardGrid: ({
    role,
  }: {
    role: string;
    onDocumentsUploaded?: () => void;
    onDocumentDeleted?: () => void;
  }) => <div data-testid="dashboard-grid" data-role={role}>DashboardGrid</div>,
}));

// Mock MainLayout
jest.mock('../../components/MainLayout', () => ({
  __esModule: true,
  default: ({
    children,
    onDocumentsUploaded,
  }: {
    children: React.ReactNode;
    onDocumentsUploaded?: () => void;
  }) => (
    <div data-testid="main-layout">
      <button type="button" onClick={() => onDocumentsUploaded?.()}>
        trigger-uploaded
      </button>
      {children}
    </div>
  ),
}));

const defaultDashboardData = {
  role: 'member' as const,
  stats: null,
  members: null,
  statsLoading: false,
  membersLoading: false,
  statsError: null,
  membersError: null,
  refreshStats: jest.fn(),
  refreshMembers: jest.fn(),
};

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-123', name: 'Acme Corp', role: 'member' },
      membership: null,
      isAdmin: false,
      isOwner: false,
      hasRole: jest.fn().mockReturnValue(false),
    });

    (useDashboardDataHook.useDashboardData as jest.Mock).mockReturnValue(defaultDashboardData);
  });

  it('renders the MainLayout and DashboardGrid', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('main-layout')).toBeInTheDocument();
    expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
  });

  it('passes the role from useDashboardData to DashboardGrid', () => {
    (useDashboardDataHook.useDashboardData as jest.Mock).mockReturnValue({
      ...defaultDashboardData,
      role: 'owner',
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('dashboard-grid')).toHaveAttribute('data-role', 'owner');
  });

  it('passes admin role to DashboardGrid when user is admin', () => {
    (useDashboardDataHook.useDashboardData as jest.Mock).mockReturnValue({
      ...defaultDashboardData,
      role: 'admin',
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('dashboard-grid')).toHaveAttribute('data-role', 'admin');
  });

  it('renders even when no organization is set', () => {
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: null,
      membership: null,
      isAdmin: false,
      isOwner: false,
      hasRole: jest.fn().mockReturnValue(false),
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
  });
});
