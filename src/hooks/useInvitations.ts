import { useState, useEffect, useCallback } from 'react';
import {
  getPendingInvitations,
  acceptInvitation as acceptInvitationService,
  rejectInvitation as rejectInvitationService,
} from '../services/invitation.services';
import type { Invitation, AcceptInvitationResponse } from '../types/invitation.types';
import { useToast } from './useToast';

export function useInvitations() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchInvitations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPendingInvitations();
      setInvitations(data);
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Error al cargar invitaciones';
      setError(message);
      showToast({ 
        message: 'No se pudieron cargar las invitaciones', 
        variant: 'danger',
        title: 'Invitaciones'
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const acceptInvitation = useCallback(async (membershipId: string): Promise<AcceptInvitationResponse | null> => {
    setLoading(true);
    try {
      const result = await acceptInvitationService(membershipId);
      showToast({ 
        message: '¡Te has unido a la organización exitosamente!', 
        variant: 'success',
        title: 'Invitación Aceptada'
      });
      
      // Remover de la lista local
      setInvitations(prev => prev.filter(inv => inv.id !== membershipId));
      
      return result;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      const message = error.response?.data?.error || error.message || 'Error al aceptar invitación';
      showToast({ 
        message, 
        variant: 'danger',
        title: 'Error'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const rejectInvitation = useCallback(async (membershipId: string): Promise<boolean> => {
    setLoading(true);
    try {
      await rejectInvitationService(membershipId);
      showToast({ 
        message: 'Invitación rechazada', 
        variant: 'info',
        title: 'Invitación'
      });
      
      // Remover de la lista local
      setInvitations(prev => prev.filter(inv => inv.id !== membershipId));
      
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } }; message?: string };
      const message = error.response?.data?.error || error.message || 'Error al rechazar invitación';
      showToast({ 
        message, 
        variant: 'danger',
        title: 'Error'
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  return {
    invitations,
    loading,
    error,
    acceptInvitation,
    rejectInvitation,
    refetch: fetchInvitations,
    pendingCount: invitations.length,
  };
}
