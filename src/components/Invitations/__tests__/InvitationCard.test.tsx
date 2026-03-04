import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import type { Invitation } from '../../../types/invitation.types';
import InvitationCard from '../InvitationCard';

const sampleInvitation = {
  id: 'inv-1',
  organization: { id: 'org-1', name: 'Acme', plan: 'professional' },
  invitedBy: { name: 'Alice', email: 'alice@example.com' },
  role: 'admin',
  createdAt: new Date().toISOString(),
};

const baseInvitation = {
  id: 'i1',
  organization: { id: 'o1', name: 'Org', plan: 'free' },
  invitedBy: { name: 'A', email: 'a@x.com' },
  role: 'member',
  createdAt: new Date().toISOString(),
};

describe('InvitationCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders organization and role/plan', () => {
    render(<InvitationCard invitation={sampleInvitation as Invitation} onAccept={jest.fn()} onReject={jest.fn()} />);
    expect(screen.getByText(/Acme/)).toBeInTheDocument();
    expect(screen.getByText(/ADMIN/)).toBeInTheDocument();
    expect(screen.getByText(/PROFESSIONAL/)).toBeInTheDocument();
  });

  it('calls onAccept and shows accepting state', async () => {
    let resolver!: () => void;
    const onAccept = jest.fn(() => new Promise<void>((r) => { resolver = r; }));
    render(<InvitationCard invitation={sampleInvitation as Invitation} onAccept={onAccept} onReject={jest.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /Aceptar/i }));
    expect(onAccept).toHaveBeenCalledWith('inv-1');
    expect(screen.getByText(/Aceptando/i)).toBeInTheDocument();
    resolver();
    await waitFor(() => expect(screen.queryByText(/Aceptando/i)).not.toBeInTheDocument());
  });

  it('does not call onReject if user cancels confirm', () => {
    window.confirm = jest.fn(() => false);
    const onReject = jest.fn();
    render(<InvitationCard invitation={sampleInvitation as Invitation} onAccept={jest.fn()} onReject={onReject} />);
    fireEvent.click(screen.getByRole('button', { name: /Rechazar/i }));
    expect(onReject).not.toHaveBeenCalled();
  });

  it('calls onReject when confirmed and shows rejecting state', async () => {
    let resolver!: () => void;
    window.confirm = jest.fn(() => true);
    const onReject = jest.fn(() => new Promise<void>((r) => { resolver = r; }));
    render(<InvitationCard invitation={sampleInvitation as Invitation} onAccept={jest.fn()} onReject={onReject} />);
    fireEvent.click(screen.getByRole('button', { name: /Rechazar/i }));
    expect(onReject).toHaveBeenCalledWith('inv-1');
    expect(screen.getByText(/Rechazando/i)).toBeInTheDocument();
    resolver();
    await waitFor(() => expect(screen.queryByText(/Rechazando/i)).not.toBeInTheDocument());
  });

  it('formats timeAgo for older dates', () => {
    const old = new Date(Date.now() - (36 * 60 * 60 * 1000)).toISOString(); // 36 hours ago
    const inv = { ...sampleInvitation, createdAt: old };
    render(<InvitationCard invitation={inv as Invitation} onAccept={jest.fn()} onReject={jest.fn()} />);
    expect(screen.getByText(/Hace/)).toBeInTheDocument();
  });

  it('renders role badge variants', () => {
    const roles: Array<'owner' | 'admin' | 'member' | 'viewer'> = ['owner', 'admin', 'member', 'viewer'];
    roles.forEach((r) => {
      const inv = { ...baseInvitation, id: `x-${r}`, role: r };
      render(<InvitationCard invitation={inv as Invitation} onAccept={async () => {}} onReject={async () => {}} />);
      expect(screen.getByText(new RegExp(String(r).toUpperCase()))).toBeInTheDocument();
    });
  });

  it('uses invitedBy.email when name missing', () => {
    const inv = { ...baseInvitation, invitedBy: { email: 'no-name@x.com' } };
    render(<InvitationCard invitation={inv as Invitation} onAccept={async () => {}} onReject={async () => {}} />);
    expect(screen.getByText(/no-name@x.com/)).toBeInTheDocument();
  });

  it('plan badge variant branches for different plans', () => {
    const plans: Array<'enterprise' | 'professional' | 'basic' | 'free'> = ['enterprise', 'professional', 'basic', 'free'];
    plans.forEach((p) => {
      const inv = { ...baseInvitation, id: `p-${p}`, organization: { ...baseInvitation.organization, plan: p } };
      render(<InvitationCard invitation={inv as Invitation} onAccept={async () => {}} onReject={async () => {}} />);
      expect(screen.getByText(new RegExp(String(p).toUpperCase()))).toBeInTheDocument();
    });
  });

  it('accept and reject buttons call handlers', async () => {
    const accept = jest.fn().mockResolvedValue(undefined);
    const reject = jest.fn().mockResolvedValue(undefined);
    window.confirm = jest.fn(() => true);
    const inv = { ...baseInvitation };
    render(<InvitationCard invitation={inv as Invitation} onAccept={accept} onReject={reject} />);
    const acceptBtn = screen.getByRole('button', { name: /Aceptar/i });
    const rejectBtn = screen.getByRole('button', { name: /Rechazar/i });
    await waitFor(() => expect(acceptBtn).toBeEnabled());
    await userEvent.click(acceptBtn);
    await waitFor(() => expect(accept).toHaveBeenCalledWith(inv.id));
    await waitFor(() => expect(rejectBtn).toBeEnabled());
    await userEvent.click(rejectBtn);
    await waitFor(() => expect(reject).toHaveBeenCalledWith(inv.id));
  });
});
