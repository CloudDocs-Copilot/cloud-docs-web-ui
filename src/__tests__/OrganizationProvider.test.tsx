
import { useContext } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrganizationContext } from '../context/OrganizationContext';
import OrganizationProvider from '../context/OrganizationProvider';

// Mocks
const mockPost = jest.fn();
const mockGet = jest.fn();

jest.mock('../api', () => ({
  apiClient: {
    post: (...args: unknown[]) => mockPost(...args),
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

const mockShowToast = jest.fn();
jest.mock('../hooks/useToast', () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

import { ACTIVE_ORG_STORAGE_KEY } from '../types/organization.types';

function TestConsumer() {
  const ctx = useContext(OrganizationContext);
  if (!ctx) return null;
  const { activeOrganization, setActiveOrganization } = ctx;
  return (
    <div>
      <div>active:{activeOrganization?.id ?? 'null'}</div>
      <button onClick={() => { setActiveOrganization('org-1').catch(() => {}); }}>switch</button>
    </div>
  );
}

describe('OrganizationProvider - optimistic setActiveOrganization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('sets active organization optimistically and updates with canonical data on success', async () => {
    // apiClient.post resolves, apiClient.get for organization returns canonical data
    mockPost.mockResolvedValueOnce({ status: 200 });
    mockGet.mockImplementation((url: string) => {
      if (url === '/organizations/org-1') {
        return Promise.resolve({ data: { id: 'org-1', name: 'Org One' } });
      }
      return Promise.resolve({ data: null });
    });

    render(
      <OrganizationProvider>
        <TestConsumer />
      </OrganizationProvider>
    );

    // initial state
    expect(screen.getByText('active:null')).toBeInTheDocument();

    fireEvent.click(screen.getByText('switch'));

    // optimistic update should set localStorage to org id immediately
    await waitFor(() => expect(localStorage.getItem(ACTIVE_ORG_STORAGE_KEY)).toBe('org-1'));

    // after successful canonical fetch, active org should be updated to canonical id
    await waitFor(() => expect(screen.getByText('active:org-1')).toBeInTheDocument());
  });

  test('rolls back and shows toast when server request fails', async () => {
    // post will reject
    mockPost.mockRejectedValueOnce(new Error('network'));
    mockGet.mockResolvedValue({ data: null });

    // spy on localStorage.removeItem
    const removeSpy = jest.spyOn(Storage.prototype, 'removeItem');

    render(
      <OrganizationProvider>
        <TestConsumer />
      </OrganizationProvider>
    );

    fireEvent.click(screen.getByText('switch'));

    // wait for the call and rollback to complete
    await waitFor(() => expect(mockShowToast).toHaveBeenCalled());

    // localStorage should not contain the optimistic id after rollback
    expect(localStorage.getItem(ACTIVE_ORG_STORAGE_KEY)).toBe(null);
    expect(removeSpy).toHaveBeenCalled();
  });
});
