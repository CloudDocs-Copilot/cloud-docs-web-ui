import { apiClient } from '../api';
import type { Membership } from '../types/membership.types';

export interface InviteMemberPayload {
  userId: string;  // ID del usuario a invitar (antes era email)
  role?: string;
}

/**
 * Invita un usuario a una organización.
 * Ahora crea una invitación PENDING en lugar de añadir directamente.
 * POST /api/memberships/organization/:organizationId/members
 */
export interface InviteMemberResponse {
  success: boolean;
  message?: string;
  invitation?: Membership | null;  // Ahora devuelve invitation en estado PENDING
}

export const inviteMember = async (
  organizationId: string,
  payload: InviteMemberPayload
): Promise<InviteMemberResponse> => {
  const res = await apiClient.post(`/memberships/organization/${organizationId}/members`, payload);
  return res.data as InviteMemberResponse;
};

export default {
  inviteMember,
};
