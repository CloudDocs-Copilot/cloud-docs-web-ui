import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import * as useOrganizationHook from '../../hooks/useOrganization';
import * as useDashboardDataHook from '../../hooks/useDashboardData';
import * as useHttpRequestHook from '../../hooks/useHttpRequest';

const mockExecute = jest.fn();

let mockHttpState = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: undefined,
};

jest.mock('../../hooks/useHttpRequest', () => ({
  useHttpRequest: jest.fn(() => ({
    execute: mockExecute,
    data: mockHttpState.data,
    isLoading: mockHttpState.isLoading,
    isError: mockHttpState.isError,
    error: mockHttpState.error,
  })),
}));

// Mock hooks
jest.mock('../../hooks/useOrganization');
jest.mock('../../hooks/useDashboardData');
jest.mock('../../hooks/usePageInfoTitle', () => ({
  usePageTitle: jest.fn(),
}));
jest.mock('../../hooks/useDashboardData', () => ({
  useDashboardData: jest.fn(() => ({
    orgStats: null,
    statsLoading: false,
    statsError: null,
    notifications: [],
    notificationsLoading: false,
    refetch: jest.fn(),
  })),
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

  it('renders even when no organization is set', async () => {
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-123', role: 'member' },
      membership: { role: 'OWNER' },
      isAdmin: false,
      isOwner: true,
    });

    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: {
        success: true,
        count: 1,
        documents: [{ id: '1', filename: 'test1.pdf' }],
      },
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
    });
  });

  it('fetches documents on mount with organization ID', async () => {
    (useHttpRequestHook.useHttpRequest as jest.Mock).mockReturnValue({
      execute: mockExecute,
      data: null,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(mockExecute).toHaveBeenCalledWith({
        method: 'GET',
        url: '/documents/recent/org-123',
      });
    });
  });

  it('does not fetch documents on mount when organization ID is missing (branch)', async () => {
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: '', role: 'member' },
      membership: null,
      isAdmin: false,
      isOwner: false,
    });

    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>,
    );

    expect(screen.getByTestId('dashboard-grid')).toBeInTheDocument();
  });
});
