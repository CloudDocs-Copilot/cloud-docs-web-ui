import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import type { MembershipRole } from '../types/organization.types';

interface RequireRoleProps {
  roles: MembershipRole[];
  redirectTo?: string;
  children: React.ReactNode;
}

const RequireRole: React.FC<RequireRoleProps> = ({
  roles,
  redirectTo = '/forbidden',
  children,
}) => {
  const { role } = usePermissions();

  if (!roles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RequireRole;
