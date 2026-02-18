import type { Organization } from './organization.types';

export type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer';

export type MembershipStatus = 'active' | 'pending' | 'suspended';

export interface Membership {
  id?: string;
  user?: string | { id?: string; name?: string | null; email?: string | null };
  organization?: Organization | string;
  role?: MembershipRole | string;
  status?: MembershipStatus | string;
  rootFolder?: string;
  joinedAt?: string;
  invitedBy?: string | { id?: string; name?: string; email?: string };
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// For server-like model typing (optional)
export interface IMembership {
  user: string;
  organization: string;
  role: MembershipRole;
  status: MembershipStatus;
  rootFolder?: string;
  joinedAt: string;
  invitedBy?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
