export type InvitationRole = 'owner' | 'admin' | 'member' | 'viewer';

export type InvitationStatus = 'pending' | 'active' | 'suspended';

export interface InvitedByUser {
  id: string;
  name: string;
  email: string;
}

export interface Invitation {
  id: string;
  role: InvitationRole;
  status: InvitationStatus;
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
  invitedBy: InvitedByUser;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationResponse {
  success: boolean;
  count: number;
  data: Invitation[];
}

export interface AcceptInvitationResponse {
  success: boolean;
  message: string;
  membership: {
    id: string;
    role: string;
    status: string;
    organization: {
      id: string;
      name: string;
      slug: string;
      plan: string;
    };
    rootFolder: string;
    joinedAt: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface RejectInvitationResponse {
  success: boolean;
  message: string;
}
