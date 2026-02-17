import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import type { PermissionAction } from '../constants/permissions';
import type { MembershipRole } from '../types/organization.types';

interface RoleGuardProps {
  requiredRoles?: MembershipRole[];
  requiredPermission?: PermissionAction;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  requiredRoles,
  requiredPermission,
  fallback = null,
  children,
}) => {
  const { can, role } = usePermissions();

  if (requiredRoles && !requiredRoles.includes(role)) {
    return <>{fallback}</>;
  }

  if (requiredPermission && !can(requiredPermission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
