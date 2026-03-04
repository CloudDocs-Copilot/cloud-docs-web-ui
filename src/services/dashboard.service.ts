import { apiClient } from '../api';

export interface OrgStats {
  storageUsed: number;
  storageTotal: number;
  documentsCount: number;
  membersCount: number;
}

export interface OrgStatsResponse {
  success: boolean;
  data: OrgStats;
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
    return response.data.data;
  },

  getOrganizationMembers: async (orgId: string): Promise<OrgMember[]> => {
    const response = await apiClient.get<OrgMembersResponse>(`/organizations/${orgId}/members`);
    return response.data.data;
  },
};
