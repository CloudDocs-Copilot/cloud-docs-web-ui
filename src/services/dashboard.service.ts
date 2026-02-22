import { apiClient } from '../api';
import type { OrgStats, MemberStats, MembersByRole } from '../types/dashboard.types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

const defaultMemberStats: MemberStats = {
  total: 0,
  active: 0,
  pending: 0,
  byRole: { owner: 0, admin: 0, member: 0, viewer: 0 },
};

export const dashboardService = {
  getOrgStats: async (orgId: string): Promise<OrgStats> => {
    const statsResponse = await apiClient.get(`/organizations/${orgId}/stats`);
    const stats = statsResponse.data.data ?? statsResponse.data;

    const storageUsed: number = stats.storageUsed ?? 0;
    const storageTotal: number = stats.storageTotal ?? 0;
    const storagePercentage: number = stats.storagePercentage ?? 0;

    let memberStats: MemberStats = defaultMemberStats;
    try {
      const membersResponse = await apiClient.get(`/organizations/${orgId}/members`);
      const membersData = membersResponse.data.data ?? membersResponse.data;
      const membersList: Array<{ id: string; role: string; status: string }> = Array.isArray(membersData)
        ? membersData
        : membersData.data ?? [];

      const byRole: MembersByRole = { owner: 0, admin: 0, member: 0, viewer: 0 };
      let active = 0;
      let pending = 0;

      for (const m of membersList) {
        const role = (m.role ?? '').toLowerCase() as keyof MembersByRole;
        if (role in byRole) byRole[role]++;
        if ((m.status ?? '').toLowerCase() === 'active') active++;
        else if ((m.status ?? '').toLowerCase() === 'pending') pending++;
      }

      memberStats = {
        total: membersList.length,
        active,
        pending,
        byRole,
      };
    } catch {
      memberStats = defaultMemberStats;
    }

    return {
      storage: {
        used: storageUsed,
        total: storageTotal,
        percentage: storagePercentage,
        formattedUsed: formatBytes(storageUsed),
        formattedTotal: formatBytes(storageTotal),
      },
      members: memberStats,
    };
  },
};
