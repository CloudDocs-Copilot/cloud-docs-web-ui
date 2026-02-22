import type { MembershipRole } from '../types/organization.types';

export type PermissionAction =
  | 'documents:create'
  | 'documents:delete'
  | 'documents:edit'
  | 'members:invite'
  | 'members:remove'
  | 'members:changeRole'
  | 'org:edit'
  | 'org:delete'
  | 'settings:view'
  | 'trash:manage';

export const ROLE_PERMISSIONS: Record<MembershipRole, readonly PermissionAction[]> = {
  owner: [
    'documents:create',
    'documents:delete',
    'documents:edit',
    'members:invite',
    'members:remove',
    'members:changeRole',
    'org:edit',
    'org:delete',
    'settings:view',
    'trash:manage',
  ],
  admin: [
    'documents:create',
    'documents:delete',
    'documents:edit',
    'members:invite',
    'members:remove',
    'settings:view',
    'trash:manage',
  ],
  member: [
    'documents:create',
    'documents:edit',
    'trash:manage',
  ],
  viewer: [],
} as const;

export const ROLE_HIERARCHY: Record<MembershipRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};
