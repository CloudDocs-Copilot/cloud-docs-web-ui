import { useState, useEffect, useCallback } from 'react';
import useOrganization from './useOrganization';
import { dashboardService } from '../services/dashboard.service';
import type { OrgStats, OrgMember } from '../services/dashboard.service';
import type { MembershipRole } from '../types/organization.types';

export interface DashboardData {
  role: MembershipRole;
  stats: OrgStats | null;
  members: OrgMember[] | null;
  statsLoading: boolean;
  membersLoading: boolean;
  statsError: string | null;
  membersError: string | null;
  refreshStats: () => Promise<void>;
  refreshMembers: () => Promise<void>;
}

export const useDashboardData = (): DashboardData => {
  const { activeOrganization, membership, isAdmin, isOwner } = useOrganization();

  const rawRole = membership?.role ?? activeOrganization?.role ?? 'viewer';
  const role = (typeof rawRole === 'string' ? rawRole.toLowerCase() : rawRole) as MembershipRole;

  const orgId = activeOrganization?.id ?? '';
  const needsAdminData = isAdmin || isOwner;

  const [stats, setStats] = useState<OrgStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const [members, setMembers] = useState<OrgMember[] | null>(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);

  const refreshStats = useCallback(async () => {
    if (!orgId || !needsAdminData) return;
    try {
      setStatsLoading(true);
      setStatsError(null);
      const data = await dashboardService.getOrganizationStats(orgId);
      setStats(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar las estadísticas';
      setStatsError(message);
    } finally {
      setStatsLoading(false);
    }
  }, [orgId, needsAdminData]);

  const refreshMembers = useCallback(async () => {
    if (!orgId || !needsAdminData) return;
    try {
      setMembersLoading(true);
      setMembersError(null);
      const data = await dashboardService.getOrganizationMembers(orgId);
      setMembers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar los miembros';
      setMembersError(message);
    } finally {
      setMembersLoading(false);
    }
  }, [orgId, needsAdminData]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  useEffect(() => {
    refreshMembers();
  }, [refreshMembers]);

  return {
    role,
    stats,
    members,
    statsLoading,
    membersLoading,
    statsError,
    membersError,
    refreshStats,
    refreshMembers,
  };
};

export default useDashboardData;
