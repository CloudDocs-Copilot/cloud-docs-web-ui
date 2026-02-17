import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import RequireRole from '../../components/RequireRole';
import type { MembershipRole } from '../../types/organization.types';

const mockRole = jest.fn();

jest.mock('../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    can: jest.fn(),
    canAny: jest.fn(),
    canAll: jest.fn(),
    role: mockRole(),
  }),
}));

function renderWithRouter(initialRoute: string, roles: MembershipRole[], redirectTo?: string) {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <RequireRole roles={roles} redirectTo={redirectTo}>
              <div>Protected Page</div>
            </RequireRole>
          }
        />
        <Route path="/forbidden" element={<div>Forbidden Page</div>} />
        <Route path="/custom-redirect" element={<div>Custom Redirect Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user has an allowed role', () => {
    mockRole.mockReturnValue('admin');
    renderWithRouter('/protected', ['admin', 'owner']);
    expect(screen.getByText('Protected Page')).toBeInTheDocument();
  });

  it('redirects to /forbidden when user does not have an allowed role', () => {
    mockRole.mockReturnValue('viewer');
    renderWithRouter('/protected', ['admin', 'owner']);
    expect(screen.queryByText('Protected Page')).not.toBeInTheDocument();
    expect(screen.getByText('Forbidden Page')).toBeInTheDocument();
  });

  it('redirects to custom path when specified', () => {
    mockRole.mockReturnValue('viewer');
    renderWithRouter('/protected', ['admin', 'owner'], '/custom-redirect');
    expect(screen.queryByText('Protected Page')).not.toBeInTheDocument();
    expect(screen.getByText('Custom Redirect Page')).toBeInTheDocument();
  });

  it('renders children for owner role', () => {
    mockRole.mockReturnValue('owner');
    renderWithRouter('/protected', ['admin', 'owner']);
    expect(screen.getByText('Protected Page')).toBeInTheDocument();
  });

  it('redirects member when only admin/owner allowed', () => {
    mockRole.mockReturnValue('member');
    renderWithRouter('/protected', ['admin', 'owner']);
    expect(screen.queryByText('Protected Page')).not.toBeInTheDocument();
    expect(screen.getByText('Forbidden Page')).toBeInTheDocument();
  });
});
