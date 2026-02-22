import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardData } from '../../hooks/useDashboardData';

// Mock dependencies
jest.mock('../../hooks/useOrganization', () => ({
  __esModule: true,
  default: jest.fn(),
  useOrganization: jest.fn(),
}));

jest.mock('../../hooks/useNotifications', () => ({
  useNotifications: jest.fn(),
}));

jest.mock('../../services/dashboard.service', () => ({
  dashboardService: {
    getOrgStats: jest.fn(),
  },
}));

import * as useOrgModule from '../../hooks/useOrganization';
import { useNotifications } from '../../hooks/useNotifications';
import { dashboardService } from '../../services/dashboard.service';

const mockOrgStats = {
  storage: {
    used: 1000,
    total: 10000,
    percentage: 10,
    formattedUsed: '1 KB',
    formattedTotal: '10 KB',
  },
  members: {
    total: 3,
    active: 2,
    pending: 1,
    byRole: { owner: 1, admin: 1, member: 1, viewer: 0 },
  },
};

const mockNotifications = [
  {
    id: 'n1',
    organization: 'org-1',
    recipient: 'u1',
    actor: 'u2',
    type: 'DOC_UPLOADED' as const,
    entity: { kind: 'document' as const, id: 'd1' },
  },
];

describe('useDashboardData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOrgModule.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-123' },
    });
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: mockNotifications,
      loading: false,
    });
    (dashboardService.getOrgStats as jest.Mock).mockResolvedValue(mockOrgStats);
  });

  it('fetches org stats on mount when organization is present', async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.orgStats).toEqual(mockOrgStats);
    });

    expect(dashboardService.getOrgStats).toHaveBeenCalledWith('org-123');
  });

  it('returns notifications from useNotifications context', async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.notifications).toEqual(mockNotifications);
    });
  });

  it('sets statsError when service throws', async () => {
    (dashboardService.getOrgStats as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.statsError).toBeTruthy();
      expect(result.current.orgStats).toBeNull();
    });
  });

  it('does not fetch stats when no organization is set', async () => {
    (useOrgModule.default as jest.Mock).mockReturnValue({
      activeOrganization: null,
    });

    renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(dashboardService.getOrgStats).not.toHaveBeenCalled();
    });
  });

  it('exposes notificationsLoading from context', () => {
    (useNotifications as jest.Mock).mockReturnValue({
      notifications: [],
      loading: true,
    });

    const { result } = renderHook(() => useDashboardData());
    expect(result.current.notificationsLoading).toBe(true);
  });

  it('provides refetch function', async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.orgStats).toEqual(mockOrgStats);
    });

    const callCount = (dashboardService.getOrgStats as jest.Mock).mock.calls.length;
    result.current.refetch();

    await waitFor(() => {
      expect((dashboardService.getOrgStats as jest.Mock).mock.calls.length).toBeGreaterThan(callCount);
    });
  });
});
