import { useCallback, useMemo } from 'react';
import { useOrganization } from './useOrganization';
import { ROLE_PERMISSIONS } from '../constants/permissions';
import type { PermissionAction } from '../constants/permissions';
import type { MembershipRole } from '../types/organization.types';

export interface UsePermissionsReturn {
  can: (action: PermissionAction) => boolean;
  canAny: (actions: PermissionAction[]) => boolean;
  canAll: (actions: PermissionAction[]) => boolean;
  role: MembershipRole;
}

export const usePermissions = (): UsePermissionsReturn => {
  const { membership, activeOrganization } = useOrganization();

  const role: MembershipRole = useMemo(() => {
    const raw = membership?.role || activeOrganization?.role || 'viewer';
    return (typeof raw === 'string' ? raw.toLowerCase() : raw) as MembershipRole;
  }, [membership?.role, activeOrganization?.role]);

  const permissions = useMemo(() => {
    return ROLE_PERMISSIONS[role] ?? [];
  }, [role]);

  const can = useCallback(
    (action: PermissionAction): boolean => permissions.includes(action),
    [permissions],
  );

  const canAny = useCallback(
    (actions: PermissionAction[]): boolean => actions.some((a) => permissions.includes(a)),
    [permissions],
  );

  const canAll = useCallback(
    (actions: PermissionAction[]): boolean => actions.every((a) => permissions.includes(a)),
    [permissions],
  );

  return { can, canAny, canAll, role };
};
