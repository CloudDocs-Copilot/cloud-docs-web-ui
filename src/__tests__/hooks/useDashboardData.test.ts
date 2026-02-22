import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardData } from '../../hooks/useDashboardData';

// Mock dependencies
jest.mock('../../hooks/useOrganization', () => ({
  __esModule: true,
  default: jest.fn(),
  useOrganization: jest.fn(),
}));

jest.mock('../../services/dashboard.service', () => ({
  dashboardService: {
    getOrganizationStats: jest.fn(),
    getOrganizationMembers: jest.fn(),
  },
}));

import * as useOrgModule from '../../hooks/useOrganization';
import { dashboardService } from '../../services/dashboard.service';

const mockStats = {
  storageUsed: 1000,
  storageTotal: 10000,
  documentsCount: 5,
  membersCount: 3,
};

const mockMembers = [
  { id: 'm1', userId: 'u1', role: 'owner', status: 'active' },
  { id: 'm2', userId: 'u2', role: 'admin', status: 'active' },
];

describe('useDashboardData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useOrgModule.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-123', role: 'admin' },
      membership: { role: 'admin' },
      isAdmin: true,
      isOwner: false,
    });
    (dashboardService.getOrganizationStats as jest.Mock).mockResolvedValue(mockStats);
    (dashboardService.getOrganizationMembers as jest.Mock).mockResolvedValue(mockMembers);
  });

  it('fetches stats and members for admin on mount', async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.stats).toEqual(mockStats);
      expect(result.current.members).toEqual(mockMembers);
    });

    expect(dashboardService.getOrganizationStats).toHaveBeenCalledWith('org-123');
    expect(dashboardService.getOrganizationMembers).toHaveBeenCalledWith('org-123');
  });

  it('derives role from membership', async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.role).toBe('admin');
    });
  });

  it('does not fetch data for non-admin member', async () => {
    (useOrgModule.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-123', role: 'member' },
      membership: { role: 'member' },
      isAdmin: false,
      isOwner: false,
    });

    renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(dashboardService.getOrganizationStats).not.toHaveBeenCalled();
      expect(dashboardService.getOrganizationMembers).not.toHaveBeenCalled();
    });
  });

  it('sets statsError when stats service throws', async () => {
    (dashboardService.getOrganizationStats as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.statsError).toBe('Network error');
      expect(result.current.stats).toBeNull();
    });
  });

  it('sets membersError when members service throws', async () => {
    (dashboardService.getOrganizationMembers as jest.Mock).mockRejectedValue(
      new Error('Members error'),
    );

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.membersError).toBe('Members error');
      expect(result.current.members).toBeNull();
    });
  });

  it('exposes refreshStats and refreshMembers functions', () => {
    const { result } = renderHook(() => useDashboardData());

    expect(typeof result.current.refreshStats).toBe('function');
    expect(typeof result.current.refreshMembers).toBe('function');
  });
});
