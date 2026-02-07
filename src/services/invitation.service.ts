import { apiClient } from '../api';
import type {
  Invitation,
  InvitationResponse,
  AcceptInvitationResponse,
  RejectInvitationResponse,
} from '../types/invitation.types';

/**
 * Obtiene las invitaciones pendientes del usuario autenticado
 * GET /api/memberships/pending-invitations
 */
export const getPendingInvitations = async (): Promise<Invitation[]> => {
  const response = await apiClient.get<InvitationResponse>('/memberships/pending-invitations');
  return response.data.data;
};

/**
 * Acepta una invitación pendiente
 * POST /api/memberships/invitations/:membershipId/accept
 */
export const acceptInvitation = async (membershipId: string): Promise<AcceptInvitationResponse> => {
  const response = await apiClient.post<AcceptInvitationResponse>(
    `/memberships/invitations/${membershipId}/accept`
  );
  return response.data;
};

/**
 * Rechaza una invitación pendiente
 * POST /api/memberships/invitations/:membershipId/reject
 */
export const rejectInvitation = async (membershipId: string): Promise<RejectInvitationResponse> => {
  const response = await apiClient.post<RejectInvitationResponse>(
    `/memberships/invitations/${membershipId}/reject`
  );
  return response.data;
};

export default {
  getPendingInvitations,
  acceptInvitation,
  rejectInvitation,
};
