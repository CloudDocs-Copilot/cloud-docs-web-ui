import React from 'react';
import { render, act, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import type { OrgContextValue } from '../../types/organization.types';
// Important: we mock modules below before requiring the provider
// so the provider picks up the mocked `apiClient` and hook implementations.

const mockPost = jest.fn();
const mockGet = jest.fn();
const showToastMock = jest.fn();

jest.mock('../../api', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
  }
}));

jest.mock('../../hooks/useAuth', () => ({ 
  useAuth: () => ({ isAuthenticated: true, user: { id: 'u1' } }) 
}));

jest.mock('../../hooks/useToast', () => ({ 
  useToast: () => ({ showToast: showToastMock }) 
}));

import { OrganizationContext } from '../OrganizationContext';
import OrganizationProvider from '../OrganizationProvider';

// Use the static imports (mocks are declared above)
const OrganizationContextTyped = OrganizationContext as React.Context<OrgContextValue | undefined>;
const OrganizationProviderTyped = OrganizationProvider as React.FC<{ children: React.ReactNode }>;

describe('OrganizationProvider', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    localStorage.clear();
  });
  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
    localStorage.clear();
  });

  // ==================== Context Initialization ====================
  describe('Context initialization', () => {
    it('loads memberships and sets active organization when API returns active id', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url === '/memberships/my-organizations') {
          return Promise.resolve({ data: [{ id: 'org-1', name: 'Org 1' }] });
        }
        if (url === '/memberships/active-organization') {
          return Promise.resolve({ data: { success: true, organizationId: 'org-1' } });
        }
        if (url.includes('/organizations/org-1')) {
          return Promise.resolve({ data: { organization: { id: 'org-1', name: 'Org 1' } } });
        }
        return Promise.resolve({ data: {} });
      });

      // restore from localStorage so provider initializes active org deterministically
      localStorage.setItem('clouddocs:activeOrgId', 'org-1');
      
      function TestConsumer() {
        const c = React.useContext(OrganizationContextTyped);
        return (
          <div>
            <div data-testid="ctx-defined">{c ? 'defined' : 'undefined'}</div>
            <div data-testid="active-org">{c?.activeOrganization?.id ?? 'null'}</div>
          </div>
        );
      }

      await act(async () => {
        render(<OrganizationProvider><TestConsumer /></OrganizationProvider>);
      });

      await waitFor(() => {
        expect(screen.getByTestId('ctx-defined').textContent).toBe('defined');
        expect(screen.getByTestId('active-org').textContent).not.toBe('null');
      }, { timeout: 2000 });

      expect(screen.getByTestId('active-org').textContent).toBe('org-1');
    });
  });

  // ==================== setActiveOrganization - Success Scenarios ====================
  describe('setActiveOrganization - success scenarios', () => {
    it('succeeds and updates activeOrganization', async () => {
      mockPost.mockResolvedValue({ status: 200, data: {} });
      mockGet.mockImplementation((url: string) => {
        if (url === '/memberships/my-organizations') return Promise.resolve({ data: [] });
        if (url.includes('/organizations/org-1')) return Promise.resolve({ data: { organization: { id: 'org-1', name: 'Org One' } } });
        if (url === '/memberships/active-organization') return Promise.resolve({ data: { success: true, organizationId: 'org-1' } });
        return Promise.resolve({ data: [] });
      });

      function TestConsumer() {
        const ctx = React.useContext(OrganizationContextTyped);
        return (
          <div>
            <div data-testid="active-org-id">{ctx?.activeOrganization?.id ?? 'null'}</div>
            <button onClick={() => { void ctx?.setActiveOrganization('org-1'); }}>Set Active</button>
          </div>
        );
      }

      render(<OrganizationProvider><TestConsumer /></OrganizationProvider>);

      await act(async () => {
        fireEvent.click(screen.getByText('Set Active'));
      });

      expect(mockPost).toHaveBeenCalledWith('/memberships/set-active', { organizationId: 'org-1' });
      await waitFor(() => {
        expect(screen.getByTestId('active-org-id').textContent).toBe('org-1');
      }, { timeout: 2000 });
      
      expect(localStorage.getItem('clouddocs:activeOrgId')).toBe('org-1');
    });

    it('calls apiClient.post successfully', async () => {
      mockPost.mockResolvedValueOnce({ data: {} });
      mockGet.mockImplementation((url: string) => {
        if (url === '/memberships/my-organizations') return Promise.resolve({ data: [] });
        if (url.includes('/organizations/')) return Promise.resolve({ data: { organization: { id: 'org-success', name: 'Success Org' } } });
        if (url === '/memberships/active-organization') return Promise.resolve({ data: { success: false } });
        return Promise.resolve({ data: {} });
      });

      // restore from localStorage so provider initializes active org deterministically
      localStorage.setItem('clouddocs:activeOrgId', 'org-wrapped');
      
      function TestConsumer() {
        const c = React.useContext(OrganizationContextTyped);
        return <button onClick={() => { void c?.setActiveOrganization('org-success'); }}>Set Active</button>;
      }

      render(<OrganizationProvider><TestConsumer /></OrganizationProvider>);

      await act(async () => {
        fireEvent.click(screen.getByText('Set Active'));
      });

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/memberships/set-active', { organizationId: 'org-success' });
      });
    });
  });

  // ==================== setActiveOrganization - Error Handling ====================
  describe('setActiveOrganization - error handling and rollback', () => {
    it('rolls back and shows toast on post failure', async () => {
      mockPost.mockRejectedValueOnce(new Error('network'));
      mockGet.mockResolvedValue({ data: { organization: { id: 'org-rollback', name: 'Org R' } } });

      function TestConsumer() {
        const c = React.useContext(OrganizationContextTyped);
        return (
          <div>
            <div data-testid="active-org-rollback">{c?.activeOrganization?.id ?? 'null'}</div>
            <button onClick={() => { void c?.setActiveOrganization('org-rollback').catch(() => {}); }}>Set Active</button>
          </div>
        );
      }

      render(<OrganizationProvider><TestConsumer /></OrganizationProvider>);

      await waitFor(() => {
        expect(screen.getByTestId('active-org-rollback').textContent).toBe('null');
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Set Active'));
      });

      await waitFor(() => {
        expect(showToastMock).toHaveBeenCalled();
      });
      
      expect(screen.getByTestId('active-org-rollback').textContent).toBe('null');
    });

    it('rolls back to previous organization on failure', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url === '/memberships/my-organizations') return Promise.resolve({ data: [] });
        if (url === '/memberships/active-organization') return Promise.resolve({ data: { success: false } });
        if (typeof url === 'string' && url.startsWith('/organizations/')) {
          return Promise.resolve({ data: { organization: { id: 'org-1', name: 'Org 1' } } });
        }
        return Promise.resolve({ data: {} });
      });

      mockPost.mockImplementation(() => Promise.reject(new Error('network')));

      function TestConsumer() {
        const ctx = React.useContext(OrganizationContextTyped);
        if (!ctx) return null;
        return (
          <div>
            <div data-testid="active">{ctx.activeOrganization ? ctx.activeOrganization.id : 'none'}</div>
            <button onClick={() => { void ctx.setActiveOrganization('org-1').catch(() => {}); }}>Set Active</button>
          </div>
        );
      }

      render(
        React.createElement(OrganizationProviderTyped, null, React.createElement(TestConsumer))
      );

      await waitFor(() => {
        expect(screen.getByTestId('active')).toBeInTheDocument();
      });

      const btn = screen.getByText('Set Active');

      await act(async () => {
        fireEvent.click(btn);
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      await waitFor(() => {
        expect(showToastMock).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('handles error branch when patch attempt fails', async () => {
      mockPost.mockRejectedValueOnce(new Error('Patch failed'));
      mockGet.mockImplementation((url: string) => {
        if (url === '/memberships/my-organizations') return Promise.resolve({ data: [] });
        if (url === '/memberships/active-organization') return Promise.resolve({ data: { success: false } });
        return Promise.resolve({ data: {} });
      });

      function TestConsumer() {
        const c = React.useContext(OrganizationContextTyped);
        return <button onClick={() => { void c?.setActiveOrganization('org-fail').catch(() => {}); }}>Set Active</button>;
      }

      render(<OrganizationProvider><TestConsumer /></OrganizationProvider>);

      await act(async () => {
        fireEvent.click(screen.getByText('Set Active'));
      });

      await waitFor(() => {
        expect(showToastMock).toHaveBeenCalled();
      });
    });
  });

  // ==================== createOrganization ====================
  describe('createOrganization', () => {
    it('throws on non-2xx response', async () => {
      mockPost.mockRejectedValueOnce({ response: { status: 500, data: { message: 'Server error' } } });
      mockGet.mockResolvedValue({ data: {} });

      function TestConsumer() {
        const c = React.useContext(OrganizationContextTyped);
        return <button onClick={() => { void c?.createOrganization({ name: 'Test' }).catch(() => {}); }}>Create</button>;
      }

      render(<OrganizationProvider><TestConsumer /></OrganizationProvider>);

      await act(async () => {
        fireEvent.click(screen.getByText('Create'));
      });

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalled();
      });
    });
  });

  // ==================== clearOrganization ====================
  describe('clearOrganization', () => {
    it('clears active organization and membership', async () => {
      mockGet.mockResolvedValue({ data: { organization: { id: 'org-x', name: 'Org X' } } });

      function TestConsumer() {
        const c = React.useContext(OrganizationContextTyped);
        return (
          <div>
            <div data-testid="clear-active-org">{c?.activeOrganization?.id ?? 'null'}</div>
            <div data-testid="clear-membership">{c?.membership?.id ?? 'null'}</div>
            <button onClick={() => { void c?.clearOrganization(); }}>Clear</button>
          </div>
        );
      }

      render(<OrganizationProvider><TestConsumer /></OrganizationProvider>);

      await act(async () => { 
        fireEvent.click(screen.getByText('Clear'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('clear-active-org').textContent).toBe('null');
        expect(screen.getByTestId('clear-membership').textContent).toBe('null');
      });
    });
  });

  // ==================== validateActiveMembership ====================
  describe('validateActiveMembership', () => {
    it('uses cached memberships to set membership for active org', async () => {
      mockGet.mockImplementation((url: string) => {
        const u = String(url || '');
        if (u.includes('/memberships/my-organizations')) {
          return Promise.resolve({ data: [{ id: 'm1', organization: { id: 'org-1', name: 'Org 1' }, role: 'admin', status: 'active', user: 'u1' }] });
        }
        if (u.includes('/memberships/active-organization')) {
          // Return an explicit active id so provider picks it up deterministically
          return Promise.resolve({ data: { success: true, organizationId: 'org-1' } });
        }
        if (u.includes('/organizations/org-1')) {
          return Promise.resolve({ data: { organization: { id: 'org-1', name: 'Org 1' } } });
        }
        return Promise.resolve({ data: {} });
      });

      // ensure provider initializes active org deterministically
      localStorage.setItem('clouddocs:activeOrgId', 'org-1');

      // render using the already-required provider to avoid duplicate React copies
      function TestConsumer() {
        const c = React.useContext(OrganizationContextTyped);
        return (
          <div>
            <div data-testid="active">{c?.activeOrganization ? c.activeOrganization.id : 'none'}</div>
            <div data-testid="member">{c?.membership?.role ?? 'none'}</div>
          </div>
        );
      }

      function Capture() {
        const c = React.useContext(OrganizationContextTyped);
        return (
          <div>
            <TestConsumer />
            <button onClick={() => { void c?.fetchOrganizations(); }}>Fetch Orgs</button>
            <button onClick={() => { 
              mockPost.mockResolvedValueOnce({ status: 200, data: {} });
              mockGet.mockResolvedValueOnce({ data: { organization: { id: 'org-1', name: 'Org 1' } } });
              void c?.setActiveOrganization('org-1'); 
            }}>Set Active Org</button>
          </div>
        );
      }

      await act(async () => {
        render(<OrganizationProvider><Capture /></OrganizationProvider>);
      });

      // explicitly trigger provider initialization steps to avoid timing races
      await act(async () => {
        fireEvent.click(screen.getByText('Fetch Orgs'));
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Set Active Org'));
      });

      await waitFor(() => expect(screen.getByTestId('active').textContent).toBe('org-1'), { timeout: 3000 });
      await waitFor(() => expect(screen.getByTestId('member').textContent).toBe('admin'), { timeout: 2000 });
    });

    it('handles wrapped active-organization response with membership', async () => {
      mockGet.mockImplementation((url: string) => {
        const u = String(url || '');
        if (u.includes('/memberships/my-organizations')) {
          return Promise.resolve({ data: [{ id: 'm2', organization: { id: 'org-wrapped', name: 'Wrapped Org' }, role: 'member', status: 'active', user: 'u1' }] });
        }
        if (u.includes('/memberships/active-organization')) {
          // Return explicit active id and wrapped membership to ensure deterministic behavior
          return Promise.resolve({ data: { success: true, organizationId: 'org-wrapped', membership: { id: 'm2', user: 'u1', organizationId: 'org-wrapped', role: 'member', status: 'active' }, organization: { id: 'org-wrapped', name: 'Wrapped Org' } } });
        }
        if (u.includes('/organizations/org-wrapped')) {
          return Promise.resolve({ data: { organization: { id: 'org-wrapped', name: 'Wrapped Org' } } });
        }
        return Promise.resolve({ data: {} });
      });

      // ensure provider initializes active org deterministically
      localStorage.setItem('clouddocs:activeOrgId', 'org-wrapped');

      function TestConsumerWrapped() {
        const c = React.useContext(OrganizationContextTyped);
        return (
          <div>
            <div data-testid="active-wrapped">{c?.activeOrganization ? c.activeOrganization.id : 'none'}</div>
            <div data-testid="member-wrapped">{c?.membership?.role ?? 'none'}</div>
          </div>
        );
      }

      function CaptureWrapped() {
        const c = React.useContext(OrganizationContextTyped);
        return (
          <div>
            <TestConsumerWrapped />
            <button onClick={() => { void c?.fetchOrganizations(); }}>Fetch Orgs Wrapped</button>
            <button onClick={() => { 
              mockPost.mockResolvedValueOnce({ status: 200, data: {} });
              mockGet.mockResolvedValueOnce({ data: { organization: { id: 'org-wrapped', name: 'Wrapped Org' } } });
              void c?.setActiveOrganization('org-wrapped'); 
            }}>Set Active Wrapped</button>
          </div>
        );
      }

      await act(async () => {
        render(<OrganizationProvider><CaptureWrapped /></OrganizationProvider>);
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Fetch Orgs Wrapped'));
      });
      
      await act(async () => {
        fireEvent.click(screen.getByText('Set Active Wrapped'));
      });

      await waitFor(() => expect(screen.getByTestId('active-wrapped').textContent).toBe('org-wrapped'), { timeout: 3000 });
      await waitFor(() => expect(screen.getByTestId('member-wrapped').textContent).toBe('member'), { timeout: 2000 });
    });

    it('tries multiple fallbacks and clears active org when none found', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url === '/memberships/my-organizations') {
          return Promise.resolve({ data: [{ organization: { id: 'org-other', name: 'Other' }, role: 'viewer' }] });
        }
        if (url === '/memberships/active-organization') {
          return Promise.resolve({ data: { organizationId: 'org-missing' } });
        }
        if (url.includes('/organizations/org-missing')) {
          return Promise.reject(new Error('Not found'));
        }
        return Promise.resolve({ data: {} });
      });
      // Render a consumer that displays the active organization id so we can assert
      function FallbackTestConsumer() {
        const c = React.useContext(OrganizationContextTyped);
        return <div data-testid="active-fallback">{c?.activeOrganization ? c.activeOrganization.id : 'none'}</div>;
      }

      await act(async () => {
        render(<OrganizationProvider><FallbackTestConsumer /></OrganizationProvider>);
      });

      // ensure the consumer rendered and the provider had a chance to validate
      await waitFor(() => expect(screen.getByTestId('active-fallback')).toBeInTheDocument());

      // after fallbacks, active organization should be cleared
      await waitFor(() => {
        expect(screen.getByTestId('active-fallback').textContent).toBe('none');
      }, { timeout: 2000 });
    });
  });

  // ==================== Basic Rendering ====================
  describe('Basic rendering and state', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      localStorage.clear();
    });

    it('renders children and provides context', () => {
      mockGet.mockImplementation(() => Promise.resolve({ data: [] }));
      
      const Consumer = () => {
        const ctx = React.useContext(OrganizationContextTyped);
        return <div data-testid="val">{ctx?.organizations?.length ?? 0}</div>;
      };

      render(
        <OrganizationProvider>
          <Consumer />
        </OrganizationProvider>
      );
      
      expect(screen.getByTestId('val')).toBeInTheDocument();
    });
  });

  // ==================== Organization Management ====================
  describe('Organization management operations', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      localStorage.clear();
    });

    it('clearOrganization clears active organization and localStorage', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url === '/memberships/my-organizations') return Promise.resolve({ data: [] });
        if (url === '/memberships/active-organization') return Promise.resolve({ data: { success: false } });
        return Promise.resolve({ data: {} });
      });

      function Consumer() {
        const ctx = React.useContext(OrganizationContextTyped);
        return (
          <div>
            <button data-testid="clear" onClick={() => { ctx?.clearOrganization(); }}>Clear</button>
            <div data-testid="active">{ctx?.activeOrganization ? ctx.activeOrganization.id : 'none'}</div>
          </div>
        );
      }

      render(
        <OrganizationProvider>
          <Consumer />
        </OrganizationProvider>
      );

      localStorage.setItem('clouddocs:activeOrgId', 'o1');

      act(() => {
        screen.getByTestId('clear').click();
      });

      expect(localStorage.getItem('clouddocs:activeOrgId')).toBeNull();
      expect(screen.getByTestId('active').textContent).toBe('none');
    });

    it('setActiveOrganization optimistic update and persistence', async () => {
      mockPost.mockResolvedValue({ status: 200, data: {} });
      mockGet.mockImplementation((url: string) => {
        if (url === '/memberships/my-organizations') return Promise.resolve({ data: [] });
        if (url === '/memberships/active-organization') return Promise.resolve({ data: { success: false } });
        if (url.includes('/organizations/')) return Promise.resolve({ data: { organization: { id: 'org-42', name: 'Org42' } } });
        return Promise.resolve({ data: {} });
      });

      function Consumer() {
        const ctx = React.useContext(OrganizationContextTyped);
        return (
          <div>
            <div data-testid="active">{ctx?.activeOrganization ? ctx.activeOrganization.id : 'none'}</div>
            <button onClick={() => { void ctx?.setActiveOrganization('org-42'); }}>Set Org</button>
          </div>
        );
      }

      render(
        <OrganizationProvider>
          <Consumer />
        </OrganizationProvider>
      );

      await act(async () => {
        screen.getByText('Set Org').click();
      });

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });

      expect(mockPost).toHaveBeenCalledWith('/memberships/set-active', { organizationId: 'org-42' });
      expect(localStorage.getItem('clouddocs:activeOrgId')).toBe('org-42');
      expect(screen.getByTestId('active').textContent).toBe('org-42');
    });
  });

  // ==================== Optimistic Updates ====================
  describe('Optimistic setActiveOrganization', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      localStorage.clear();
    });

    it('sets active organization optimistically and updates with canonical data on success', async () => {
      mockPost.mockResolvedValue({ status: 200 });
      mockGet.mockImplementation((url: string) => {
        if (url === '/organizations/org-1') {
          return Promise.resolve({ data: { organization: { id: 'org-1', name: 'Org One' } } });
        }
        if (url === '/memberships/my-organizations') {
          return Promise.resolve({ data: [] });
        }
        if (url === '/memberships/active-organization') {
          return Promise.resolve({ data: { success: false } });
        }
        return Promise.resolve({ data: null });
      });

      function TestConsumer() {
        const ctx = React.useContext(OrganizationContextTyped);
        const activeOrganization = ctx?.activeOrganization;
        const setActiveOrganization = ctx?.setActiveOrganization;
        return (
          <div>
            <div data-testid="active-org">active:{activeOrganization?.id ?? 'null'}</div>
            <button onClick={() => { setActiveOrganization?.('org-1').catch(() => {}); }}>switch</button>
          </div>
        );
      }

      await act(async () => {
        render(
          <OrganizationProvider>
            <TestConsumer />
          </OrganizationProvider>
        );
      });

      await waitFor(() => expect(screen.getByTestId('active-org')).toHaveTextContent('active:null'));

      await act(async () => {
        fireEvent.click(screen.getByText('switch'));
      });

      await waitFor(() => expect(localStorage.getItem('clouddocs:activeOrgId')).toBe('org-1'));
      await waitFor(() => expect(screen.getByTestId('active-org')).toHaveTextContent('active:org-1'));
    });

    it('rolls back and shows toast when server request fails', async () => {
      mockPost.mockRejectedValueOnce(new Error('network'));
      mockGet.mockImplementation((url: string) => {
        if (url === '/memberships/my-organizations') return Promise.resolve({ data: [] });
        if (url === '/memberships/active-organization') return Promise.resolve({ data: { success: false } });
        return Promise.resolve({ data: null });
      });

      const removeSpy = jest.spyOn(Storage.prototype, 'removeItem');

      function TestConsumer() {
        const ctx = React.useContext(OrganizationContextTyped);
        const activeOrganization = ctx?.activeOrganization;
        const setActiveOrganization = ctx?.setActiveOrganization;
        return (
          <div>
            <div data-testid="active-org">active:{activeOrganization?.id ?? 'null'}</div>
            <button onClick={() => { setActiveOrganization?.('org-1').catch(() => {}); }}>switch</button>
          </div>
        );
      }

      await act(async () => {
        render(
          <OrganizationProvider>
            <TestConsumer />
          </OrganizationProvider>
        );
      });

      await act(async () => {
        fireEvent.click(screen.getByText('switch'));
      });

      await waitFor(() => expect(showToastMock).toHaveBeenCalled());
      expect(localStorage.getItem('clouddocs:activeOrgId')).toBe(null);
      expect(removeSpy).toHaveBeenCalled();
    });
  });

  // ==================== Additional Coverage Tests ====================
  describe('Additional coverage tests', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      localStorage.clear();
    });

    it('hasRole returns false when membership is null', async () => {
      mockGet.mockImplementation(() => Promise.resolve({ data: [] }));
      
      function Consumer() {
        const ctx = React.useContext(OrganizationContextTyped);
        const hasAdminRole = ctx?.hasRole(['admin', 'owner']) ?? false;
        return <div data-testid="has-role">{hasAdminRole ? 'true' : 'false'}</div>;
      }

      await act(async () => {
        render(
          <OrganizationProvider>
            <Consumer />
          </OrganizationProvider>
        );
      });

      expect(screen.getByTestId('has-role').textContent).toBe('false');
    });

    it('refreshOrganization handles error gracefully', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url.includes('/organizations/')) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ data: [] });
      });

      function Consumer() {
        const ctx = React.useContext(OrganizationContextTyped);
        return (
          <div>
            <button onClick={() => ctx?.refreshOrganization?.('org-fail').catch(() => {})}>refresh</button>
            <div data-testid="error">{ctx?.error?.message ?? 'none'}</div>
          </div>
        );
      }

      await act(async () => {
        render(
          <OrganizationProvider>
            <Consumer />
          </OrganizationProvider>
        );
      });

      await act(async () => {
        fireEvent.click(screen.getByText('refresh'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error').textContent).toContain('Network error');
      });
    });

    it('fetchOrganizations handles network error and sets error state', async () => {
      mockGet.mockImplementation((url: string) => {
        if (url === '/memberships/my-organizations') {
          return Promise.reject(new Error('Fetch failed'));
        }
        return Promise.resolve({ data: [] });
      });

      function Consumer() {
        const ctx = React.useContext(OrganizationContextTyped);
        return (
          <div>
            <button onClick={() => ctx?.fetchOrganizations?.().catch(() => {})}>fetch</button>
            <div data-testid="error-state">{ctx?.error?.message ?? 'none'}</div>
          </div>
        );
      }

      await act(async () => {
        render(
          <OrganizationProvider>
            <Consumer />
          </OrganizationProvider>
        );
      });

      await act(async () => {
        fireEvent.click(screen.getByText('fetch'));
      });

      await waitFor(() => {
        expect(screen.getByTestId('error-state').textContent).toContain('Fetch failed');
      }, { timeout: 2000 });
    });
  });
});
