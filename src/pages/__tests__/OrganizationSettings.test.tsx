import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import OrganizationSettings from '../OrganizationSettings';

jest.mock('../../hooks/useOrganization');
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useToast');
jest.mock('../../hooks/usePageInfoTitle', () => ({ usePageTitle: jest.fn() }));
jest.mock('../../api');
jest.mock('../../components/MainLayout', () => ({ __esModule: true, default: ({ children }: { children: React.ReactNode }) => <div data-testid="main-layout">{children}</div> }));
jest.mock('../../components/Organization/InviteMemberModal', () => ({ __esModule: true, default: ({ show }: { show: boolean }) => show ? <div>InviteModal</div> : null }));

import useOrganization from '../../hooks/useOrganization';
import { apiClient } from '../../api';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

describe('OrganizationSettings', () => {
  beforeEach(() => {
    (useOrganization as jest.Mock).mockReturnValue({
      activeOrganization: { id: 'org-1', name: 'Org 1' },
      isAdmin: () => true,
      isOwner: () => false,
      fetchActiveOrganization: jest.fn(),
      loading: false,
    });

    (useAuth as jest.Mock).mockReturnValue({ user: { id: 'u1', name: 'Admin', email: 'admin@example.com' } });
    (useToast as jest.Mock).mockReturnValue({ showToast: jest.fn() });
  });

  it('fetches and displays members', async () => {
    const mockGet = (apiClient.get as jest.Mock).mockResolvedValue({ data: [ { id: 'm1', user: { id: 'u2', name: 'Alice', email: 'alice@example.com' }, role: 'member', status: 'active' } ] });

    render(<OrganizationSettings />);

    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());

    expect(mockGet).toHaveBeenCalled();
  });
});
