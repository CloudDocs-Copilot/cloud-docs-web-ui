/// <reference types="jest" />
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import type { Invitation } from '../../types/invitation.types';

const getPendingInvitationsMock = jest.fn();
const acceptMock = jest.fn();
const rejectMock = jest.fn();
const showToastMock = jest.fn();

jest.mock('../../services/invitation.service', () => ({
  getPendingInvitations: () => getPendingInvitationsMock(),
  acceptInvitation: (id: string) => acceptMock(id),
  rejectInvitation: (id: string) => rejectMock(id),
}));

jest.mock('../useToast', () => ({ useToast: () => ({ showToast: showToastMock }) }));

jest.mock('../useAuth', () => ({ useAuth: () => ({ isAuthenticated: true }) }));

import { useInvitations } from '../useInvitations';

function Consumer() {
  const { invitations, loading, error, acceptInvitation, rejectInvitation, pendingCount } = useInvitations();
  return (
    <div>
      <div data-testid="count">{pendingCount}</div>
      <div data-testid="loading">{loading ? 'true' : 'false'}</div>
      <div data-testid="error">{error || ''}</div>
      {invitations.map((inv: Invitation) => (
        <div key={inv.id} data-testid={`inv-${inv.id}`}>
          <span>{inv.organization.name}</span>
          <button onClick={() => acceptInvitation(inv.id)}>accept</button>
          <button onClick={() => rejectInvitation(inv.id)}>reject</button>
        </div>
      ))}
    </div>
  );
}

describe('useInvitations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches invitations successfully', async () => {
    getPendingInvitationsMock.mockResolvedValueOnce([{ 
      id: 'm1', 
      organization: { id: 'o1', name: 'Org A', slug: 'org-a', plan: 'free' },
      role: 'member',
      status: 'pending',
      invitedBy: { id: 'u1', name: 'User 1', email: 'a@a.com' },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }]);

    await act(async () => {
      render(<Consumer />);
    });

    expect(await screen.findByTestId('inv-m1')).toBeInTheDocument();
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('acceptInvitation removes invitation and shows success toast', async () => {
    getPendingInvitationsMock.mockResolvedValue([{ 
      id: 'm2', 
      organization: { id: 'o2', name: 'Org B', slug: 'org-b', plan: 'pro' },
      role: 'admin',
      status: 'pending',
      invitedBy: { id: 'u2', name: 'User 2', email: 'b@b.com' },
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02'
    }]);
    acceptMock.mockResolvedValue({ joined: true });

    await act(async () => { render(<Consumer />); });

    const btn = screen.getByText('accept');
    await act(async () => { fireEvent.click(btn); });

    await waitFor(() => expect(showToastMock).toHaveBeenCalledWith(expect.objectContaining({ variant: 'success' })));
    expect(screen.queryByTestId('inv-m2')).not.toBeInTheDocument();
  });

  it('acceptInvitation failure shows danger toast and returns null', async () => {
    getPendingInvitationsMock.mockResolvedValue([{ 
      id: 'm3', 
      organization: { id: 'o3', name: 'Org C', slug: 'org-c', plan: 'free' },
      role: 'viewer',
      status: 'pending',
      invitedBy: { id: 'u3', name: 'User 3', email: 'c@c.com' },
      createdAt: '2024-01-03',
      updatedAt: '2024-01-03'
    }]);
    acceptMock.mockRejectedValue(new Error('fail'));

    await act(async () => { render(<Consumer />); });
    const btn = screen.getByText('accept');
    await act(async () => { fireEvent.click(btn); });

    await waitFor(() => expect(showToastMock).toHaveBeenCalledWith(expect.objectContaining({ variant: 'danger' })));
    // invitation should remain
    expect(screen.getByTestId('inv-m3')).toBeInTheDocument();
  });
});

// Error handling tests
describe('useInvitations error branches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchInvitations shows toast and sets error when service fails', async () => {
    getPendingInvitationsMock.mockRejectedValue(new Error('net'));

    const TestComponent = () => {
      const { loading, error } = useInvitations();
      return (
        <div>
          <div data-testid="loading">{String(loading)}</div>
          <div data-testid="error">{String(error)}</div>
        </div>
      );
    };

    render(<TestComponent />);

    await waitFor(() => expect(showToastMock).toHaveBeenCalled());
    expect(screen.getByTestId('error').textContent).not.toBe('null');
  });

  it('acceptInvitation returns null and shows toast on error', async () => {
    getPendingInvitationsMock.mockResolvedValue([{ id: 'i1', organization: { id: 'o1', name: 'Org', slug: 'org', plan: 'free' }, role: 'member', status: 'pending', invitedBy: { id: 'u1', name: 'U', email: 'e@e.com' }, createdAt: '2024-01-01', updatedAt: '2024-01-01' }]);
    acceptMock.mockRejectedValue(new Error('boom'));

    const TestComponent = () => {
      const { invitations, acceptInvitation } = useInvitations();
      return (
        <div>
          <div data-testid="count">{invitations.length}</div>
          <button onClick={() => acceptInvitation('i1')}>accept</button>
        </div>
      );
    };

    render(<TestComponent />);
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));

    fireEvent.click(screen.getByText('accept'));
    await waitFor(() => expect(showToastMock).toHaveBeenCalled());
    expect(screen.getByTestId('count').textContent).toBe('1');
  });

  it('rejectInvitation returns false on error and shows toast', async () => {
    getPendingInvitationsMock.mockResolvedValue([{ id: 'i1', organization: { id: 'o1', name: 'Org', slug: 'org', plan: 'free' }, role: 'member', status: 'pending', invitedBy: { id: 'u1', name: 'U', email: 'e@e.com' }, createdAt: '2024-01-01', updatedAt: '2024-01-01' }]);
    rejectMock.mockRejectedValue(new Error('boom'));

    const TestComponent = () => {
      const { invitations, rejectInvitation } = useInvitations();
      return (
        <div>
          <div data-testid="count">{invitations.length}</div>
          <button onClick={() => rejectInvitation('i1')}>reject</button>
        </div>
      );
    };

    render(<TestComponent />);
    await waitFor(() => expect(screen.getByTestId('count').textContent).toBe('1'));

    fireEvent.click(screen.getByText('reject'));
    await waitFor(() => expect(showToastMock).toHaveBeenCalled());
    expect(screen.getByTestId('count').textContent).toBe('1');
  });
});
