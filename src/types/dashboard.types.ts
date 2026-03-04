export interface StorageStats {
  used: number;
  total: number;
  percentage: number;
  formattedUsed: string;
  formattedTotal: string;
}

export interface MembersByRole {
  owner: number;
  admin: number;
  member: number;
  viewer: number;
}

export interface MemberStats {
  total: number;
  active: number;
  pending: number;
  byRole: MembersByRole;
}

export interface OrgStats {
  storage: StorageStats;
  members: MemberStats;
}

export interface OrgMember {
  id: string;
  role: string;
  status: string;
  name?: string;
  email?: string;
}
