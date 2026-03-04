import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RoleGuard } from '../../components/RoleGuard';

const mockCan = jest.fn();
const mockRole = jest.fn();

jest.mock('../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    can: mockCan(),
    canAny: jest.fn(),
    canAll: jest.fn(),
    role: mockRole(),
  }),
}));

describe('RoleGuard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCan.mockReturnValue(() => true);
    mockRole.mockReturnValue('admin');
  });

  it('renders children when no requirements are specified', () => {
    render(
      <RoleGuard>
        <div>Protected Content</div>
      </RoleGuard>,
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when user has a required role', () => {
    mockRole.mockReturnValue('admin');
    render(
      <RoleGuard requiredRoles={['admin', 'owner']}>
        <div>Admin Content</div>
      </RoleGuard>,
    );
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('renders fallback when user does not have required role', () => {
    mockRole.mockReturnValue('viewer');
    render(
      <RoleGuard requiredRoles={['admin', 'owner']} fallback={<div>No access</div>}>
        <div>Admin Content</div>
      </RoleGuard>,
    );
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(screen.getByText('No access')).toBeInTheDocument();
  });

  it('renders nothing (null fallback) when user does not have required role and no fallback', () => {
    mockRole.mockReturnValue('viewer');
    const { container } = render(
      <RoleGuard requiredRoles={['admin', 'owner']}>
        <div>Admin Content</div>
      </RoleGuard>,
    );
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(container.innerHTML).toBe('');
  });

  it('renders children when user has required permission', () => {
    mockCan.mockReturnValue(() => true);
    render(
      <RoleGuard requiredPermission="documents:delete">
        <div>Delete Button</div>
      </RoleGuard>,
    );
    expect(screen.getByText('Delete Button')).toBeInTheDocument();
  });

  it('renders fallback when user does not have required permission', () => {
    mockCan.mockReturnValue(() => false);
    render(
      <RoleGuard requiredPermission="documents:delete" fallback={<div>Hidden</div>}>
        <div>Delete Button</div>
      </RoleGuard>,
    );
    expect(screen.queryByText('Delete Button')).not.toBeInTheDocument();
    expect(screen.getByText('Hidden')).toBeInTheDocument();
  });

  it('checks role first, then permission', () => {
    mockRole.mockReturnValue('viewer');
    mockCan.mockReturnValue(() => true);
    render(
      <RoleGuard requiredRoles={['admin']} requiredPermission="documents:create">
        <div>Content</div>
      </RoleGuard>,
    );
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});
