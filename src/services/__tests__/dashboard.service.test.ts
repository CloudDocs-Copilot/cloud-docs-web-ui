import { dashboardService } from '../dashboard.service';
import { apiClient } from '../../api';

jest.mock('../../api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('dashboardService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrganizationStats', () => {
    it('fetches stats from the correct endpoint', async () => {
      const mockStats = {
        storageUsed: 1024,
        storageTotal: 10240,
        documentsCount: 5,
        membersCount: 3,
      };

      mockApiClient.get.mockResolvedValueOnce({ data: { success: true, data: mockStats } });

      const result = await dashboardService.getOrganizationStats('org-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/organizations/org-123/stats');
      expect(result).toEqual(mockStats);
    });

    it('propagates errors from the API', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(dashboardService.getOrganizationStats('org-123')).rejects.toThrow('Network error');
    });
  });

  describe('getOrganizationMembers', () => {
    it('fetches members from the correct endpoint', async () => {
      const mockMembers = [
        { id: 'm1', userId: 'u1', role: 'owner', status: 'active' },
        { id: 'm2', userId: 'u2', role: 'member', status: 'active' },
      ];

      mockApiClient.get.mockResolvedValueOnce({ data: { success: true, count: 2, data: mockMembers } });

      const result = await dashboardService.getOrganizationMembers('org-123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/organizations/org-123/members');
      expect(result).toEqual(mockMembers);
    });

    it('propagates errors from the API', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Members error'));

      await expect(dashboardService.getOrganizationMembers('org-123')).rejects.toThrow('Members error');
    });
  });
});
