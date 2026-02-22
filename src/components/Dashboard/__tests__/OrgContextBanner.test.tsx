import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OrgContextBanner } from '../widgets/OrgContextBanner';
import * as useOrganizationHook from '../../../hooks/useOrganization';

jest.mock('../../../hooks/useOrganization');

describe('OrgContextBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders org name, plan badge, and role badge', () => {
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: {
        id: 'org-1',
        name: 'Acme Corp',
        plan: 'PREMIUM',
        memberCount: 15,
        role: 'admin',
      },
      membership: { role: 'admin', status: 'active' },
    });

    render(<OrgContextBanner />);

    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByTestId('plan-badge')).toHaveTextContent('PREMIUM');
    expect(screen.getByTestId('role-badge')).toHaveTextContent('Administrador');
    expect(screen.getByTestId('member-count')).toHaveTextContent('15');
  });

  it('shows owner label for owner role from membership', () => {
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-1', name: 'My Org', plan: 'ENTERPRISE', role: 'member' },
      membership: { role: 'owner', status: 'active' },
    });

    render(<OrgContextBanner />);

    expect(screen.getByTestId('role-badge')).toHaveTextContent('Propietario');
  });

  it('shows correct label for viewer role', () => {
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-1', name: 'Test Org', plan: 'FREE', role: 'viewer' },
      membership: null,
    });

    render(<OrgContextBanner />);

    expect(screen.getByTestId('role-badge')).toHaveTextContent('Visitante');
  });

  it('does not render member count when not provided', () => {
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-1', name: 'Test Org', plan: 'BASIC' },
      membership: null,
    });

    render(<OrgContextBanner />);

    expect(screen.queryByTestId('member-count')).not.toBeInTheDocument();
  });

  it('renders nothing when no activeOrganization', () => {
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: null,
      membership: null,
    });

    const { container } = render(<OrgContextBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('defaults to FREE plan when plan is undefined', () => {
    (useOrganizationHook.default as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-1', name: 'No Plan Org' },
      membership: null,
    });

    render(<OrgContextBanner />);

    expect(screen.getByTestId('plan-badge')).toHaveTextContent('FREE');
  });
});
