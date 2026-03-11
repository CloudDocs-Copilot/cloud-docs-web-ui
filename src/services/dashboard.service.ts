import { apiClient } from '../api';

export interface StoragePerUser {
  userId: string;
  userName: string;
  storageUsed: number;
  percentage: number;
}

export interface OrgStats {
  totalUsers: number;
  totalStorageLimit: number;
  totalDocuments: number;
  totalFolders: number;
  usedStorage: number;
  availableStorage: number;
  storagePerUser: StoragePerUser[];
}

export interface OrgStatsResponse {
  success: boolean;
  stats: OrgStats;
}

export interface OrgMember {
  id: string;
  userId: string;
  role: string;
  status: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export interface OrgMembersResponse {
  success: boolean;
  count?: number;
  data: OrgMember[];
}

export const dashboardService = {
  getOrganizationStats: async (orgId: string): Promise<OrgStats> => {
    const response = await apiClient.get<OrgStatsResponse>(`/organizations/${orgId}/stats`);
    return response.data.stats;
  },

  getOrganizationMembers: async (orgId: string): Promise<OrgMember[]> => {
    const response = await apiClient.get(`/memberships/organization/${orgId}/members`);
    const payload = response?.data;
    let items: OrgMember[] = [];
    if (Array.isArray(payload)) {
      items = payload;
    } else if (payload && Array.isArray(payload.data)) {
      items = payload.data;
    } else if (payload && Array.isArray(payload.members)) {
      items = payload.members;
    }
    return items;
  },
};
