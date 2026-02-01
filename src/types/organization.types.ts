export type ID = string;

export type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer';

export type MembershipStatus = 'active' | 'pending' | 'suspended';

export interface OrgSettings {
  maxUsers?: number;
  maxStorageTotal?: number;
  maxStoragePerUser?: number;
  allowedFileTypes?: string[];
  maxFileSize?: number;
}

export interface Organization {
  id: ID;
  name: string;
  slug?: string;
  plan?: string;
  ownerId?: ID;
  settings?: OrgSettings;
  memberCount?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Membership {
  id: ID;
  userId: ID;
  organizationId: ID;
  role: MembershipRole | string;
  status: MembershipStatus | string;
  joinedAt?: string;
}

export interface CreateOrganizationPayload {
  name: string;
  plan?: string;
}

export interface CreateOrganizationResponse {
  success: boolean;
  message?: string;
  organization: Organization;
}

export interface ActiveOrganizationResponse {
  success: boolean;
  organizationId?: ID;
  organization?: Organization;
  membership?: Membership;
}

export interface GetOrganizationResponse {
  success: boolean;
  error?: string;
  organization: Organization;
}

export interface MembershipWithOrgDTO {
  id: ID;
  user?: ID;  
  organization?: Organization;  
  role?: MembershipRole | string;
  status?: MembershipStatus | string;
  rootFolder?: ID;
  joinedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MembershipsListResponse {
  success: boolean;
  error?: string;
  count?: number;
  data: MembershipWithOrgDTO[];
}
export interface OrgContextValue {
  organizations: Organization[];
  activeOrganization: Organization | null;
  membership: Membership | null;
  loading: boolean;
  error?: Error | null;
  fetchOrganizations: () => Promise<void>;
  fetchActiveOrganization: () => Promise<void>;
  setActiveOrganization: (orgId: ID) => Promise<void>;
  createOrganization: (payload: CreateOrganizationPayload) => Promise<Organization>;
  refreshOrganization: (orgId?: ID) => Promise<void>;
  clearOrganization: () => void;
  hasRole: (roles: string | string[]) => boolean;
  isAdmin: () => boolean;
  isOwner: () => boolean;
}

export const ACTIVE_ORG_STORAGE_KEY = 'clouddocs:activeOrgId';
