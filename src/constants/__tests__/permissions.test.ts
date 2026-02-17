import { ROLE_PERMISSIONS, ROLE_HIERARCHY } from '../../constants/permissions';
import type { PermissionAction } from '../../constants/permissions';
import type { MembershipRole } from '../../types/organization.types';

describe('ROLE_PERMISSIONS', () => {
  const allRoles: MembershipRole[] = ['owner', 'admin', 'member', 'viewer'];

  it('defines permissions for all roles', () => {
    allRoles.forEach((role) => {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
      expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true);
    });
  });

  it('owner has all permissions', () => {
    const ownerPerms = ROLE_PERMISSIONS.owner;
    expect(ownerPerms).toContain('documents:create');
    expect(ownerPerms).toContain('documents:delete');
    expect(ownerPerms).toContain('documents:edit');
    expect(ownerPerms).toContain('members:invite');
    expect(ownerPerms).toContain('members:remove');
    expect(ownerPerms).toContain('members:changeRole');
    expect(ownerPerms).toContain('org:edit');
    expect(ownerPerms).toContain('org:delete');
    expect(ownerPerms).toContain('settings:view');
    expect(ownerPerms).toContain('trash:manage');
  });

  it('admin has document and member management but not org:delete or members:changeRole', () => {
    const adminPerms = ROLE_PERMISSIONS.admin;
    expect(adminPerms).toContain('documents:create');
    expect(adminPerms).toContain('documents:delete');
    expect(adminPerms).toContain('members:invite');
    expect(adminPerms).not.toContain('members:changeRole');
    expect(adminPerms).not.toContain('org:delete');
  });

  it('member can create and edit documents but not delete or invite', () => {
    const memberPerms = ROLE_PERMISSIONS.member;
    expect(memberPerms).toContain('documents:create');
    expect(memberPerms).toContain('documents:edit');
    expect(memberPerms).not.toContain('documents:delete');
    expect(memberPerms).not.toContain('members:invite');
  });

  it('viewer has no permissions', () => {
    expect(ROLE_PERMISSIONS.viewer).toHaveLength(0);
  });

  it('each role has a subset of permissions of the role above in hierarchy', () => {
    const viewerPerms = new Set<PermissionAction>(ROLE_PERMISSIONS.viewer);
    const memberPerms = new Set<PermissionAction>(ROLE_PERMISSIONS.member);
    const adminPerms = new Set<PermissionAction>(ROLE_PERMISSIONS.admin);
    const ownerPerms = new Set<PermissionAction>(ROLE_PERMISSIONS.owner);

    viewerPerms.forEach((p) => expect(memberPerms.has(p)).toBe(true));
    memberPerms.forEach((p) => expect(adminPerms.has(p)).toBe(true));
    adminPerms.forEach((p) => expect(ownerPerms.has(p)).toBe(true));
  });
});

describe('ROLE_HIERARCHY', () => {
  it('defines hierarchy levels for all roles', () => {
    expect(ROLE_HIERARCHY.viewer).toBe(0);
    expect(ROLE_HIERARCHY.member).toBe(1);
    expect(ROLE_HIERARCHY.admin).toBe(2);
    expect(ROLE_HIERARCHY.owner).toBe(3);
  });

  it('hierarchy is strictly increasing', () => {
    expect(ROLE_HIERARCHY.viewer).toBeLessThan(ROLE_HIERARCHY.member);
    expect(ROLE_HIERARCHY.member).toBeLessThan(ROLE_HIERARCHY.admin);
    expect(ROLE_HIERARCHY.admin).toBeLessThan(ROLE_HIERARCHY.owner);
  });
});
