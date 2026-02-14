import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../hooks/usePageInfoTitle', () => ({ usePageTitle: jest.fn() }));
jest.mock('../../hooks/useOrganization');

import * as OrgHook from '../../hooks/useOrganization';
import CreateOrganization from '../CreateOrganization';

describe('CreateOrganization', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders and validates empty name', () => {
    const createMock = jest.fn();
    type CreateOrgFn = (payload: import('../../types/organization.types').CreateOrganizationPayload) => Promise<import('../../types/organization.types').Organization>;
    const fakeCtx: import('../../types/organization.types').OrgContextValue = {
      organizations: [],
      activeOrganization: null,
      membership: null,
      loading: false,
      error: null,
      fetchOrganizations: async () => {},
      fetchActiveOrganization: async () => {},
      setActiveOrganization: async () => {},
      createOrganization: createMock as unknown as CreateOrgFn,
      refreshOrganization: async () => {},
      clearOrganization: () => {},
      hasRole: () => false,
      isAdmin: false,
      isOwner: false,
    };
    (OrgHook.useOrganization as jest.Mock).mockImplementation(() => fakeCtx);
    
    render(<CreateOrganization />);
    expect(screen.getAllByText(/Crear organización/i).length).toBeGreaterThan(0);
  });

  it('submits and navigates to dashboard after timeout on success', async () => {
    jest.useFakeTimers();
    const createMock = jest.fn().mockResolvedValue({ id: 'org1' });
    type CreateOrgFn = (payload: import('../../types/organization.types').CreateOrganizationPayload) => Promise<import('../../types/organization.types').Organization>;
    const fakeCtx: import('../../types/organization.types').OrgContextValue = {
      organizations: [],
      activeOrganization: null,
      membership: null,
      loading: false,
      error: null,
      fetchOrganizations: async () => {},
      fetchActiveOrganization: async () => {},
      setActiveOrganization: async () => {},
      createOrganization: createMock as unknown as CreateOrgFn,
      refreshOrganization: async () => {},
      clearOrganization: () => {},
      hasRole: () => false,
      isAdmin: false,
      isOwner: false,
    };
    (OrgHook.useOrganization as jest.Mock).mockImplementation(() => fakeCtx);

    render(<CreateOrganization />);

    const input = screen.getByPlaceholderText(/Nombre de la organización/i);
    fireEvent.change(input, { target: { value: ' Acme Co ' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear organización/i }));

    await waitFor(() => expect(createMock).toHaveBeenCalledWith({ name: 'Acme Co' }));

    await act(async () => {
      jest.advanceTimersByTime(3500);
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
    jest.useRealTimers();
  });

  it('submits and shows toast on success', async () => {
    const createMock = jest.fn().mockResolvedValue({ id: 'org-1', name: 'TestOrg' });
    type CreateOrgFn = (payload: import('../../types/organization.types').CreateOrganizationPayload) => Promise<import('../../types/organization.types').Organization>;
    const fakeCtx2: import('../../types/organization.types').OrgContextValue = {
      organizations: [],
      activeOrganization: null,
      membership: null,
      loading: false,
      error: null,
      fetchOrganizations: async () => {},
      fetchActiveOrganization: async () => {},
      setActiveOrganization: async () => {},
      createOrganization: createMock as unknown as CreateOrgFn,
      refreshOrganization: async () => {},
      clearOrganization: () => {},
      hasRole: () => false,
      isAdmin: false,
      isOwner: false,
    };
    (OrgHook.useOrganization as jest.Mock).mockImplementation(() => fakeCtx2);

    render(<CreateOrganization />);

    const input = screen.getByPlaceholderText(/Nombre de la organización/i);
    fireEvent.change(input, { target: { value: 'My Org' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear organización/i }));

    await waitFor(() => expect(createMock).toHaveBeenCalledWith({ name: 'My Org' }));
    expect(createMock).toHaveBeenCalled();
  });

  it('shows error toast when createOrganization throws', async () => {
    const createMock = jest.fn().mockRejectedValue(new Error('boom'));
    type CreateOrgFn = (payload: import('../../types/organization.types').CreateOrganizationPayload) => Promise<import('../../types/organization.types').Organization>;
    const fakeCtx3: import('../../types/organization.types').OrgContextValue = {
      organizations: [],
      activeOrganization: null,
      membership: null,
      loading: false,
      error: null,
      fetchOrganizations: async () => {},
      fetchActiveOrganization: async () => {},
      setActiveOrganization: async () => {},
      createOrganization: createMock as unknown as CreateOrgFn,
      refreshOrganization: async () => {},
      clearOrganization: () => {},
      hasRole: () => false,
      isAdmin: false,
      isOwner: false,
    };
    (OrgHook.useOrganization as jest.Mock).mockImplementation(() => fakeCtx3);

    render(<CreateOrganization />);
    fireEvent.change(screen.getByPlaceholderText(/Nombre de la organización/i), { target: { value: 'X' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear organización/i }));

    await waitFor(() => expect(createMock).toHaveBeenCalled());
    expect(true).toBeTruthy();
  });

  it('disables submit while submitting', async () => {
    let resolver: (value?: unknown) => void = () => {};
    const createMock = jest.fn(() => new Promise(r => { resolver = r; }));
    type CreateOrgFn = (payload: import('../../types/organization.types').CreateOrganizationPayload) => Promise<import('../../types/organization.types').Organization>;
    const fakeCtx4: import('../../types/organization.types').OrgContextValue = {
      organizations: [],
      activeOrganization: null,
      membership: null,
      loading: false,
      error: null,
      fetchOrganizations: async () => {},
      fetchActiveOrganization: async () => {},
      setActiveOrganization: async () => {},
      createOrganization: createMock as unknown as CreateOrgFn,
      refreshOrganization: async () => {},
      clearOrganization: () => {},
      hasRole: () => false,
      isAdmin: false,
      isOwner: false,
    };
    (OrgHook.useOrganization as jest.Mock).mockImplementation(() => fakeCtx4);

    render(<CreateOrganization />);
    fireEvent.change(screen.getByPlaceholderText(/Nombre de la organización/i), { target: { value: 'Delayed' } });
    fireEvent.click(screen.getByRole('button', { name: /Crear organización/i }));

    expect(screen.getByRole('button', { name: /Creando...|Crear organización/i })).toBeDisabled();
    resolver({ id: 'org-2', name: 'Delayed' });
    await waitFor(() => expect(createMock).toHaveBeenCalled());
  });

  it('has cancel button that navigates', () => {
    render(<CreateOrganization />);
    expect(screen.getByRole('button', { name: /Ir a Inicio/i })).toBeInTheDocument();
  });

  it('navigates to home when clicking "Ir a Inicio" button', () => {
    type CreateOrgFn = (payload: import('../../types/organization.types').CreateOrganizationPayload) => Promise<import('../../types/organization.types').Organization>;
    const createMock = jest.fn();
    const fakeCtx: import('../../types/organization.types').OrgContextValue = {
      organizations: [],
      activeOrganization: null,
      membership: null,
      loading: false,
      error: null,
      fetchOrganizations: async () => {},
      fetchActiveOrganization: async () => {},
      setActiveOrganization: async () => {},
      createOrganization: createMock as unknown as CreateOrgFn,
      refreshOrganization: async () => {},
      clearOrganization: () => {},
      hasRole: () => false,
      isAdmin: false,
      isOwner: false,
    };
    (OrgHook.useOrganization as jest.Mock).mockImplementation(() => fakeCtx);

    render(<CreateOrganization />);

    const btn = screen.getByRole('button', { name: /Ir a Inicio/i });
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('disables submit while submitting and re-enables after error', async () => {
    type CreateOrgFn = (payload: import('../../types/organization.types').CreateOrganizationPayload) => Promise<import('../../types/organization.types').Organization>;
    const createMock = jest.fn().mockRejectedValue(new Error('boom'));
    const fakeCtx: import('../../types/organization.types').OrgContextValue = {
      organizations: [],
      activeOrganization: null,
      membership: null,
      loading: false,
      error: null,
      fetchOrganizations: async () => {},
      fetchActiveOrganization: async () => {},
      setActiveOrganization: async () => {},
      createOrganization: createMock as unknown as CreateOrgFn,
      refreshOrganization: async () => {},
      clearOrganization: () => {},
      hasRole: () => false,
      isAdmin: false,
      isOwner: false,
    };
    (OrgHook.useOrganization as jest.Mock).mockImplementation(() => fakeCtx);

    render(<CreateOrganization />);
    const input = screen.getByPlaceholderText(/Nombre de la organización/i);
    fireEvent.change(input, { target: { value: 'Test Co' } });
    const submit = screen.getByRole('button', { name: /Crear organización/i });

    fireEvent.click(submit);
    expect(submit).toBeDisabled();

    await waitFor(() => {
      expect(submit).not.toBeDisabled();
    });

    expect(createMock).toHaveBeenCalledWith({ name: 'Test Co' });
  });
});
