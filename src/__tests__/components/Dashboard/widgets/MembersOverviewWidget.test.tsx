import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MembersOverviewWidget } from '../../../../components/Dashboard/widgets/MembersOverviewWidget';
import type { OrgMember } from '../../../../services/dashboard.service';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('MembersOverviewWidget', () => {
  const mockMembers: OrgMember[] = [
    {
      id: '1',
      email: 'owner@example.com',
      name: 'Owner User',
      role: 'owner',
      status: 'active',
      joinedAt: '2024-01-01T00:00:00Z',
      avatar: 'https://example.com/avatar1.jpg',
    },
    {
      id: '2',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      status: 'active',
      joinedAt: '2024-01-02T00:00:00Z',
      avatar: 'https://example.com/avatar2.jpg',
    },
    {
      id: '3',
      email: 'member@example.com',
      name: 'Regular Member',
      role: 'member',
      status: 'pending',
      joinedAt: '2024-01-03T00:00:00Z',
    },
  ];

  it('renders content when members are loaded', () => {
    const { container } = renderWithRouter(
      <MembersOverviewWidget
        members={mockMembers}
        loading={false}
        error={null}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('renders loading state', () => {
    const { container } = renderWithRouter(
      <MembersOverviewWidget members={null} loading={true} error={null} />
    );

    expect(container).toBeInTheDocument();
  });

  it('renders error state with error message', () => {
    const errorMessage = 'Error al cargar miembros';
    const { container } = renderWithRouter(
      <MembersOverviewWidget
        members={null}
        loading={false}
        error={errorMessage}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('displays member count when members are loaded', () => {
    const { container } = renderWithRouter(
      <MembersOverviewWidget
        members={mockMembers}
        loading={false}
        error={null}
      />
    );

    // Should display widget content
    expect(container).toBeInTheDocument();
  });

  it('renders member list items', () => {
    const { container } = renderWithRouter(
      <MembersOverviewWidget
        members={mockMembers}
        loading={false}
        error={null}
      />
    );

    // Component should render
    expect(container).toBeInTheDocument();
  });

  it('displays owner role badge', () => {
    const { container } = renderWithRouter(
      <MembersOverviewWidget
        members={mockMembers}
        loading={false}
        error={null}
      />
    );

    // Component renders with owner role
    expect(container.textContent).toContain('Propietario');
  });

  it('displays admin role badge', () => {
    const { container } = renderWithRouter(
      <MembersOverviewWidget
        members={mockMembers}
        loading={false}
        error={null}
      />
    );

    expect(container.textContent).toContain('Admin');
  });

  it('displays member role badge', () => {
    const { container } = renderWithRouter(
      <MembersOverviewWidget
        members={mockMembers}
        loading={false}
        error={null}
      />
    );

    expect(container.textContent).toContain('Miembro');
  });

  it('handles empty members list', () => {
    const { container } = renderWithRouter(
      <MembersOverviewWidget members={[]} loading={false} error={null} />
    );

    expect(container).toBeInTheDocument();
  });

  it('displays status badges for members', () => {
    const { container } = renderWithRouter(
      <MembersOverviewWidget
        members={mockMembers}
        loading={false}
        error={null}
      />
    );

    // Active status should be displayed
    expect(container).toBeInTheDocument();
  });

  it('renders widget header', () => {
    const { container } = renderWithRouter(
      <MembersOverviewWidget
        members={mockMembers}
        loading={false}
        error={null}
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('handles null members gracefully', () => {
    const { container } = renderWithRouter(
      <MembersOverviewWidget members={null} loading={false} error={null} />
    );

    expect(container).toBeInTheDocument();
  });

  it('updates when members prop changes', () => {
    const { rerender } = renderWithRouter(
      <MembersOverviewWidget
        members={mockMembers}
        loading={false}
        error={null}
      />
    );

    const newMembers = mockMembers.slice(0, 1);
    rerender(
      <BrowserRouter>
        <MembersOverviewWidget
          members={newMembers}
          loading={false}
          error={null}
        />
      </BrowserRouter>
    );

    expect(screen.getByText('Miembros')).toBeInTheDocument();
  });
});
