import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import PendingInvitations from '../PendingInvitations';
import { type Invitation } from '../../types/invitation.types';

interface InvitationCardProps {
  invitation: Invitation;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

const mockUseInvitations = jest.fn();
const mockUseOrganization = jest.fn();

jest.mock('../../components/Invitations/InvitationCard', () => ({
  __esModule: true,
  default: ({ invitation, onAccept, onReject }: InvitationCardProps) => (
    <div data-testid={`inv-${invitation.id}`}>
      <span>inv</span>
      <button onClick={() => onAccept(invitation.id)}>Aceptar</button>
      <button onClick={() => onReject(invitation.id)}>Rechazar</button>
    </div>
  ),
}));

jest.mock('../../components/MainLayout', () => ({ __esModule: true, default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));

jest.mock('../../hooks/useInvitations', () => ({
  useInvitations: () => mockUseInvitations(),
}));

jest.mock('../../hooks/useOrganization', () => ({ __esModule: true, default: () => mockUseOrganization() }));
jest.mock('../../hooks/usePageInfoTitle', () => ({ usePageTitle: jest.fn() }));
jest.mock('../../hooks/usePageContext', () => ({ usePageContext: () => ({}) }));

describe('PendingInvitations', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseInvitations.mockReturnValue({ invitations: [], loading: false, acceptInvitation: jest.fn(), rejectInvitation: jest.fn() });
    mockUseOrganization.mockReturnValue({ fetchOrganizations: jest.fn(), setActiveOrganization: jest.fn() });
  });

  it('shows loading state', () => {
    mockUseInvitations.mockReturnValue({ invitations: [], loading: true, acceptInvitation: jest.fn(), rejectInvitation: jest.fn() });
    render(<MemoryRouter><PendingInvitations /></MemoryRouter>);
    expect(screen.getByText(/Cargando invitaciones/i)).toBeInTheDocument();
  });

  it('shows empty state when no invitations', () => {
    mockUseInvitations.mockReturnValue({ invitations: [], loading: false, acceptInvitation: jest.fn(), rejectInvitation: jest.fn() });
    render(<MemoryRouter><PendingInvitations /></MemoryRouter>);
    expect(screen.getByText(/No tienes invitaciones pendientes/i)).toBeInTheDocument();
  });

  it('renders invitation cards when present and accepts', async () => {
    const acceptMock = jest.fn().mockResolvedValue({ membership: { organization: 'org-1' } });
    mockUseInvitations.mockReturnValue({ invitations: [{ id: 'i1', organization: { id: 'org-1', name: 'Acme', plan: 'free' }, invitedBy: { name: 'A' }, role: 'member', createdAt: new Date().toISOString() }], loading: false, acceptInvitation: acceptMock, rejectInvitation: jest.fn() });

    mockUseOrganization.mockReturnValue({ fetchOrganizations: jest.fn(), setActiveOrganization: jest.fn() });

    render(<MemoryRouter><PendingInvitations /></MemoryRouter>);

    expect(screen.getByText(/Invitaciones Pendientes/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Aceptar/i }));
    await waitFor(() => expect(acceptMock).toHaveBeenCalledWith('i1'));
  });

  it('rejects invitation', async () => {
    const rejectMock = jest.fn().mockResolvedValue({});
    mockUseInvitations.mockReturnValue({ invitations: [{ id: 'i2', organization: { id: 'org-2', name: 'B', plan: 'free' }, invitedBy: { name: 'B' }, role: 'member', createdAt: new Date().toISOString() }], loading: false, acceptInvitation: jest.fn(), rejectInvitation: rejectMock });
    // ensure confirm returns true so the reject flow proceeds
    jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<MemoryRouter><PendingInvitations /></MemoryRouter>);
    fireEvent.click(screen.getByRole('button', { name: /Rechazar/i }));
    await waitFor(() => expect(rejectMock).toHaveBeenCalledWith('i2'));
  });
});
