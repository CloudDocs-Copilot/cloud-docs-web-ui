import { useState, useEffect, useCallback } from 'react';
import useOrganization from './useOrganization';
import { useNotifications } from './useNotifications';
import { dashboardService } from '../services/dashboard.service';
import type { OrgStats } from '../types/dashboard.types';

export const useDashboardData = () => {
  const { activeOrganization } = useOrganization();
  const { notifications, loading: notificationsLoading } = useNotifications();

  const [orgStats, setOrgStats] = useState<OrgStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    const orgId = activeOrganization?.id;
    if (!orgId) return;

    setStatsLoading(true);
    setStatsError(null);
    try {
      const stats = await dashboardService.getOrgStats(orgId);
      setOrgStats(stats);
    } catch {
      setStatsError('No se pudieron cargar las estadísticas');
    } finally {
      setStatsLoading(false);
    }
  }, [activeOrganization?.id]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    orgStats,
    statsLoading,
    statsError,
    notifications,
    notificationsLoading,
    refetch: fetchStats,
  };
};
