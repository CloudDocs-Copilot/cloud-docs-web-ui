import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrganizationContext } from '../../context/OrganizationContext';
import { usePermissions } from '../../hooks/usePermissions';
import type { OrgContextValue } from '../../types/organization.types';

const baseContextValue: OrgContextValue = {
  organizations: [],
  activeOrganization: null,
  membership: null,
  loading: false,
  error: null,
  fetchOrganizations: jest.fn(),
  fetchActiveOrganization: jest.fn(),
  setActiveOrganization: jest.fn(),
  createOrganization: jest.fn(),
  refreshOrganization: jest.fn(),
  clearOrganization: jest.fn(),
  hasRole: jest.fn(),
  isAdmin: false,
  isOwner: false,
};

interface ConsumerProps {
  action?: 'documents:create' | 'documents:delete' | 'documents:edit' | 'members:invite' | 'members:remove' | 'members:changeRole' | 'org:edit' | 'org:delete' | 'settings:view' | 'trash:manage';
  actions?: Array<'documents:create' | 'documents:delete' | 'documents:edit' | 'members:invite' | 'members:remove' | 'members:changeRole' | 'org:edit' | 'org:delete' | 'settings:view' | 'trash:manage'>;
}

const Consumer: React.FC<ConsumerProps> = ({ action, actions }) => {
  const { can, canAny, canAll, role } = usePermissions();
  return (
    <div>
      <span data-testid="role">{role}</span>
      {action && <span data-testid="can">{can(action) ? 'yes' : 'no'}</span>}
      {actions && <span data-testid="canAny">{canAny(actions) ? 'yes' : 'no'}</span>}
      {actions && <span data-testid="canAll">{canAll(actions) ? 'yes' : 'no'}</span>}
    </div>
  );
};

function renderWithOrg(contextOverrides: Partial<OrgContextValue>, consumerProps?: ConsumerProps) {
  const value = { ...baseContextValue, ...contextOverrides };
  return render(
    <OrganizationContext.Provider value={value}>
      <Consumer {...consumerProps} />
    </OrganizationContext.Provider>,
  );
}

describe('usePermissions', () => {
  it('returns viewer role when no membership or activeOrganization role', () => {
    renderWithOrg({});
    expect(screen.getByTestId('role')).toHaveTextContent('viewer');
  });

  it('returns role from membership when available', () => {
    renderWithOrg({
      membership: { id: 'm1', userId: 'u1', organizationId: 'o1', role: 'admin', status: 'active' },
    });
    expect(screen.getByTestId('role')).toHaveTextContent('admin');
  });

  it('returns role from activeOrganization when membership is null', () => {
    renderWithOrg({
      activeOrganization: { id: 'o1', name: 'Org', role: 'member' },
    });
    expect(screen.getByTestId('role')).toHaveTextContent('member');
  });

  it('can() returns true for permitted actions', () => {
    renderWithOrg(
      { membership: { id: 'm1', userId: 'u1', organizationId: 'o1', role: 'admin', status: 'active' } },
      { action: 'documents:delete' },
    );
    expect(screen.getByTestId('can')).toHaveTextContent('yes');
  });

  it('can() returns false for unpermitted actions', () => {
    renderWithOrg(
      { membership: { id: 'm1', userId: 'u1', organizationId: 'o1', role: 'viewer', status: 'active' } },
      { action: 'documents:create' },
    );
    expect(screen.getByTestId('can')).toHaveTextContent('no');
  });

  it('canAny() returns true if at least one action is permitted', () => {
    renderWithOrg(
      { membership: { id: 'm1', userId: 'u1', organizationId: 'o1', role: 'member', status: 'active' } },
      { actions: ['documents:create', 'members:invite'] },
    );
    expect(screen.getByTestId('canAny')).toHaveTextContent('yes');
  });

  it('canAny() returns false if no actions are permitted', () => {
    renderWithOrg(
      { membership: { id: 'm1', userId: 'u1', organizationId: 'o1', role: 'viewer', status: 'active' } },
      { actions: ['documents:create', 'members:invite'] },
    );
    expect(screen.getByTestId('canAny')).toHaveTextContent('no');
  });

  it('canAll() returns true if all actions are permitted', () => {
    renderWithOrg(
      { membership: { id: 'm1', userId: 'u1', organizationId: 'o1', role: 'owner', status: 'active' } },
      { actions: ['documents:create', 'documents:delete'] },
    );
    expect(screen.getByTestId('canAll')).toHaveTextContent('yes');
  });

  it('canAll() returns false if not all actions are permitted', () => {
    renderWithOrg(
      { membership: { id: 'm1', userId: 'u1', organizationId: 'o1', role: 'member', status: 'active' } },
      { actions: ['documents:create', 'documents:delete'] },
    );
    expect(screen.getByTestId('canAll')).toHaveTextContent('no');
  });

  it('normalizes role to lowercase', () => {
    renderWithOrg({
      membership: { id: 'm1', userId: 'u1', organizationId: 'o1', role: 'ADMIN', status: 'active' },
    });
    expect(screen.getByTestId('role')).toHaveTextContent('admin');
  });
});
